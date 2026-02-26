export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Professional';
export type MatchStatus = 'pending' | 'accepted' | 'declined';

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
