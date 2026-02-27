const coords = { lat: -8.409518, lng: 115.188916 }; // Bali center approx
const radiusMeters = 20000;

const query = `
    [out:json][timeout:15];
    (
        node["leisure"="fitness_centre"](around:${radiusMeters},${coords.lat},${coords.lng});
        node["sport"="fitness"](around:${radiusMeters},${coords.lat},${coords.lng});
        way["leisure"="fitness_centre"](around:${radiusMeters},${coords.lat},${coords.lng});
        node["leisure"="sports_centre"]["sport"="fitness"](around:${radiusMeters},${coords.lat},${coords.lng});
        node["leisure"="gym"](around:${radiusMeters},${coords.lat},${coords.lng});
        way["leisure"="gym"](around:${radiusMeters},${coords.lat},${coords.lng});
        node["amenity"="gym"](around:${radiusMeters},${coords.lat},${coords.lng});
        way["amenity"="gym"](around:${radiusMeters},${coords.lat},${coords.lng});
        node["sport"="gym"](around:${radiusMeters},${coords.lat},${coords.lng});
    );
    out center body;
`;

fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
})
    .then(res => res.json())
    .then(data => {
        console.log(`Found ${data.elements?.length || 0} gyms`);
        if (data.elements?.length) {
            console.log(data.elements.slice(0, 3).map(e => e.tags.name));
        }
    })
    .catch(err => console.error(err));
