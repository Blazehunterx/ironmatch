const { execSync } = require('child_process');

console.log('--- IronMatch Mobile Diagnostic ---\n');

function checkTool(name, command, installLink) {
    try {
        execSync(command, { stdio: 'ignore' });
        console.log(`[✅] ${name}: Found`);
        return true;
    } catch (e) {
        console.log(`[❌] ${name}: NOT FOUND`);
        console.log(`    -> Download here: ${installLink}`);
        return false;
    }
}

const javaFound = checkTool('Java (JDK)', 'java -version', 'https://www.oracle.com/java/technologies/downloads/#java17');
const androidFound = checkTool('Android SDK', 'adb --version', 'https://developer.android.com/studio#command-tools');

console.log('\n--- Conclusion ---');
if (javaFound && androidFound) {
    console.log('Your environment is ready! You can run: cd android && ./gradlew assembleDebug');
} else {
    console.log('Please install the missing tools above and restart your terminal.');
}
