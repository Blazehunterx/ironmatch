export interface GeocodeResult {
    lat: number;
    lng: number;
    name: string;
}

/**
 * Uses Nominatim/Photon (Free OpenStreetMap Geocoder) to find coordinates for an address
 */
export async function searchAddress(query: string): Promise<GeocodeResult[]> {
    if (!query || query.length < 3) return [];

    try {
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
        if (!response.ok) throw new Error('Geocoding service error');

        const data = await response.json();
        return data.features.map((f: any) => ({
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            name: [
                f.properties.name,
                f.properties.street,
                f.properties.city,
                f.properties.country
            ].filter(Boolean).join(', ')
        }));
    } catch (err) {
        console.error('Geocoding failed:', err);
        return [];
    }
}
