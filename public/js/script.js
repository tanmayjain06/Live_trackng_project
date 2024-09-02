const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        console.log('Sending location:', { latitude, longitude });

        // Send latitude and longitude to the server
        socket.emit('location', { latitude, longitude });
    }, (error) => {
        console.error('Error getting location: ', error);
    }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
    });
} else {
    console.log('Geolocation is not supported by this browser.');
}

const map = L.map("map").setView([0, 0], 10);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "openStreetMap"
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    console.log(`Received location for ${id}:`, { latitude, longitude });
    
    map.setView([latitude, longitude], 16);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on("user-disconnected", (id) => {
    console.log(`Removing marker for disconnected user ${id}`);
    
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
