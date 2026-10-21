import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface GeoCoords {
    lat: number;
    lng: number;
}

export const MAX_VERIFICATION_DISTANCE_KM = 0.6; // 600 meters (calibrated for indoor concrete gym drift)

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
 * Get current user position via Capacitor Geolocation on native platforms,
 * falling back gracefully to standard browser navigator.geolocation on web.
 */
export async function getCurrentPosition(): Promise<GeoCoords> {
    // 1. Web Fallback to prevent Capacitor "Not implemented on web" crash
    if (Capacitor.getPlatform() === 'web' || typeof window === 'undefined') {
        return new Promise((resolve) => {
            if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    (err) => {
                        console.warn('Browser geolocation fallback notice:', err.message);
                        resolve({ lat: -8.6500, lng: 115.1300 }); // Default Bali gym hub
                    },
                    { enableHighAccuracy: false, timeout: 6000 }
                );
            } else {
                resolve({ lat: -8.6500, lng: 115.1300 });
            }
        });
    }

    // 2. Native Capacitor Geolocation
    try {
        const check = await Geolocation.checkPermissions();
        
        if (check.location === 'denied') {
            const request = await Geolocation.requestPermissions();
            if (request.location === 'denied') {
                return { lat: -8.6500, lng: 115.1300 };
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
        console.warn('Native Location notice, falling back:', err);
        return { lat: -8.6500, lng: 115.1300 };
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
