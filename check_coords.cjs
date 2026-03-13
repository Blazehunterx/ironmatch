async function checkCoords() {
    const coords = { lat: -8.698, lng: 115.162 }; // Willfitness coords
    const radiusMeters = 50;
    
    const query = `
        [out:json][timeout:20];
        nwr(around:${radiusMeters},${coords.lat},${coords.lng});
        out center;
    `;

    try {
        console.log(`Checking what is at ${coords.lat}, ${coords.lng} in OSM...`);
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const data = await response.json();
        console.log(`Found ${data.elements?.length || 0} elements.`);
        data.elements.forEach(el => {
            if (el.tags) {
                console.log('Element found:', {
                    name: el.tags.name,
                    tags: el.tags
                });
            }
        });
    } catch (err) {
        console.error(err);
    }
}

checkCoords();
