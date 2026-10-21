import { supabase } from './supabase';

/**
 * Uploads an image File or Base64 Data URL to a Supabase Storage bucket.
 * Returns the public CDN URL.
 * Falls back gracefully to original string if offline or storage unavailable.
 */
export async function uploadToStorage(
    source: File | string,
    bucket: 'avatars' | 'media' | 'workout-proofs' = 'media',
    folder = 'uploads'
): Promise<string> {
    try {
        let blob: Blob;
        let ext = 'jpg';
        let contentType = 'image/jpeg';

        if (typeof source === 'string') {
            if (!source.startsWith('data:')) {
                // Already a remote CDN / HTTP URL
                return source;
            }
            const mimeMatch = source.match(/data:([^;]+);base64,/);
            contentType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
            ext = contentType.split('/')[1] || 'jpg';
            const base64Data = source.replace(/^data:[^;]+;base64,/, '');
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            blob = new Blob([new Uint8Array(byteNumbers)], { type: contentType });
        } else {
            blob = source;
            contentType = source.type || 'image/jpeg';
            ext = source.name ? source.name.split('.').pop() || 'jpg' : 'jpg';
        }

        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from(bucket).upload(fileName, blob, {
            contentType,
            upsert: true
        });

        if (error) {
            console.warn(`Storage upload to ${bucket} failed:`, error.message);
            return typeof source === 'string' ? source : '';
        }

        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
        return publicUrl;
    } catch (err) {
        console.warn('Storage upload error:', err);
        return typeof source === 'string' ? source : '';
    }
}
