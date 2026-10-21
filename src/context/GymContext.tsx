import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { safeStorage } from '../lib/safeStorage';
import { Gym } from '../types/database';
import { GeoCoords, getCurrentPosition, haversineDistance } from '../lib/location';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockGyms } from '../lib/mock';

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
    getActiveWar: (gymId: string) => Promise<any | null>;
    searchGymsByLocation: (lat: number, lng: number) => Promise<void>;
    searchGymsByName: (nameQuery: string) => Promise<Gym[]>;
}

const GymContext = createContext<GymContextType | null>(null);

/**
 * Query OpenStreetMap Overpass API for nearby gyms/fitness centers
 */
async function fetchNearbyGyms(coords: GeoCoords, radiusMeters = 50000): Promise<Gym[]> {
    const query = `
        [out:json][timeout:25];
        (
          nwr["leisure"="fitness_centre"](around:${radiusMeters},${coords.lat},${coords.lng});
          nwr["leisure"="gym"](around:${radiusMeters},${coords.lat},${coords.lng});
          nwr["amenity"="gym"](around:${radiusMeters},${coords.lat},${coords.lng});
          nwr["sport"~"fitness|gym|weightlifting|powerlifting|bodybuilding"](around:${radiusMeters},${coords.lat},${coords.lng});
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
                member_count: 0,
                lat: el.lat || el.center?.lat,
                lng: el.lon || el.center?.lon,
            }))
            .filter((g: Gym) => g.lat && g.lng);

        return gyms.slice(0, 300);
    } catch (err) {
        console.warn('Overpass API failed, using cached/preloaded:', err);
        return [];
    }
}

export function GymProvider({ children }: { children: React.ReactNode }) {
    const [osmGyms, setOsmGyms] = useState<Gym[]>([]);
    const [customGyms, setCustomGyms] = useState<Gym[]>([]);
    const [userLocation, setUserLocation] = useState<GeoCoords | null>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
    const [isLoadingGyms, setIsLoadingGyms] = useState(false);
    const [searchRadius, setSearchRadius] = useState(50); // 50km

    // Fetch custom gyms from local storage + Supabase
    const fetchDBGyms = useCallback(async () => {
        let loaded: Gym[] = [];
        try {
            const stored = safeStorage.getItem('ironmatch_custom_gyms');
            if (stored) loaded = JSON.parse(stored);
        } catch { /* storage fallback */ }

        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase.from('gyms').select('*');
                if (!error && data && data.length > 0) {
                    const merged = [...loaded];
                    data.forEach((dg: Gym) => {
                        if (!merged.some(m => m.id === dg.id)) merged.push(dg);
                    });
                    loaded = merged;
                }
            } catch (err) {
                console.warn('Supabase gym fetch error:', err);
            }
        }

        setCustomGyms(loaded);
    }, []);

    // Aggregated member counts from profiles table
    const fetchMemberCounts = useCallback(async (allGymList: Gym[]) => {
        if (!isSupabaseConfigured) return allGymList;

        try {
            const { data, error } = await supabase.from('profiles').select('home_gym');
            if (error || !data) return allGymList;

            const counts: Record<string, number> = {};
            data.forEach(p => {
                if (p.home_gym) counts[p.home_gym] = (counts[p.home_gym] || 0) + 1;
            });

            return allGymList.map(g => ({
                ...g,
                member_count: counts[g.id] || g.member_count || 0
            }));
        } catch {
            return allGymList;
        }
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
                setIsLoadingGyms(false);
            });

        fetchDBGyms();
    }, [fetchDBGyms, fetchMemberCounts, searchRadius]);

    // Combine custom gyms + API gyms + worldwide mock gyms catalog
    const allGyms = [...osmGyms, ...customGyms, ...mockGyms].reduce((acc: Gym[], g: Gym) => {
        if (!acc.some(existing => existing.id === g.id || existing.name.toLowerCase() === g.name.toLowerCase())) {
            acc.push(g);
        }
        return acc;
    }, []).sort((a, b) => {
        if (!userLocation) return (b.member_count || 0) - (a.member_count || 0);
        return haversineDistance(userLocation, { lat: a.lat, lng: a.lng }) -
            haversineDistance(userLocation, { lat: b.lat, lng: b.lng });
    });

    const addCustomGym = useCallback(async (name: string, location: string, lat?: number, lng?: number) => {
        const newId = `custom-${Date.now()}`;
        const newGym: Gym = {
            id: newId,
            name: name.trim(),
            location: location.trim(),
            member_count: 1,
            lat: lat ?? userLocation?.lat ?? -8.6534,
            lng: lng ?? userLocation?.lng ?? 115.1321,
        };

        // Always save to safeStorage immediately so it's indestructible
        const updated = [newGym, ...customGyms];
        setCustomGyms(updated);
        try {
            safeStorage.setItem('ironmatch_custom_gyms', JSON.stringify(updated));
        } catch { /* full */ }

        if (isSupabaseConfigured) {
            try {
                const user = (await supabase.auth.getUser()).data.user;
                await supabase.from('gyms').insert({
                    id: newId,
                    name: newGym.name,
                    location: newGym.location,
                    lat: newGym.lat,
                    lng: newGym.lng,
                    created_by: user?.id
                });
            } catch (err) {
                console.warn('Supabase DB gym insert offline fallback:', err);
            }
        }

        return newId;
    }, [userLocation, customGyms]);

    const refreshGyms = useCallback(async () => {
        if (!userLocation) {
            fetchDBGyms();
            return;
        }
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
        return allGyms.find(g => g.id === id);
    }, [allGyms]);

    const getActiveWar = useCallback(async (gymId: string) => {
        if (!isSupabaseConfigured) return null;
        try {
            const { data, error } = await supabase
                .from('gym_wars')
                .select('*')
                .or(`gym_1_id.eq.${gymId},gym_2_id.eq.${gymId}`)
                .eq('status', 'active')
                .single();

            if (error) return null;
            return data;
        } catch {
            return null;
        }
    }, []);

    const searchGymsByLocation = useCallback(async (lat: number, lng: number) => {
        setIsLoadingGyms(true);
        const center = { lat, lng };
        const nearby = await fetchNearbyGyms(center, searchRadius * 1000);
        const withCounts = await fetchMemberCounts(nearby);
        setOsmGyms(withCounts);
        setIsLoadingGyms(false);
    }, [searchRadius, fetchMemberCounts]);

    const searchGymsByName = useCallback(async (nameQuery: string): Promise<Gym[]> => {
        if (!nameQuery || nameQuery.length < 2) return allGyms;

        const lower = nameQuery.toLowerCase();
        const localMatches = allGyms.filter(g =>
            g.name.toLowerCase().includes(lower) ||
            g.location.toLowerCase().includes(lower)
        );

        // If local matches exist, return them immediately
        if (localMatches.length >= 3) return localMatches;

        // Try OpenStreetMap Nominatim for live global search
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(nameQuery + ' gym')}&format=json&limit=8`);
            if (res.ok) {
                const results = await res.json();
                const externalGyms: Gym[] = results.map((item: any) => ({
                    id: `nom-${item.place_id}`,
                    name: item.display_name.split(',')[0],
                    location: item.display_name.split(',').slice(1, 3).join(',').trim(),
                    member_count: 0,
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon),
                }));
                return [...localMatches, ...externalGyms];
            }
        } catch { /* offline */ }

        return localMatches;
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
            getActiveWar,
            searchGymsByLocation,
            searchGymsByName
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
