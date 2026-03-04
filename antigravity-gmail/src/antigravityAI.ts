// --- Antigravity AI: The Haki Oracle Brain ---
// In a real scenario, this would connect to the Antigravity LLM API.
// For this implementation, we provide high-fidelity AI logic.

export type ReportShift = 'Morning' | 'Afternoon' | 'Evening';

export interface AISuggestion {
    summary: string;
    tactics: Array<{ type: string; text: string }>;
    toneMatch: string;
}

export interface StyleMemory {
    averageLength: number;
    preferredSalutations: string[];
    useEmojis: boolean;
    commonPhrases: string[];
}

let tacticalStyleMemory: StyleMemory = {
    averageLength: 150,
    preferredSalutations: ["Hi", "Hello"],
    useEmojis: true,
    commonPhrases: ["Thanks", "Best regards"]
};

let manualAlliesMemory = new Set<string>();
let manualRoguesMemory = new Set<string>();

export const antigravityAI = {
    async learnFromSentSignals(sentEmails: any[]) {
        if (!sentEmails || sentEmails.length === 0) return;

        // Basic heuristic learning from the Captain's past successes
        const totalLength = sentEmails.reduce((acc, e) => acc + (e.snippet?.length || 0), 0);
        tacticalStyleMemory.averageLength = totalLength / sentEmails.length;

        const hasEmojis = sentEmails.some(e => /[\u{1F300}-\u{1F9FF}]/u.test(e.snippet || ''));
        tacticalStyleMemory.useEmojis = hasEmojis;

        console.log("// STYLE MEMORY UPDATED: Oracle has harvested", sentEmails.length, "successful signals.");
    },

    syncManualClassifications(allies: Set<string>, rogues: Set<string>) {
        manualAlliesMemory = allies;
        manualRoguesMemory = rogues;
        console.log("// HAKI MEMORY UPDATED: Manual tactical patterns synced.");
    },

    async analyzeEmail(subject: string, snippet: string, from: string, body: string): Promise<AISuggestion> {
        const fullContent = (subject + " " + snippet + " " + body).toLowerCase();

        // --- Deep Signal Analysis ---
        const senderName = from.split('<')[0].trim().replace(/"/g, '');

        // Rejection Detection (No Collaboration possible)
        const isRejection = fullContent.includes('won\'t be able to move forward') ||
            fullContent.includes('not onboarding') ||
            fullContent.includes('strictly focus on organic') ||
            fullContent.includes('don\'t provide product feeds');

        const isSkool = fullContent.includes('skool') || fullContent.includes('retention');

        // Extract technical constraints for the Captain's acknowledgment
        const constraints = [];
        if (fullContent.includes('google ads')) constraints.push('Google Ads policy');
        if (fullContent.includes('product feeds')) constraints.push('product feed requirements');

        const constraintSignal = constraints.length > 0 ? constraints.join(' and ') : 'the current requirements';

        // --- Style Mirroring Protocol ---
        const salutation = tacticalStyleMemory.preferredSalutations[0] || "Hi";
        const closing = tacticalStyleMemory.commonPhrases[0] || "Best regards";
        const lengthSignal = tacticalStyleMemory.averageLength < 100 ? "concise" : "detailed";
        console.log(`// TACTICAL GEN: Drafting ${lengthSignal} signal mirroring Captain's style.`);

        return {
            summary: isRejection
                ? `// SIGNAL ANALYSIS: Collaboration not possible. Barrier: ${constraintSignal}. Priority: ARCHIVE.`
                : isSkool
                    ? `// STRATEGIC ALERT: Skool 'Retention Deep Dive' inquiry detected. Priority: CRITICAL.`
                    : `// STATUS SCAN: Standard business signal.`,
            tactics: [
                {
                    type: 'Navigator',
                    text: isRejection
                        ? `${salutation} ${senderName},\n\nThank you for the update. I understand that ${constraintSignal} on your end mean we can't move forward with a collaboration at this time. I'll leave it for now and wish you the best of luck with your current setup. ${closing}.`
                        : isSkool
                            ? `${salutation} ${senderName},\n\nRegarding the Skool Retention Deep Dive, I've received your request. I'm currently auditing the onboarding flow and will have a Loom recording ready for you by the end of the day. Talk soon.`
                            : `${salutation} ${senderName},\n\nThanks for your message. I've received the details and will review how this fits into our roadmap. I'll reach out if I have any further questions. ${closing}.`
                },
                {
                    type: 'Swordsman',
                    text: isRejection
                        ? `${salutation} ${senderName},\n\nThanks for letting me know. I understand the constraints regarding ${constraintSignal}. We'll leave it here for now. All the best.`
                        : isSkool
                            ? `${salutation} ${senderName},\n\nConfirmed. The Skool audit is prioritized. I'm focusing on the retention leaks now—expect the Loom vid shortly. Thanks.`
                            : `${salutation} ${senderName},\n\nReceived. I've reviewed the parameters and am moving this to the next stage. I'll update you as soon as there's a resolution. Efficient and handled.`
                },
                {
                    type: 'Monkey',
                    text: isRejection
                        ? `Hey ${senderName}! Thanks for the quick update! Totally understand the policy with ${constraintSignal}. No worries at all! I'll leave it for now and hope everything goes great on your side. Have a good one! ${tacticalStyleMemory.useEmojis ? '😊' : ''}`
                        : isSkool
                            ? `Hey ${senderName}! So excited to dive into the Skool project! I'm recordin' the Loom right now—can't wait to show you what I found. Keep being awesome! ${tacticalStyleMemory.useEmojis ? '🚀' : ''}`
                            : `Hey ${senderName}! Hope you're doing well! Got your message—everything looks great. I'm on it and will ping you once I have more info. Have a blast! ${tacticalStyleMemory.useEmojis ? '✨' : ''}`
                }
            ],
            toneMatch: isRejection ? "Professional & Resigned" : isSkool ? "Helpful & Strategic" : "Direct & Friendly"
        };
    },

    async researchContext(query: string): Promise<string> {
        // Simulated autonomous research 
        // Data harvested from local ig_config.json
        if (query.toLowerCase().includes('skool') || query.toLowerCase().includes('retention')) {
            return "[INTEL]: The Captain is running 'Retention Deep Dives' for Skool group owners. Goal: Audit onboarding flows to reduce churn via Loom videos.";
        }
        if (query.toLowerCase().includes('priceradar')) {
            return "[INTEL]: PriceRadar is the Captain's B2B e-commerce platform. Current focus: Automating outreach and lead enrichment.";
        }
        return "[INTEL]: No specific local intelligence found on this topic.";
    },

    triageSignal(subject: string, snippet: string, body: string, fromEmail: string): { isNoise: boolean; reason?: string } {
        const noiseKeywords = [
            'unsubscribed', 'newsletter', 'promotion', 'marketing', 'no-reply', 'noreply',
            'transactional', 'receipt', 'invoice', 'shipping update', 'tracking number'
        ];

        const combined = (subject + ' ' + snippet + ' ' + body).toLowerCase();
        const foundKeyword = noiseKeywords.find(kw => combined.includes(kw));

        if (foundKeyword) {
            return { isNoise: true, reason: `Identified as ${foundKeyword} (Noise)` };
        }

        // Check for "Useless" patterns (very short snippets with no action verbs)
        if (snippet.length < 50 && !snippet.includes('?') && !snippet.match(/(review|check|send|audit|meeting|call|respond)/i)) {
            return { isNoise: true, reason: "Non-actionable snippet (Low Signal)" };
        }

        if (manualRoguesMemory.has(fromEmail)) {
            return { isNoise: true, reason: "Identified as ROGUE (Manual Classification)" };
        }

        return { isNoise: false };
    },

    generateHakiReport(emails: any[], shift: ReportShift): string {
        const actionRequired = emails.filter(e => e.category === 'Action Required');
        const awaiting = emails.filter(e => e.category === 'Awaiting Response');

        const timeGreeting = shift === 'Morning' ? "🌅 Morning Intel Brief" : shift === 'Afternoon' ? "☀️ Afternoon Status Log" : "🌙 Evening Final Scan";

        if (actionRequired.length === 0 && awaiting.length === 0) {
            return `${timeGreeting}\n\nThe Grand Line is quiet, Captain. No critical signals detected in the current sector. All quiet on the bridge.`;
        }

        let report = `${timeGreeting}\n\n`;

        if (actionRequired.length > 0) {
            report += `⚠️ CRITICAL TARGETS (${actionRequired.length}):\n`;
            actionRequired.slice(0, 3).forEach(e => {
                report += `• ${e.from}: ${e.subject.substring(0, 40)}${e.subject.length > 40 ? '...' : ''}\n`;
            });
            if (actionRequired.length > 3) report += `• ...and ${actionRequired.length - 3} more.\n`;
            report += '\n';
        }

        if (awaiting.length > 0) {
            report += `🧭 PENDING COURIERS (${awaiting.length}):\n`;
            awaiting.slice(0, 2).forEach(e => {
                report += `• ${e.from}: Response pending.\n`;
            });
        }

        report += `\nStrategic Advice: ${actionRequired.length > 2 ? "Prioritize the red pulses. The fleet is waiting for orders." : "Steady as she goes. Clean up the minor logs and prepare for the next shift."}`;

        return report;
    },

    /**
     * Auto-Categorize: Assign smart labels to emails
     */
    categorizeEmail(subject: string, body: string, fromEmail: string): SmartLabel {
        const text = `${subject} ${body}`.toLowerCase();
        const domain = fromEmail.split('@')[1]?.toLowerCase() || '';

        // Finance signals
        if (/invoice|payment|billing|receipt|transaction|refund|subscription|order confirm|betaling|factuur/.test(text) ||
            /paypal|stripe|bank|finance|revenue/.test(domain)) {
            return 'Finance';
        }

        // Partnership / collaboration signals
        if (/partnership|collaborate|proposal|opportunity|affiliate|commission|referral|samenwerk/.test(text) ||
            /awin|partner|affiliate/.test(domain)) {
            return 'Partnerships';
        }

        // Operations / technical signals
        if (/server|deploy|build|update|release|maintenance|bug|error|api|database|hosting/.test(text) ||
            /vercel|github|netlify|aws|google/.test(domain)) {
            return 'Operations';
        }

        // Support / customer service
        if (/support|ticket|help|issue|complaint|request|question|problem/.test(text) ||
            /support|helpdesk|zendesk|freshdesk/.test(domain)) {
            return 'Support';
        }

        // Newsletter / marketing
        if (/unsubscribe|newsletter|weekly digest|update|announcement|no-?reply/.test(text) ||
            /newsletter|noreply|no-reply|marketing|mailchimp|substack/.test(domain)) {
            return 'Newsletter';
        }

        // Marketing / sales
        if (/promo|discount|offer|deal|sale|limited time|exclusive|free trial|demo/.test(text)) {
            return 'Marketing';
        }

        // Personal (common personal email domains)
        if (['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'live.com', 'icloud.com'].includes(domain)) {
            return 'Personal';
        }

        if (manualAlliesMemory.has(fromEmail)) return 'Business'; // Or whatever default we want, but Action Required is handled in App.tsx

        return 'Business';
    },

    /**
     * Commander Intelligence: Process natural language orders
     */
    async processCommand(text: string, context: { emails: any[], allies: any[], contactProfiles: any }): Promise<{ text: string; action?: { type: string; payload: any } }> {
        const input = text.toLowerCase();

        // 1. Draft Command
        if (input.includes('draft') || input.includes('write')) {
            const targetMatch = text.match(/(?:to|for)\s+([A-Z][a-z]+)/);
            const target = targetMatch ? targetMatch[1] : 'the recipient';
            const topic = text.split(/about|regarding/i)[1]?.trim() || 'the matter discussed';

            return {
                text: `Acknowledged, Captain. Preparing a strategic draft for ${target} regarding ${topic}. I've opened the transmission bay.`,
                action: {
                    type: 'draft',
                    payload: {
                        to: target === 'the recipient' ? '' : target,
                        subject: `Strategic Update: ${topic}`,
                        body: `Hi ${target},\n\nI'm writing to discuss ${topic}.\n\n[AI Suggesion: Tailor this further based on your specific goals.]\n\nBest regards,\nMarvin`
                    }
                }
            };
        }

        // 2. Clean/Purge Command
        if (input.includes('clean') || input.includes('purge') || input.includes('garbage')) {
            const noise = context.emails.filter(e => e.isNoise);
            if (noise.length === 0) {
                return { text: "The sector is clear, Captain. No noise detected in the current transmission stream." };
            }
            return {
                text: `Scanning... I've identified ${noise.length} noise signals (low-priority/spam). Shall I execute the purge?`,
                action: { type: 'purge', payload: { count: noise.length } }
            };
        }

        // 3. Status/Report Command
        if (input.includes('status') || input.includes('report') || input.includes('situation')) {
            const report = this.generateHakiReport(context.emails, 'Afternoon');
            return { text: `COMMAND REPORT:\n\n${report}` };
        }

        // 4. Ally/Alignment Command
        if (input.includes('ally') || input.includes('important')) {
            const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            if (emailMatch) {
                return {
                    text: `Alignment updated. ${emailMatch[0]} is now recognized as a Fleet Ally. Their future signals will be prioritized.`,
                    action: { type: 'align', payload: { email: emailMatch[0], status: 'ally' } }
                };
            }
            return { text: "Please specify the email address of the entity you wish to align with the fleet." };
        }

        // 5. General Conversation / Help
        if (input.includes('help') || input.includes('what can you do')) {
            return {
                text: "I am Antigravity, your Strategic Signal Interpreter. You can order me to:\n" +
                    "• 'Draft an email to [Name] about [Topic]'\n" +
                    "• 'Clean my inbox' (Bulk purge noise)\n" +
                    "• 'Give me a status report'\n" +
                    "• 'Make [email] an ally'\n" +
                    "• Ask questions about your contacts or signals."
            };
        }

        return {
            text: "Orders received, Captain. I'm standing by for specific tactical instructions."
        };
    }
};

export type SmartLabel = 'Finance' | 'Partnerships' | 'Operations' | 'Support' | 'Newsletter' | 'Marketing' | 'Personal' | 'Business';

export const smartLabelColors: Record<SmartLabel, { bg: string; text: string; border: string }> = {
    Finance: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    Partnerships: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
    Operations: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
    Support: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    Newsletter: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
    Marketing: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
    Personal: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    Business: { bg: 'bg-white/5', text: 'text-slate-400', border: 'border-white/10' },
};
