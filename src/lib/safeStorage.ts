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
            if (e instanceof Error && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.message.includes('quota'))) {
                console.warn(`[STORAGE_FULL] Attempting to save ${key} (${Math.round(value.length / 1024)} KB). Pruning...`);
                
                // 1. Prune all non-essential keys first
                NON_ESSENTIAL_KEYS.forEach(k => {
                    localStorage.removeItem(k);
                });

                // 2. Try again
                try {
                    localStorage.setItem(key, value);
                    console.info('[STORAGE_RECOVERED] Successfully saved after pruning non-essential items.');
                    return;
                } catch (retryError) {
                    console.warn('[STORAGE_PRUNE_INSUFFICIENT] Pruning non-essential was not enough.');
                }

                // 3. NUCLEAR OPTION: If this is critical (auth/user), clear EVERYTHING
                if (key.includes('auth') || key.includes('token') || key === 'ironmatch_user') {
                    console.error('[STORAGE_NUCLEAR] Clearing ALL storage to ensure auth persistence.');
                    localStorage.clear();
                    try {
                        localStorage.setItem(key, value);
                        return;
                    } catch (finalError) {
                        console.error('[STORAGE_DEAD] Even nuclear clear failed.');
                    }
                }
                
                // For non-critical data, just ignore the error so the app doesn't crash
                console.error(`[STORAGE_QUOTA_FAIL] Could not save ${key}. Skipping cache.`);
                return;
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
