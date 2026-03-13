async function searchGlobal() {
    const query = `
        [out:json][timeout:20];
        nwr["name"~"Willfitness|Will Fitness",i];
        out center;
    `;

    try {
        console.log(`Searching globally for Willfitness...`);
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const data = await response.json();
        console.log(`Found ${data.elements?.length || 0} global matches.`);
        if (data.elements?.length > 0) {
            data.elements.forEach(el => {
                console.log('Match Found:', {
                    name: el.tags.name,
                    id: el.id,
                    type: el.type,
                    tags: el.tags,
                    lat: el.lat || el.center?.lat,
                    lng: el.lon || el.center?.lon
                });
            });
        }
    } catch (err) {
        console.error('Search Error:', err);
    }
}

searchGlobal();
