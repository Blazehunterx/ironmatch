async function findNameNear() {
    const coords = { lat: -8.707, lng: 115.178 }; // Sunset Road area
    const radiusMeters = 5000;
    
    const query = `
        [out:json][timeout:20];
        nwr(around:${radiusMeters},${coords.lat},${coords.lng})[name~"Will",i];
        out center;
    `;

    try {
        console.log(`Querying name 'Will' near Sunset Road...`);
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const data = await response.json();
        console.log(`Found ${data.elements?.length || 0} matches.`);
        data.elements.forEach(el => {
            console.log('Match Detail:', {
                name: el.tags.name,
                tags: el.tags
            });
        });
    } catch (err) {
        console.error(err);
    }
}

findNameNear();
