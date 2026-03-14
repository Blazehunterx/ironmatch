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

    setItem: (key: string, value: string): boolean => {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            if (e instanceof Error && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                console.warn('LocalStorage quota exceeded. Pruning non-essential data...');
                
                // 1. Remove non-essential keys first
                NON_ESSENTIAL_KEYS.forEach(k => {
                    if (k !== key) { // Don't remove the key we just tried to set if it was non-essential
                        localStorage.removeItem(k);
                    }
                });

                // 2. Try again for the critical item
                try {
                    localStorage.setItem(key, value);
                    return true;
                } catch (retryError) {
                    console.error('Critical storage failure after pruning:', retryError);
                    // 3. Fallback: Clear everything if even pruning didn't work (extreme case)
                    // We don't do this by default as it logs the user out, but we might have to if key is auth related
                    if (key.includes('auth') || key === 'ironmatch_user') {
                        localStorage.clear();
                        localStorage.setItem(key, value);
                        return true;
                    }
                    return false;
                }
            }
            return false;
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
