import axios from 'axios';

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

export interface GmailMessage {
    id: string;
    threadId: string;
    snippet: string;
    payload: {
        headers: Array<{ name: string; value: string }>;
    };
}

export const gmailService = {
    async listMessages(accessToken: string, maxResults = 10, pageToken?: string, q?: string) {
        const response = await axios.get(`${GMAIL_API_BASE}/messages`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { maxResults, pageToken, q }
        });
        return {
            messages: response.data.messages || [],
            nextPageToken: response.data.nextPageToken || null
        };
    },

    async listSentMessages(accessToken: string, maxResults = 50) {
        const response = await axios.get(`${GMAIL_API_BASE}/messages`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { maxResults, q: 'label:SENT' }
        });
        return response.data.messages || [];
    },

    async getMessage(accessToken: string, messageId: string): Promise<GmailMessage> {
        const response = await axios.get(`${GMAIL_API_BASE}/messages/${messageId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    },

    async trashMessage(accessToken: string, messageId: string) {
        const response = await axios.post(`${GMAIL_API_BASE}/messages/${messageId}/trash`, {}, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    },

    async archiveMessage(accessToken: string, messageId: string) {
        const response = await axios.post(`${GMAIL_API_BASE}/messages/${messageId}/modify`, {
            removeLabelIds: ['INBOX']
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    },

    async getAttachment(accessToken: string, messageId: string, attachmentId: string) {
        const response = await axios.get(`${GMAIL_API_BASE}/messages/${messageId}/attachments/${attachmentId}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    },

    async listThreads(accessToken: string, maxResults = 5) {
        const response = await axios.get(`${GMAIL_API_BASE}/threads`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { maxResults }
        });
        return response.data.threads || [];
    },

    async getThread(accessToken: string, threadId: string) {
        const response = await axios.get(`${GMAIL_API_BASE}/threads/${threadId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { format: 'full' }
        });
        return response.data;
    },

    async createDraft(accessToken: string, to: string, subject: string, body: string) {
        const raw = this.createRawEmail(to, subject, body);
        const response = await axios.post(`${GMAIL_API_BASE}/drafts`, {
            message: { raw }
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    },

    async sendMessage(accessToken: string, to: string, subject: string, body: string, threadId?: string, cc?: string) {
        const raw = this.createRawEmail(to, subject, body, threadId, cc);
        const response = await axios.post(`${GMAIL_API_BASE}/messages/send`, {
            raw,
            ...(threadId ? { threadId } : {})
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        return response.data;
    },

    createRawEmail(to: string, subject: string, body: string, threadId?: string, cc?: string) {
        const headers = [
            `To: ${to}`,
            ...(cc ? [`Cc: ${cc}`] : []),
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset="UTF-8"',
        ];

        // If threading is required, we simulate the reply headers
        if (threadId) {
            headers.push(`In-Reply-To: <${threadId}@gmail.com>`);
            headers.push(`References: <${threadId}@gmail.com>`);
        }

        const email = [
            ...headers,
            '',
            body
        ].join('\n');
        return btoa(unescape(encodeURIComponent(email))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    },

    parseHeaders(message: any) {
        const headers = message.payload.headers;
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
        const from = headers.find((h: any) => h.name === 'From')?.value || '(Unknown)';
        const to = headers.find((h: any) => h.name === 'To')?.value || '';
        const cc = headers.find((h: any) => h.name === 'Cc')?.value || '';
        const date = headers.find((h: any) => h.name === 'Date')?.value || '';

        return { subject, from, to, cc, date };
    },

    parseBody(payload: any): string {
        if (!payload) return "";

        let body = this.extractPart(payload, "text/plain");
        if (!body) {
            const htmlBody = this.extractPart(payload, "text/html");
            if (htmlBody) {
                body = this.stripHtml(htmlBody);
            }
        }

        return body || "";
    },

    extractPart(payload: any, mimeType: string): string {
        if (payload.mimeType === mimeType && payload.body && payload.body.data) {
            return this.decodeBase64(payload.body.data);
        }

        if (payload.parts) {
            for (const part of payload.parts) {
                const result = this.extractPart(part, mimeType);
                if (result) return result;
            }
        }

        return "";
    },

    stripHtml(html: string): string {
        // Preserving tactical structure (enters) before stripping
        let text = html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Purge style sheets
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Purge script logs
            .replace(/<br\s*\/?>/gi, '\n') // Tactical breaks
            .replace(/<\/p>/gi, '\n\n') // Paragraph ends
            .replace(/<\/div>/gi, '\n') // Container breaks
            .replace(/<li[^>]*>/gi, '\n• ') // List item signals
            .replace(/<tr[^>]*>/gi, '\n') // Table row signals
            .replace(/<[^>]+>/g, ' '); // Strip remaining tags

        return text
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/[^\S\r\n]+/g, ' ') // Merge horizontal spaces only
            .replace(/\n\s*\n\s*\n+/g, '\n\n') // Prevent orbital-tier spacing
            .trim();
    },

    decodeBase64(data: string): string {
        const decoded = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
        try {
            return decodeURIComponent(escape(decoded));
        } catch (e) {
            return decoded;
        }
    }
};
