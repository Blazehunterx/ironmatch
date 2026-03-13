import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';
import { useGyms } from '../context/GymContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Goal, BodyPart, FitnessLevel, FitnessDiscipline, User } from '../types/database';
import { getRankFromLifts } from '../lib/gamification';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Modular Components
import OnboardingProgress from '../components/onboarding/OnboardingProgress';
import PhotoStep from '../components/onboarding/PhotoStep';
import GymStep from '../components/onboarding/GymStep';
import DisciplineStep from '../components/onboarding/DisciplineStep';
import BodyStatsStep from '../components/onboarding/BodyStatsStep';
import Big4Step from '../components/onboarding/Big4Step';
import GoalsStep from '../components/onboarding/GoalsStep';
import FitnessLevelStep from '../components/onboarding/FitnessLevelStep';
import BioStep from '../components/onboarding/BioStep';

const TOTAL_STEPS = 8;

export default function Onboarding() {
    const { user, updateUser, signup } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);

    // Step 0: Photo
    const [profileImage, setProfileImage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step 1: Home Gym
    const { gyms: allGyms, isLoadingGyms, addCustomGym, locationStatus, refreshGyms } = useGyms();
    const [homeGym, setHomeGym] = useState('');
    const [searchGymQuery, setSearchGymQuery] = useState('');

    // Step 2: Discipline
    const [discipline, setDiscipline] = useState<FitnessDiscipline>('General Fitness');

    // Step 3: Body stats
    const [weightKg, setWeightKg] = useState(0);
    const [heightCm, setHeightCm] = useState(0);
    const [unitPref, setUnitPref] = useState<'lbs' | 'kg'>('lbs');

    // Step 4: Big 4
    const [lifts, setLifts] = useState({ bench: 0, squat: 0, deadlift: 0, ohp: 0 });

    // Step 5: Goals
    const [goals, setGoals] = useState<Goal[]>([]);
    const [subGoals, setSubGoals] = useState<BodyPart[]>([]);
    const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('Beginner');

    // Step 7: Bio
    const [bio, setBio] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setProfileImage(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const toggleGoal = (goal: Goal) => {
        setGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : prev.length >= 3 ? prev : [...prev, goal]);
    };

    const toggleSubGoal = (bp: BodyPart) => {
        setSubGoals(prev => prev.includes(bp) ? prev.filter(b => b !== bp) : [...prev, bp]);
    };

    const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)); };
    const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 0)); };
    const skip = () => { goNext(); };

    const finish = async () => {
        const hg = allGyms.find(g => g.id === homeGym);
        const data = {
            profile_image_url: profileImage || 'https://i.pravatar.cc/300',
            home_gym: homeGym || undefined,
            home_gym_name: hg?.name || undefined,
            weight_kg: weightKg || undefined,
            height_cm: heightCm || undefined,
            unit_preference: unitPref,
            discipline,
            big4: lifts.bench || lifts.squat || lifts.deadlift || lifts.ohp ? lifts : undefined,
            goals,
            sub_goals: subGoals,
            fitness_level: fitnessLevel,
            bio,
        };

        let newUserProfile: User | null = null;
        if (user) {
            updateUser(data);
            newUserProfile = { ...user, ...data } as User;
        } else {
            await signup(data);
        }

        if (isSupabaseConfigured) {
            try {
                const { data: owner } = await supabase.from('profiles').select('id').eq('email', 'marvin.2000.sluis@gmail.com').single();
                const recipientId = user?.id || newUserProfile?.id;
                if (owner?.id && recipientId) {
                    await supabase.from('messages').insert({
                        sender_id: owner.id,
                        receiver_id: recipientId,
                        content: `Welcome to IronMatch, ${data.goals.includes('Workout Buddy') ? 'partner' : 'lifter'}! 💪 I'm Marvin, the creator. Glad to have you here. Let's get these gains!`,
                        is_read: false
                    });
                }
            } catch (err) {
                console.warn('Could not send owner welcome message:', err);
            }
        }
        navigate('/');
    };

    const rank = getRankFromLifts(lifts, unitPref);
    const hasAnyLift = lifts.bench > 0 || lifts.squat > 0 || lifts.deadlift > 0 || lifts.ohp > 0;

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
    };

    return (
        <div className="fixed inset-0 bg-oled flex flex-col overflow-hidden">
            <OnboardingProgress step={step} totalSteps={TOTAL_STEPS} onBack={goBack} onSkip={skip} />

            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="absolute inset-0 px-6 pt-4 pb-6 flex flex-col overflow-y-auto"
                    >
                        {step === 0 && <PhotoStep profileImage={profileImage} fileInputRef={fileInputRef} onFileSelect={handleFileSelect} />}
                        {step === 1 && (
                            <GymStep 
                                allGyms={allGyms} homeGym={homeGym} searchGymQuery={searchGymQuery} 
                                isLoadingGyms={isLoadingGyms} locationStatus={locationStatus}
                                onSetHomeGym={setHomeGym} onSearchChange={setSearchGymQuery} 
                                onRefresh={refreshGyms} onAddCustom={async () => {
                                    const name = prompt("Enter Gym Name:");
                                    if (name) {
                                        const id = await addCustomGym(name, "Manually added");
                                        setHomeGym(id);
                                    }
                                }}
                            />
                        )}
                        {step === 2 && <DisciplineStep discipline={discipline} onSetDiscipline={setDiscipline} />}
                        {step === 3 && (
                            <BodyStatsStep 
                                weightKg={weightKg} heightCm={heightCm} unitPref={unitPref}
                                onSetWeight={setWeightKg} onSetHeight={setHeightCm} onSetUnitPref={setUnitPref}
                            />
                        )}
                        {step === 4 && (
                            <Big4Step 
                                lifts={lifts} unitPref={unitPref} rank={rank} hasAnyLift={hasAnyLift} onSetLifts={setLifts}
                            />
                        )}
                        {step === 5 && (
                            <GoalsStep 
                                goals={goals} subGoals={subGoals} onToggleGoal={toggleGoal} onToggleSubGoal={toggleSubGoal}
                            />
                        )}
                        {step === 6 && <FitnessLevelStep fitnessLevel={fitnessLevel} onSetFitnessLevel={setFitnessLevel} />}
                        {step === 7 && (
                            <BioStep 
                                bio={bio} onSetBio={setBio} profileImage={profileImage} currentUser={user} 
                                rank={rank} fitnessLevel={fitnessLevel} goals={goals} 
                                weightKg={weightKg} heightCm={heightCm} hasAnyLift={hasAnyLift}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="px-6 pb-8 pt-3">
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={step === TOTAL_STEPS - 1 ? finish : goNext}
                    className="w-full py-4 rounded-2xl bg-lime text-oled font-black text-sm flex items-center justify-center gap-2 hover:bg-lime/90 transition-all shadow-[0_0_40px_-10px_rgba(50,255,50,0.3)]"
                >
                    {step === TOTAL_STEPS - 1 ? (
                        <>
                            <Zap size={18} /> Let's Go!
                        </>
                    ) : (
                        <>
                            Continue 
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
