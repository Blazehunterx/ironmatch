import { Geolocation } from '@capacitor/geolocation';

export interface GeoCoords {
    lat: number;
    lng: number;
}

export const MAX_VERIFICATION_DISTANCE_KM = 0.2; // 200 meters

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function haversineDistance(a: GeoCoords, b: GeoCoords): number {
    const R = 6371; // Earth radius in km
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    if (km < 10) return `${km.toFixed(1)}km`;
    return `${Math.round(km)}km`;
}

/**
 * Get current user position via Capacitor Geolocation (Native & Browser)
 * Includes explicit permission check to ensure native prompt on Android/iOS.
 */
export async function getCurrentPosition(): Promise<GeoCoords> {
    try {
        // Check permissions first
        const check = await Geolocation.checkPermissions();
        
        if (check.location === 'denied') {
            const request = await Geolocation.requestPermissions();
            if (request.location === 'denied') {
                throw new Error('Location permission denied by user');
            }
        } else if (check.location === 'prompt' || check.location === 'prompt-with-rationale') {
            await Geolocation.requestPermissions();
        }

        const coordinates = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000
        });
        
        return {
            lat: coordinates.coords.latitude,
            lng: coordinates.coords.longitude
        };
    } catch (err) {
        console.error('Location Error:', err);
        throw err;
    }
}
/**
 * Validates if the user is within the required radius of a gym to participate
 * in verified activities or Gym Wars.
 */
export async function verifyGymPresence(gymLat: number, gymLng: number): Promise<boolean> {
    try {
        const userPos = await getCurrentPosition();
        const distance = haversineDistance(userPos, { lat: gymLat, lng: gymLng });
        return distance <= MAX_VERIFICATION_DISTANCE_KM;
    } catch (e) {
        console.warn('Failed to verify presence:', e);
        return false;
    }
}
