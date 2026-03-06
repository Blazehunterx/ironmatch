/**
 * Utility to calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in meters
}

/**
 * Checks if a user is within a certain distance of a gym
 */
export function isNearGym(userLat: number, userLng: number, gymLat: number, gymLng: number, radiusMeters: number = 200): boolean {
    if (!userLat || !userLng || !gymLat || !gymLng) return false;
    const distance = calculateDistance(userLat, userLng, gymLat, gymLng);
    return distance <= radiusMeters;
}
