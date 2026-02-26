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
}

export interface Post {
    id: string;
    author_id: string;
    gym_id: string;
    content: string;
    media_url?: string;
    created_at: string;
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
export interface WorkoutExercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
    completed?: boolean;
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
