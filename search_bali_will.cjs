async function searchBali() {
    const query = `
        [out:json][timeout:30];
        area["name"="Bali"]->.a;
        nwr["name"~"Will",i](area.a);
        out center;
    `;

    try {
        console.log(`Searching for 'Will' in all of Bali...`);
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
                tags: el.tags,
                coords: el.lat || el.center?.lat ? `${el.lat || el.center?.lat}, ${el.lon || el.center?.lon}` : 'N/A'
            });
        });
    } catch (err) {
        console.error(err);
    }
}

searchBali();
