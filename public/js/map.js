const map = L.map('map').setView([51.505, -0.09], 13);

// Add a tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

let geojsonLayer;



const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Initialize Leaflet Draw with the FeatureGroup
const drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems // Specify the FeatureGroup for editing
    },
    draw: true // Disable drawing tools if you only want editing
});
map.addControl(drawControl);

function addToMap() {
    fetch('/get-geojson')
        .then(response => response.json())
        .then(data => {
            const geojsonLayer = L.geoJSON(data);
            geojsonLayer.eachLayer(function (layer) {
                drawnItems.addLayer(layer); // Add each layer to the FeatureGroup
            });

            // Fit the map's bounds to the GeoJSON layer
            map.fitBounds(drawnItems.getBounds());
        })
        .catch(err => console.error('Error fetching GeoJSON:', err));

}

// Capture edit events and save changes
map.on('draw:edited', function (e) {
    var layers = e.layers;
    layers.eachLayer(function (layer) {
        const updatedGeoJSON = layer.toGeoJSON();
        console.log('Updated GeoJSON:', updatedGeoJSON);

        // Send updated data to the server
        fetch('/update-geojson', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedGeoJSON)
        })
            .then(response => response.json())
            .then(data => {
                console.log('Update successful:', data);
            })
            .catch(error => console.error('Error updating GeoJSON:', error));
    });
});
            // Fetch GeoJSON data from the server
          
