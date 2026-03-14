import { User } from '../types/database';

/**
 * Helper for timeout-guarded promises
 */
export const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
        )
    ]);
};

/**
 * Convert a Supabase profile row into our User type
 */
export function profileToUser(profile: any): User {
    return {
        id: profile.id,
        name: profile.name || '',
        email: profile.email || '',
        home_gym: profile.home_gym || '',
        home_gym_name: profile.home_gym_name || '',
        fitness_level: profile.fitness_level || 'Beginner',
        reliability_streak: profile.reliability_streak || 0,
        profile_image_url: profile.profile_image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name || 'U'}`,
        bio: profile.bio || '',
        is_trainer: profile.is_trainer || false,
        goals: profile.goals || [],
        sub_goals: profile.sub_goals || [],
        availability: profile.availability || [],
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
        unit_preference: profile.unit_preference || 'lbs',
        discipline: profile.discipline || 'General Fitness',
        xp: profile.xp || 0,
        friends: profile.friends || [],
        big4: profile.big4 || { bench: 0, squat: 0, deadlift: 0, ohp: 0 },
        is_training: profile.is_training || false,
        training_status: profile.training_status || '',
        last_active_at: profile.last_active_at || '',
        is_admin: profile.is_admin || false,
        active_graph_skin: profile.active_graph_skin || 'default',
        verification_status: profile.verification_status || 'none',
        trainer_license_url: profile.trainer_license_url || '',
        revolut_tag: profile.revolut_tag || '',
        payout_iban: profile.payout_iban || '',
        pending_balance: profile.pending_balance || 0,
    };
}
