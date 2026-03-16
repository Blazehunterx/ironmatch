// Using native fetch

async function debugGymSearch(query) {
    try {
        console.log(`Searching for location: ${query}`);
        const geocodeResponse = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.features.length === 0) {
            console.log('No locations found.');
            return;
        }

        const feature = geocodeData.features[0];
        const lat = feature.geometry.coordinates[1];
        const lng = feature.geometry.coordinates[0];
        const locationName = feature.properties.name || feature.properties.city || feature.properties.country;
        
        console.log(`Found location: ${locationName} (${lat}, ${lng})`);

        const radiusMeters = 10000; // 10km
        const overpassQuery = `
            [out:json][timeout:20];
            (
              nwr["leisure"="fitness_centre"](around:${radiusMeters},${lat},${lng});
              nwr["leisure"="gym"](around:${radiusMeters},${lat},${lng});
              nwr["amenity"="gym"](around:${radiusMeters},${lat},${lng});
              nwr["sport"~"fitness|gym|weightlifting|powerlifting|bodybuilding"](around:${radiusMeters},${lat},${lng});
            );
            out center body;
        `;

        console.log('Fetching gyms near coordinates...');
        const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: `data=${encodeURIComponent(overpassQuery)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const overpassData = await overpassResponse.json();
        console.log(`Found ${overpassData.elements.length} gyms nearby.`);
        
        overpassData.elements.slice(0, 5).forEach(el => {
            console.log(`- ${el.tags.name || 'Unnamed Gym'} (${el.lat || el.center?.lat}, ${el.lon || el.center?.lon})`);
        });

    } catch (err) {
        console.error('Debug failed:', err);
    }
}

debugGymSearch('Noordweg, Netherlands');
