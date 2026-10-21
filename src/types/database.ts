export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Professional';
export type MatchStatus = 'pending' | 'accepted' | 'declined';
export type FitnessDiscipline = 'Powerlifting' | 'Bodybuilding' | 'CrossFit' | 'Hyrox' | 'General Fitness';

export type Goal =
    | 'Workout Buddy'
    | 'Socialize'
    | 'Get Pushed'
    | 'Learn'
    | 'Train for Competition'
    | 'Lose Weight'
    | 'Recovery Partner'
    | 'Cardio Partner';

export type BodyPart =
    | 'Chest'
    | 'Back'
    | 'Shoulders'
    | 'Arms'
    | 'Legs'
    | 'Core'
    | 'Glutes'
    | 'Full Body';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type TimeBlock = 'Morning' | 'Afternoon' | 'Evening';

export interface AvailabilitySlot {
    day: DayOfWeek;
    blocks: TimeBlock[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    home_gym: string;
    home_gym_name?: string;
    fitness_level: FitnessLevel;
    reliability_streak: number;
    profile_image_url: string;
    bio: string;
    is_trainer?: boolean;
    goals?: Goal[];
    sub_goals?: BodyPart[];
    availability?: AvailabilitySlot[];
    weight_kg?: number;
    height_cm?: number;
    unit_preference?: 'lbs' | 'kg';
    discipline?: FitnessDiscipline;
    xp?: number;
    friends?: string[];
    big4?: {
        bench: number;
        squat: number;
        deadlift: number;
        ohp: number;
    };
    is_training?: boolean;
    training_status?: string;
    last_active_at?: string;
    unlocked_cosmetics?: string[];
    active_cosmetic_frame?: string;
    active_cosmetic_color?: string;
    active_graph_skin?: string;
    squad_id?: string;
    squad_tag?: string;
    country?: string;
    is_admin?: boolean;
    verification_status?: 'none' | 'pending' | 'verified';
    is_founding_trainer?: boolean;
    trainer_license_url?: string;
    followers_count?: number;
    following_count?: number;
    is_following?: boolean;
    revolut_tag?: string;
    payout_iban?: string;
    pending_balance?: number;
    is_pro?: boolean;
    pro_tier?: 'free' | 'pro_monthly' | 'pro_annual' | 'lifetime';
    pro_expires_at?: string;
}

export interface Purchase {
    id: string;
    user_id: string;
    item_id: string;
    item_name: string;
    item_type: 'plan' | 'subscription' | 'cosmetic';
    price_usd: number;
    payment_method: 'card' | 'xp' | 'google_play' | 'apple_pay';
    trainer_id?: string;
    trainer_cut_usd?: number;
    platform_fee_usd?: number;
    status: 'completed' | 'refunded' | 'pending';
    created_at: string;
}

export interface Follow {
    follower_id: string;
    following_id: string;
    created_at: string;
}

export interface Story {
    id: string;
    author_id: string;
    media_url: string;
    media_type: 'image' | 'video';
    content?: string;
    created_at: string;
    expires_at: string;
    profiles?: {
        name: string;
        profile_image_url: string;
    };
}

export interface Match {
    id: string;
    requester_id: string;
    recipient_id: string;
    status: MatchStatus;
    message: string;
    created_at: string;
}

export interface Gym {
    id: string;
    name: string;
    location: string;
    member_count: number;
    lat: number;
    lng: number;
    owner_id?: string;
    is_verified_gym?: boolean;
}

export interface GymWar {
    id: string;
    gym_1_id: string;
    gym_2_id: string;
    status: 'pending' | 'active' | 'completed' | 'declined';
    start_date?: string;
    end_date?: string;
    winner_id?: string;
    battle_type: 'volume';
    created_at: string;
}

export interface GroupSession {
    id: string;
    trainer_id: string;
    gym_id: string;
    title: string;
    description?: string;
    workout_plan_id?: string;
    start_time: string;
    status: 'active' | 'completed';
    join_code: string;
    created_at: string;
}

export interface SessionParticipant {
    session_id: string;
    user_id: string;
    joined_at: string;
    profiles?: {
        name: string;
        profile_image_url: string;
    };
}

export interface SquadMember {
    user_id: string;
    name: string;
    avatar_url: string;
    country: string; // e.g. "NL", "ID", "US", "GB"
    gym_name?: string;
    weight_kg?: number;
    big4?: { bench: number; squat: number; deadlift: number; ohp: number };
    total_kg: number;
    bw_multiplier: number;
    role: 'captain' | 'member';
}

export interface GymSquad {
    id: string;
    name: string;
    tag: string; // 3-5 chars, e.g. "NL-TITAN", "IRON", "APEX"
    join_code: string;
    captain_id: string;
    captain_name: string;
    members: SquadMember[];
    max_members: number; // 2 for Duo, up to 4 for Full Squad
    total_score: number; // Combined BW multiplier (e.g. 11.4x BW)
    total_volume_kg: number;
    primary_country: string; // e.g. "NL", "GLOBAL", "US"
    rank_tier: 'Bronze' | 'Silver' | 'Cobalt' | 'Gold' | 'Legend';
    created_at: string;
}

export interface SpotBeacon {
    id: string;
    user_id: string;
    user_name: string;
    avatar_url: string;
    gym_id: string;
    gym_name: string;
    exercise: string;
    current_weight: number;
    unit: 'kg' | 'lbs';
    status: 'need_spot' | 'working_in' | 'squad_recruit';
    squad_tag?: string;
    created_at: string;
}

export interface WhiteboardRecord {
    id: string;
    exercise: 'squat' | 'bench' | 'deadlift' | 'ohp';
    weight_kg: number;
    reps: number;
    lifter_id: string;
    lifter_name: string;
    lifter_avatar: string;
    lifter_country: string;
    squad_name?: string;
    squad_tag?: string;
    gym_id?: string;
    gym_name?: string;
    scope: 'facility' | 'national' | 'global';
    verified_at: string;
}

export interface Post {
    id: string;
    author_id: string;
    gym_id: string;
    content: string;
    media_url?: string;
    media_type?: 'image' | 'video';
    is_auto_generated?: boolean;
    is_event?: boolean;
    event_date?: string;
    event_title?: string;
    spots_count?: number;
    created_at: string;
    profiles?: {
        name: string;
        profile_image_url: string;
        verification_status?: string;
    };
}

export interface ExerciseMedia {
    id: string;
    exercise_name: string;
    video_url: string;
    thumbnail_url?: string;
    category?: BodyPart;
    created_at: string;
}

export type ActivityType = 'workout' | 'pr' | 'milestone' | 'match';

export interface GymMessage {
    id: string;
    gym_id: string;
    user_id: string;
    user_name: string;
    user_avatar?: string;
    content: string;
    created_at: string;
}

export interface GymMilestone {
    id: string;
    gym_id: string;
    title: string;
    description: string;
    target_value: number;
    current_value: number;
    unit: string;
    deadline: string;
    type: 'volume' | 'workouts' | 'xp';
    reward_badge?: string;
}

export const ALL_GOALS: Goal[] = [
    'Workout Buddy', 'Socialize', 'Get Pushed', 'Learn',
    'Train for Competition', 'Lose Weight', 'Recovery Partner', 'Cardio Partner'
];

export const ALL_BODY_PARTS: BodyPart[] = [
    'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Glutes', 'Full Body'
];

export const ALL_DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const ALL_TIME_BLOCKS: TimeBlock[] = ['Morning', 'Afternoon', 'Evening'];

// Workout Plan Types
export interface SetDetail {
    setNumber: number;
    reps: number;
    weight: number;
    completed?: boolean;
    rpe?: number; // Rate of Perceived Exertion (6.0 - 10.0)
    suggestedWeight?: number; // Autoregulated progressive overload recommendation
    previousWeight?: number;
    previousReps?: number;
}

export interface WorkoutExercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
    completed?: boolean;
    setDetails?: SetDetail[];
    modality?: 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'smith';
    previousPerformance?: {
        weight: number;
        reps: number;
        rpe?: number;
    };
}

export interface WorkoutPlan {
    id: string;
    name: string;
    author_id: string;
    target: BodyPart;
    exercises: WorkoutExercise[];
    shared: boolean;
    created_at: string;
}

export interface WorkoutLog {
    id: string;
    plan_id: string;
    user_id: string;
    exercises: WorkoutExercise[];
    started_at: string;
    completed_at?: string;
    duration_min?: number;
    created_at?: string;
}

export const EXERCISE_LIBRARY: Record<BodyPart, string[]> = {
    'Chest': ['Bench Press', 'Incline Dumbbell Press', 'Cable Fly', 'Push-ups', 'Dips', 'Pec Deck'],
    'Back': ['Deadlift', 'Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Cable Row', 'T-Bar Row'],
    'Shoulders': ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Face Pull', 'Arnold Press', 'Shrugs'],
    'Arms': ['Barbell Curl', 'Tricep Pushdown', 'Hammer Curl', 'Skull Crushers', 'Preacher Curl', 'Dips'],
    'Legs': ['Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl', 'Leg Extension', 'Calf Raise'],
    'Core': ['Plank', 'Hanging Leg Raise', 'Cable Crunch', 'Russian Twist', 'Ab Rollout', 'Side Plank'],
    'Glutes': ['Hip Thrust', 'Glute Bridge', 'Bulgarian Split Squat', 'Cable Kickback', 'Sumo Deadlift', 'Step-ups'],
    'Full Body': ['Clean & Press', 'Thrusters', 'Burpees', 'Kettlebell Swing', 'Turkish Get-up', 'Man Makers'],
};

export interface ChatMessage {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
    is_voice?: boolean;
}

export interface Duel {
    id: string;
    challenger_id: string;
    opponent_id: string;
    type: 'reps' | 'weight' | 'workouts' | 'custom';
    exercise: string;
    target: string;
    status: 'pending' | 'active' | 'completed' | 'expired';
    challenger_progress: number;
    opponent_progress: number;
    xp_reward: number;
    created_at: string;
    expires_at: string;
    challenger_proof_url?: string;
    opponent_proof_url?: string;
}

export interface Bounty {
    id: string;
    title: string;
    description: string;
    reward_xp: number;
    requirement_type: 'post_video' | 'help_newbie' | 'pr_share' | 'streak_keep';
    status: 'available' | 'claimed' | 'completed';
    created_at?: string;
}
