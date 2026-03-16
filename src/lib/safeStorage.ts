/**
 * A safe wrapper for localStorage that handles QuotaExceededError
 * by clearing non-essential caches when storage is full.
 */

const NON_ESSENTIAL_KEYS = [
    'ironmatch_feed_cache',
    'ironmatch_custom_gyms',
    'ironmatch_gym_wars_cache',
    'ironmatch_member_counts'
];

export const safeStorage = {
    getItem: (key: string): string | null => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('Storage accessor failed:', e);
            return null;
        }
    },

    setItem: (key: string, value: string): void => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            if (e instanceof Error && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                console.warn(`[STORAGE_FULL] Attempting to save ${key} (${Math.round(value.length / 1024)} KB). Pruning...`);
                
                // Calculate current size of non-essential data
                let prunedCount = 0;
                NON_ESSENTIAL_KEYS.forEach(k => {
                    if (k !== key && localStorage.getItem(k)) {
                        localStorage.removeItem(k);
                        prunedCount++;
                    }
                });

                if (prunedCount > 0) {
                    console.info(`[STORAGE_PRUNED] Removed ${prunedCount} non-essential items.`);
                    try {
                        localStorage.setItem(key, value);
                        return;
                    } catch (retryError) {
                        console.error('[STORAGE_CRITICAL] Pruning failed to make enough space.');
                    }
                }

                // NUCLEAR OPTION: If this is an auth token or essential user data, we MUST clear everything else.
                if (key.includes('auth') || key.includes('token') || key === 'ironmatch_user') {
                    console.error('[STORAGE_NUCLEAR] Clearing ALL storage to ensure auth persistence.');
                    localStorage.clear();
                    try {
                        localStorage.setItem(key, value);
                        console.info('[STORAGE_RECOVERED] Successfully saved critical key after nuclear clear.');
                        return;
                    } catch (finalError) {
                        console.error('[STORAGE_DEAD] Even nuclear clear could not save key:', key);
                        throw finalError; // Rethrow so the caller (Supabase/Auth) knows we are dead
                    }
                }
                
                // For non-critical data, we just swallow the error or throw to be safe
                throw e;
            }
            throw e; // Non-quota error, throw it
        }
    },

    removeItem: (key: string): void => {
        try {
            localStorage.removeItem(key);
        } catch (e) {}
    },

    clear: (): void => {
        try {
            localStorage.clear();
        } catch (e) {}
    }
};
