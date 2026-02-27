import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Gym } from '../types/database';
import { GeoCoords, getCurrentPosition, haversineDistance } from '../lib/location';
import { mockGyms as fallbackGyms } from '../lib/mock';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface GymContextType {
    gyms: Gym[];
    userLocation: GeoCoords | null;
    locationStatus: 'idle' | 'loading' | 'granted' | 'denied';
    isLoadingGyms: boolean;
    addCustomGym: (name: string, location: string, lat?: number, lng?: number) => Promise<string>;
    refreshGyms: () => void;
    searchRadius: number;
    setSearchRadius: (km: number) => void;
    getDistance: (gym: Gym) => number | null;
    findGym: (id: string) => Gym | undefined;
}

const GymContext = createContext<GymContextType | null>(null);

/**
 * Query OpenStreetMap Overpass API for nearby gyms/fitness centers
 */
async function fetchNearbyGyms(coords: GeoCoords, radiusMeters = 50000): Promise<Gym[]> {
    // Broaden query to include nwr (Node, Way, Relation) and more tags
    const query = `
        [out:json][timeout:20];
        (
          nwr["leisure"="fitness_centre"](around:${radiusMeters},${coords.lat},${coords.lng});
          nwr["leisure"="gym"](around:${radiusMeters},${coords.lat},${coords.lng});
          nwr["amenity"="gym"](around:${radiusMeters},${coords.lat},${coords.lng});
          nwr["sport"="fitness"](around:${radiusMeters},${coords.lat},${coords.lng});
          nwr["sport"="gym"](around:${radiusMeters},${coords.lat},${coords.lng});
          nwr["leisure"="sports_centre"](around:${radiusMeters},${coords.lat},${coords.lng});
        );
        out center body;
    `;

    try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (!response.ok) throw new Error(`Overpass API error: ${response.status}`);

        const data = await response.json();
        const gyms = data.elements
            .filter((el: any) => el.tags?.name)
            .map((el: any) => ({
                id: `osm-${el.id}`,
                name: el.tags.name,
                location: el.tags['addr:street']
                    ? `${el.tags['addr:street']}${el.tags['addr:housenumber'] ? ' ' + el.tags['addr:housenumber'] : ''}`
                    : el.tags['addr:city'] || el.tags['addr:suburb'] || el.tags['addr:district'] || 'Nearby',
                member_count: 0, // Real count will be updated via fetchMemberCounts
                lat: el.lat || el.center?.lat,
                lng: el.lon || el.center?.lon,
            }))
            .filter((g: Gym) => g.lat && g.lng);

        console.debug(`Found ${gyms.length} gyms via Overpass`);
        return gyms.slice(0, 100);
    } catch (err) {
        console.warn('Overpass API failed:', err);
        return [];
    }
}

export function GymProvider({ children }: { children: React.ReactNode }) {
    const [osmGyms, setOsmGyms] = useState<Gym[]>([]);
    const [customGyms, setCustomGyms] = useState<Gym[]>([]);
    const [userLocation, setUserLocation] = useState<GeoCoords | null>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
    const [isLoadingGyms, setIsLoadingGyms] = useState(false);
    const [searchRadius, setSearchRadius] = useState(50); // Default 50km

    // Fetch custom gyms from Supabase
    const fetchDBGyms = useCallback(async () => {
        if (!isSupabaseConfigured) {
            const stored = localStorage.getItem('ironmatch_custom_gyms');
            if (stored) setCustomGyms(JSON.parse(stored));
            return;
        }

        const { data, error } = await supabase.from('gyms').select('*');
        if (!error && data) {
            setCustomGyms(data);
        }
    }, []);

    // Aggregated member counts from profiles table
    const fetchMemberCounts = useCallback(async (allGymList: Gym[]) => {
        if (!isSupabaseConfigured) return allGymList;

        const { data, error } = await supabase
            .from('profiles')
            .select('home_gym');

        if (error || !data) return allGymList;

        const counts: Record<string, number> = {};
        data.forEach(p => {
            if (p.home_gym) {
                counts[p.home_gym] = (counts[p.home_gym] || 0) + 1;
            }
        });

        return allGymList.map(g => ({
            ...g,
            member_count: counts[g.id] || 0
        }));
    }, []);

    // Get location + discover gyms on mount
    useEffect(() => {
        setLocationStatus('loading');
        getCurrentPosition()
            .then(async (coords) => {
                setUserLocation(coords);
                setLocationStatus('granted');
                setIsLoadingGyms(true);
                const nearby = await fetchNearbyGyms(coords, searchRadius * 1000);
                const withCounts = await fetchMemberCounts(nearby);
                setOsmGyms(withCounts);
                setIsLoadingGyms(false);
            })
            .catch(() => {
                setLocationStatus('denied');
            });

        fetchDBGyms().then(async () => {
            // After DB gyms fetched, we'll need to update counts if they aren't updated yet
            // This is simplified for now but ensure we call it
        });
    }, [fetchDBGyms, fetchMemberCounts]);

    // Update customGyms with counts whenever customGyms change
    useEffect(() => {
        if (customGyms.length > 0) {
            fetchMemberCounts(customGyms).then(setCustomGyms);
        }
    }, [customGyms.length, fetchMemberCounts]);

    // Combine API gyms + custom gyms, sorted by distance
    const allGyms = [...osmGyms, ...customGyms].sort((a, b) => {
        if (!userLocation) return 0;
        return haversineDistance(userLocation, { lat: a.lat, lng: a.lng }) -
            haversineDistance(userLocation, { lat: b.lat, lng: b.lng });
    });

    const addCustomGym = useCallback(async (name: string, location: string, lat?: number, lng?: number) => {
        const newId = `custom-${Date.now()}`;
        const newGym: Gym = {
            id: newId,
            name,
            location,
            member_count: 0,
            lat: lat ?? userLocation?.lat ?? 0,
            lng: lng ?? userLocation?.lng ?? 0,
        };

        if (isSupabaseConfigured) {
            const { error } = await supabase.from('gyms').insert({
                id: newId,
                name,
                location,
                lat: newGym.lat,
                lng: newGym.lng,
                created_by: (await supabase.auth.getUser()).data.user?.id
            });
            if (error) {
                console.warn('DB Gym insert error:', error);
                throw error;
            }
            await fetchDBGyms();
        } else {
            const updated = [...customGyms, newGym];
            setCustomGyms(updated);
            localStorage.setItem('ironmatch_custom_gyms', JSON.stringify(updated));
        }

        return newId;
    }, [userLocation, customGyms, fetchDBGyms]);

    const refreshGyms = useCallback(async () => {
        if (!userLocation) return;
        setIsLoadingGyms(true);
        const nearby = await fetchNearbyGyms(userLocation, searchRadius * 1000);
        setOsmGyms(nearby);
        fetchDBGyms();
        setIsLoadingGyms(false);
    }, [userLocation, fetchDBGyms, searchRadius]);

    const getDistance = useCallback((gym: Gym) => {
        if (!userLocation) return null;
        return haversineDistance(userLocation, { lat: gym.lat, lng: gym.lng });
    }, [userLocation]);

    const findGym = useCallback((id: string): Gym | undefined => {
        const gym = allGyms.find(g => g.id === id) || fallbackGyms.find(g => g.id === id);
        if (!gym) return undefined;

        // If it's a mock gym, it still has the mock member_count. 
        // We should really be using the real counts for these too if we have them.
        return gym;
    }, [allGyms]);

    return (
        <GymContext.Provider value={{
            gyms: allGyms,
            userLocation,
            locationStatus,
            isLoadingGyms,
            addCustomGym,
            refreshGyms,
            searchRadius,
            setSearchRadius,
            getDistance,
            findGym,
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
