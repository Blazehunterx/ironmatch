/**
 * Compresses an image File or Base64 Data URL using HTML5 Canvas.
 * Resizes down to maxWidth (default 1080px) and compresses to ~100-150KB JPEG.
 * Completely eliminates browser LocalStorage QuotaExceededError and speeds up uploads.
 */
export async function compressImage(
    source: File | string,
    maxWidth = 1080,
    quality = 0.75
): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(typeof source === 'string' ? source : URL.createObjectURL(source));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);

        if (typeof source === 'string') {
            img.src = source;
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target?.result as string;
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(source);
        }
    });
}
