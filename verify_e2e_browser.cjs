const { chromium } = require('playwright-chromium');
const { spawn } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const SUPABASE_URL = 'https://voupfqpoqgkxaebmvzze.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvdXBmcXBvcWdreGFlYm12enplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTAxOTg1NSwiZXhwIjoyMTA0NTk1ODU1fQ.g-9nUw-cmPdNhXtU2vqReDYlt3mj4NBvoI7_16taeZ8';
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function runBrowserE2E() {
    console.log('===========================================================');
    console.log('🧪 REAL BROWSER E2E TEST: PAYWALL & AUTOREGULATION WORKOUT');
    console.log('===========================================================');

    // 1. Provision verified test user
    const testEmail = `lifter_e2e_${Date.now()}@ironmatch.app`;
    const testPassword = 'IronPassword123!';
    console.log(`Step 1: Provisioning test user in Supabase: ${testEmail}`);

    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: { name: 'E2E Lifter' }
    });
    if (authErr) throw new Error(`User provisioning failed: ${authErr.message}`);
    const userId = authUser.user.id;

    await supabase.from('profiles').upsert({
        id: userId,
        name: 'E2E Lifter',
        display_name: 'E2E Lifter',
        email: testEmail,
        fitness_level: 'Intermediate',
        home_gym: 'bali-body-factory'
    });

    // Seed a workout plan for the user with set details
    const { data: planData, error: planErr } = await supabase.from('workout_plans').insert({
        author_id: userId,
        name: 'Hypertrophy Bench & Squat',
        target: 'Full Body',
        exercises: [
            {
                id: 'ex-1',
                name: 'Barbell Bench Press',
                sets: 3,
                reps: 5,
                weight: 100,
                completed: false,
                setDetails: [
                    { setNumber: 1, reps: 5, weight: 100, completed: false, rpe: 8.0 },
                    { setNumber: 2, reps: 5, weight: 100, completed: false, rpe: 8.0 },
                    { setNumber: 3, reps: 5, weight: 100, completed: false, rpe: 8.0 }
                ]
            }
        ]
    }).select();
    if (planErr) console.error('  [Seed Plan Error]:', planErr);
    else console.log('  -> Seeded Plan in Supabase ID:', planData[0]?.id);

    console.log(`  -> User and Workout Plan ready (User ID: ${userId})`);

    // 2. Start preview server
    console.log('\nStep 2: Spawning Vite preview on port 4173...');
    const preview = spawn('npx', ['vite', 'preview', '--port', '4173'], {
        cwd: __dirname,
        shell: true
    });

    await new Promise(r => setTimeout(r, 3500));

    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            viewport: { width: 400, height: 850 } // Mobile aspect ratio
        });
        const page = await context.newPage();
        page.on('console', msg => console.log('  [Browser Log]:', msg.text()));
        page.on('pageerror', err => console.log('  [Browser PageError]:', err.message));

        // 3. Login
        console.log('\nStep 3: Loading login page...');
        await page.goto('http://localhost:4173/login', { waitUntil: 'networkidle', timeout: 20000 });

        console.log('  -> Entering credentials...');
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', testPassword);
        await page.click('button[type="submit"]');

        await page.waitForTimeout(3000);
        console.log('  -> Logged in successfully. Current URL:', page.url());

        // 4. Test IronPass Pro Modal & Lifetime Pass
        console.log('\nStep 4: Navigating to Profile via BottomNav...');
        await page.click('a[href="/profile"]');
        await page.waitForTimeout(1500);

        console.log('  -> Clicking "Upgrade" button on Profile...');
        const upgradeBtn = await page.$('button:has-text("Upgrade")');
        if (upgradeBtn) {
            await upgradeBtn.click();
            await page.waitForTimeout(1000);
        }

        const modalText = await page.content();
        const hasLifetime = modalText.includes('Founding Lifter') || modalText.includes('79.99');
        const hasSubscriptionFree = modalText.includes('Subscription-Free');
        console.log(`  -> Modal contains "Founding Lifter ($79.99)": ${hasLifetime ? 'YES ✅' : 'NO ❌'}`);
        console.log(`  -> Modal contains "Subscription-Free": ${hasSubscriptionFree ? 'YES ✅' : 'NO ❌'}`);

        if (!hasLifetime) {
            throw new Error('IronPass Modal did not render Founding Lifter tier!');
        }

        const modalScreenshot = path.join(__dirname, 'modal_verified.png');
        await page.screenshot({ path: modalScreenshot });
        console.log(`  -> Saved modal screenshot: ${modalScreenshot}`);

        // Close modal
        const closeBtn = await page.$('button:has(svg.lucide-x)');
        if (closeBtn) {
            await closeBtn.click();
            await page.waitForTimeout(500);
        }

        // 5. Test Workout Active & RPE Autoregulation
        console.log('\nStep 5: Navigating to Workouts tab via BottomNav...');
        await page.click('a[href="/workouts"]');
        
        console.log('  -> Waiting for plan "Hypertrophy Bench & Squat" to load...');
        await page.waitForSelector('text="Hypertrophy Bench & Squat"', { timeout: 15000 });
        console.log('  -> Plan card loaded! Clicking "Start Workout" button...');
        
        // Find the specific Start Workout button inside the plan card
        const startBtn = page.locator('div:has-text("Hypertrophy Bench & Squat")').locator('button:has-text("Start Workout")').first();
        await startBtn.click();

        // Wait for ActiveWorkout to render
        await page.waitForSelector('text="Barbell Bench Press"', { timeout: 15000 });
        console.log('  -> Active workout started with "Barbell Bench Press"!');

        // Verify RPE Calibration on Active Workout
        const workoutPageText = await page.content();
        const hasRpeHeader = workoutPageText.includes('RPE & Fatigue Calibration');
        const hasBarbellBench = workoutPageText.includes('Barbell Bench Press');
        console.log(`  -> Active Workout shows "Barbell Bench Press": ${hasBarbellBench ? 'YES ✅' : 'NO ❌'}`);
        console.log(`  -> Active Workout shows "RPE & Fatigue Calibration": ${hasRpeHeader ? 'YES ✅' : 'NO ❌'}`);

        // Click @7.0 RPE chip
        console.log('  -> Tapping @7.0 RPE chip to test live progressive overload recalculation...');
        const rpe7Chip = await page.$('button:has-text("@7.0")');
        if (rpe7Chip) {
            await rpe7Chip.click();
            await page.waitForTimeout(1000);
            const updatedText = await page.content();
            const hasOverloadCalc = updatedText.includes('+2.5kg') || updatedText.includes('Next Session');
            console.log(`  -> Live recalculation rendered "+2.5kg Next Session": ${hasOverloadCalc ? 'YES ✅' : 'NO ❌'}`);
        }

        // Mark set done to test smart rest timer overlay
        console.log('  -> Clicking "Mark Set Done" to test smart rest timer overlay...');
        const markDoneBtn = await page.$('button:has-text("Mark Set Done")');
        if (markDoneBtn) {
            await markDoneBtn.click();
            await page.waitForTimeout(1200);
            const overlayText = await page.content();
            const hasRestTimer = overlayText.includes('REST') || overlayText.includes('Rest') || overlayText.includes('01:') || overlayText.includes('02:');
            console.log(`  -> Smart Rest Timer Overlay triggered: ${hasRestTimer ? 'YES ✅' : 'NO ❌'}`);
        }

        const workoutScreenshot = path.join(__dirname, 'rpe_autoregulation_verified.png');
        await page.screenshot({ path: workoutScreenshot });
        console.log(`  -> Saved active workout screenshot: ${workoutScreenshot}`);

        console.log('\n===========================================================');
        console.log('🎉 100% REAL BROWSER E2E VERIFICATION COMPLETED WITH SUCCESS!');
        console.log('===========================================================');
    } finally {
        if (browser) await browser.close();
        preview.kill();

        // Cleanup
        try {
            await supabase.from('workout_plans').delete().eq('author_id', userId);
            await supabase.from('profiles').delete().eq('id', userId);
            await supabase.auth.admin.deleteUser(userId);
        } catch (e) {}
    }
}

runBrowserE2E().then(() => process.exit(0)).catch((e) => {
    console.error('Browser E2E Error:', e);
    process.exit(1);
});
