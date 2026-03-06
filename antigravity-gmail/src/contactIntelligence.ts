// Contact Intelligence Module — Relationship Tracker
// Builds profiles from inbox and sent email history

export interface ContactProfile {
    email: string;
    name: string;
    domain: string;
    totalReceived: number;
    totalSent: number;
    lastContactDate: Date | null;
    firstContactDate: Date | null;
    avgResponseTimeHours: number | null;
    relationshipScore: number; // 0-100
    smartLabel: string;
    tags: string[];
}

export interface ContactStore {
    profiles: Record<string, ContactProfile>;
    lastUpdated: string;
}

const STORAGE_KEY = 'hakimail_contacts';

export const contactIntelligence = {

    /**
     * Load contact profiles from localStorage
     */
    loadProfiles(): ContactStore {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                // Rehydrate dates
                Object.values(data.profiles).forEach((p: any) => {
                    if (p.lastContactDate) p.lastContactDate = new Date(p.lastContactDate);
                    if (p.firstContactDate) p.firstContactDate = new Date(p.firstContactDate);
                });
                return data;
            }
        } catch (e) {
            console.error('Error loading contact store:', e);
        }
        return { profiles: {}, lastUpdated: '' };
    },

    /**
     * Save contact profiles to localStorage
     */
    saveProfiles(store: ContactStore): void {
        store.lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    },

    /**
     * Build/update contact profiles from inbox and sent messages
     */
    buildProfiles(
        inboxMessages: Array<{ from: string; fromEmail: string; date: string; subject: string; body: string }>,
        sentMessages: Array<{ to: string; date: string; subject: string }>
    ): ContactStore {
        const store = this.loadProfiles();

        // Process received emails
        inboxMessages.forEach(msg => {
            const email = msg.fromEmail.toLowerCase().trim();
            if (!email || email === 'me') return;

            if (!store.profiles[email]) {
                store.profiles[email] = this.createEmptyProfile(email, msg.from);
            }

            const profile = store.profiles[email];
            profile.totalReceived++;
            profile.name = msg.from || profile.name;

            const msgDate = new Date(msg.date);
            if (!isNaN(msgDate.getTime())) {
                if (!profile.lastContactDate || msgDate > profile.lastContactDate) {
                    profile.lastContactDate = msgDate;
                }
                if (!profile.firstContactDate || msgDate < profile.firstContactDate) {
                    profile.firstContactDate = msgDate;
                }
            }
        });

        // Process sent emails
        sentMessages.forEach(msg => {
            const recipients = msg.to.split(',').map(s => {
                const match = s.match(/<(.+)>/);
                return (match ? match[1] : s).toLowerCase().trim();
            });

            recipients.forEach(email => {
                if (!email || email === 'me') return;

                if (!store.profiles[email]) {
                    store.profiles[email] = this.createEmptyProfile(email, email.split('@')[0]);
                }

                store.profiles[email].totalSent++;
            });
        });

        // Calculate relationship scores
        Object.values(store.profiles).forEach(profile => {
            profile.relationshipScore = this.calculateScore(profile);
            profile.domain = profile.email.split('@')[1] || '';
            profile.smartLabel = this.inferLabel(profile);
        });

        this.saveProfiles(store);
        return store;
    },

    /**
     * Create an empty contact profile
     */
    createEmptyProfile(email: string, name: string): ContactProfile {
        return {
            email,
            name,
            domain: email.split('@')[1] || '',
            totalReceived: 0,
            totalSent: 0,
            lastContactDate: null,
            firstContactDate: null,
            avgResponseTimeHours: null,
            relationshipScore: 0,
            smartLabel: 'Unknown',
            tags: []
        };
    },

    /**
     * Calculate relationship strength score (0-100)
     */
    calculateScore(profile: ContactProfile): number {
        let score = 0;
        const total = profile.totalReceived + profile.totalSent;

        // Volume factor (max 40 points)
        score += Math.min(total * 4, 40);

        // Recency factor (max 30 points)
        if (profile.lastContactDate) {
            const daysSince = (Date.now() - profile.lastContactDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince < 1) score += 30;
            else if (daysSince < 3) score += 25;
            else if (daysSince < 7) score += 20;
            else if (daysSince < 14) score += 15;
            else if (daysSince < 30) score += 10;
            else score += 5;
        }

        // Two-way communication (max 30 points)
        if (profile.totalReceived > 0 && profile.totalSent > 0) {
            const ratio = Math.min(profile.totalReceived, profile.totalSent) / Math.max(profile.totalReceived, profile.totalSent);
            score += Math.round(ratio * 30);
        }

        return Math.min(score, 100);
    },

    /**
     * Infer a smart label from the contact's domain
     */
    inferLabel(profile: ContactProfile): string {
        const domain = profile.domain.toLowerCase();

        if (['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'live.com', 'icloud.com'].includes(domain)) {
            return 'Personal';
        }
        if (domain.includes('bank') || domain.includes('finance') || domain.includes('invoice') || domain.includes('payment')) {
            return 'Finance';
        }
        if (domain.includes('support') || domain.includes('help') || domain.includes('service')) {
            return 'Support';
        }
        if (domain.includes('newsletter') || domain.includes('mail') || domain.includes('noreply') || domain.includes('no-reply')) {
            return 'Newsletter';
        }
        return 'Business';
    },

    /**
     * Get a sorted list of top contacts by relationship score
     */
    getTopContacts(limit = 10): ContactProfile[] {
        const store = this.loadProfiles();
        return Object.values(store.profiles)
            .sort((a, b) => b.relationshipScore - a.relationshipScore)
            .slice(0, limit);
    },

    /**
     * Get a specific contact profile
     */
    getProfile(email: string): ContactProfile | null {
        const store = this.loadProfiles();
        return store.profiles[email.toLowerCase().trim()] || null;
    },

    /**
     * Get relationship strength label
     */
    getStrengthLabel(score: number): { label: string; color: string } {
        if (score >= 80) return { label: 'STRONG ALLY', color: '#E61E2A' };
        if (score >= 60) return { label: 'ACTIVE', color: '#22c55e' };
        if (score >= 40) return { label: 'WARM', color: '#eab308' };
        if (score >= 20) return { label: 'ACQUAINTANCE', color: '#64748b' };
        return { label: 'NEW CONTACT', color: '#334155' };
    }
};
