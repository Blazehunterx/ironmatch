import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Gym } from '../types/database';
import { GeoCoords, getCurrentPosition, haversineDistance } from '../lib/location';

interface GymContextType {
    gyms: Gym[];
    userLocation: GeoCoords | null;
    locationStatus: 'idle' | 'loading' | 'granted' | 'denied';
    isLoadingGyms: boolean;
    addCustomGym: (name: string, location: string) => void;
    refreshGyms: () => void;
    getDistance: (gym: Gym) => number | null;
}

const GymContext = createContext<GymContextType | null>(null);

/**
 * Query OpenStreetMap Overpass API for nearby gyms/fitness centers
 * Completely free, no API key, works worldwide
 */
async function fetchNearbyGyms(coords: GeoCoords, radiusMeters = 5000): Promise<Gym[]> {
    const query = `
        [out:json][timeout:10];
        (
            node["leisure"="fitness_centre"](around:${radiusMeters},${coords.lat},${coords.lng});
            node["sport"="fitness"](around:${radiusMeters},${coords.lat},${coords.lng});
            way["leisure"="fitness_centre"](around:${radiusMeters},${coords.lat},${coords.lng});
            node["leisure"="sports_centre"]["sport"="fitness"](around:${radiusMeters},${coords.lat},${coords.lng});
        );
        out center body;
    `;

    try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (!response.ok) throw new Error('Overpass API error');

        const data = await response.json();

        return data.elements
            .filter((el: any) => el.tags?.name)
            .map((el: any) => ({
                id: `osm-${el.id}`,
                name: el.tags.name,
                location: el.tags['addr:street']
                    ? `${el.tags['addr:street']}${el.tags['addr:housenumber'] ? ' ' + el.tags['addr:housenumber'] : ''}`
                    : el.tags['addr:city'] || el.tags['addr:suburb'] || 'Nearby',
                member_count: Math.floor(Math.random() * 300) + 50, // placeholder
                lat: el.lat || el.center?.lat,
                lng: el.lon || el.center?.lon,
            }))
            .filter((g: Gym) => g.lat && g.lng)
            .slice(0, 15); // cap at 15 nearby gyms
    } catch (err) {
        console.warn('Overpass API failed, using fallback:', err);
        return [];
    }
}

export function GymProvider({ children }: { children: React.ReactNode }) {
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [userLocation, setUserLocation] = useState<GeoCoords | null>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
    const [isLoadingGyms, setIsLoadingGyms] = useState(false);

    // Load user-added gyms from localStorage
    const [customGyms, setCustomGyms] = useState<Gym[]>(() => {
        try {
            const stored = localStorage.getItem('ironmatch_custom_gyms');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Get location + discover gyms on mount
    useEffect(() => {
        setLocationStatus('loading');
        getCurrentPosition()
            .then(async (coords) => {
                setUserLocation(coords);
                setLocationStatus('granted');
                setIsLoadingGyms(true);
                const nearbyGyms = await fetchNearbyGyms(coords);
                setGyms(nearbyGyms);
                setIsLoadingGyms(false);
            })
            .catch(() => {
                setLocationStatus('denied');
            });
    }, []);

    // Combine API gyms + custom gyms, sorted by distance
    const allGyms = [...gyms, ...customGyms].sort((a, b) => {
        if (!userLocation) return 0;
        return haversineDistance(userLocation, { lat: a.lat, lng: a.lng }) -
            haversineDistance(userLocation, { lat: b.lat, lng: b.lng });
    });

    const addCustomGym = useCallback((name: string, location: string) => {
        if (!userLocation) return;
        const newGym: Gym = {
            id: `custom-${Date.now()}`,
            name,
            location,
            member_count: 1,
            lat: userLocation.lat,
            lng: userLocation.lng,
        };
        const updated = [...customGyms, newGym];
        setCustomGyms(updated);
        localStorage.setItem('ironmatch_custom_gyms', JSON.stringify(updated));
    }, [userLocation, customGyms]);

    const refreshGyms = useCallback(async () => {
        if (!userLocation) return;
        setIsLoadingGyms(true);
        const nearbyGyms = await fetchNearbyGyms(userLocation);
        setGyms(nearbyGyms);
        setIsLoadingGyms(false);
    }, [userLocation]);

    const getDistance = useCallback((gym: Gym) => {
        if (!userLocation) return null;
        return haversineDistance(userLocation, { lat: gym.lat, lng: gym.lng });
    }, [userLocation]);

    return (
        <GymContext.Provider value={{
            gyms: allGyms,
            userLocation,
            locationStatus,
            isLoadingGyms,
            addCustomGym,
            refreshGyms,
            getDistance,
        }}>
            {children}
        </GymContext.Provider>
    );
}

export function useGyms() {
    const context = useContext(GymContext);
    if (!context) throw new Error('useGyms must be used within GymProvider');
    return context;
}
