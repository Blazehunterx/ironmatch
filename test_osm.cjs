async function testOSM() {
    const coords = { lat: -8.718, lng: 115.171 }; // Poppies Lane I
    const radiusMeters = 50000; // Increased to 50km just to be sure
    
    const query = `
        [out:json][timeout:20];
        (
          nwr["leisure"="fitness_centre"](around:${radiusMeters},${coords.lat},${coords.lng});
          nwr["leisure"="gym"](around:${radiusMeters},${coords.lat},${coords.lng});
          nwr["amenity"="gym"](around:${radiusMeters},${coords.lat},${coords.lng});
          nwr["sport"~"fitness|gym|weightlifting|powerlifting|bodybuilding"](around:${radiusMeters},${coords.lat},${coords.lng});
        );
        out center body;
    `;

    try {
        console.log(`Querying OSM for gyms near ${coords.lat}, ${coords.lng}...`);
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const data = await response.json();
        const gyms = data.elements
            .filter((el) => el.tags?.name)
            .map((el) => ({
                name: el.tags.name,
                id: el.id,
                tags: el.tags
            }));

        console.log(`Found ${gyms.length} gyms.`);
        const searchTerms = ['willfitness', 'will fitness', 'will', 'will-fitness'];
        const matches = gyms.filter(g => 
            searchTerms.some(term => g.name.toLowerCase().includes(term))
        );

        if (matches.length > 0) {
            console.log('Matches FOUND:', matches.map(m => m.name));
            console.log('First Match Detail:', matches[0]);
        } else {
            console.log('Willfitness NOT FOUND in results.');
            console.log('Gym names found (first 20):');
            console.log(gyms.slice(0, 20).map(g => g.name).join(', '));
        }
    } catch (err) {
        console.error('Test Error:', err);
    }
}

testOSM();
