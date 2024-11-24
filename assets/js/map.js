// Inicialización del mapa centrado en Santiago de Chile
const map = L.map('map').setView([-33.4489, -70.6693], 12); // Coordenadas de Santiago, Chile

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; Dann LeBeau'
}).addTo(map);

// Capa para los puntos
let pointLayer = L.layerGroup().addTo(map); // Aseguramos que los puntos se agreguen a esta capa

// Función para insertar un punto al hacer clic
map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    const timestamp = new Date().toLocaleString(); // Fecha y hora actual

    // Crear popup con formulario para el punto
    const popupContent = `
        <div class="popup-container">
            <h4>Agregar Punto</h4>
            <label>Título:</label><input type="text" id="title" class="popup-input"><br>
            <label>Descripción:</label><textarea id="description" class="popup-input"></textarea><br>
            <label>Coordenadas:</label><input type="text" value="${lat}, ${lng}" class="popup-input" disabled><br>
            <label>Fecha y Hora:</label><input type="text" value="${timestamp}" class="popup-input" disabled><br>
            <button onclick="savePoint(${lat}, ${lng}, '${timestamp}')" class="popup-button">Guardar</button>
        </div>
    `;
    L.popup()
        .setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(map);
});

// Guardar punto y actualizar la capa de puntos
function savePoint(lat, lng, timestamp) {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;

    // Aquí se guardan los datos en la base de datos (usando fetch para conectarse al servidor)
    fetch('/savePoint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title,
            description: description,
            lat: lat,
            lng: lng,
            timestamp: timestamp
        })
    })
    .then(response => response.json())
    .then(data => {
        // Crear marcador con popup de información
        const newPoint = L.marker([lat, lng]).bindPopup(`
            <b>${title}</b><br>${description}<br>${lat}, ${lng}<br>${timestamp}
        `);
        newPoint.addTo(pointLayer); // Agregar al layer de puntos

        // Cerrar popup después de guardar
        map.closePopup();

        // Mostrar el punto en el control de capas
        updateLayerControl();
    })
    .catch(error => console.error('Error al guardar el punto:', error));
}

// Función para actualizar el control de capas
function updateLayerControl() {
    var baseMaps = {
        "Mapa Base": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; Dann LeBeau'
        })
    };

    var overlays = {
        "Puntos": pointLayer // Agregar los puntos a la capa de control
    };

    L.control.layers(baseMaps, overlays).addTo(map);
}

// Exportar datos a GeoJSON
document.getElementById('export-geojson').addEventListener('click', () => {
    const geojsonData = pointLayer.toGeoJSON();
    const blob = new Blob([JSON.stringify(geojsonData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'puntos.geojson';
    link.click();
});

// Exportar datos a CSV
document.getElementById('export-csv').addEventListener('click', () => {
    let csv = 'Título,Descripción,Latitud,Longitud,Fecha\n';
    pointLayer.eachLayer(layer => {
        const lat = layer.getLatLng().lat;
        const lng = layer.getLatLng().lng;
        const title = layer.getPopup().getContent().split('<b>')[1].split('</b>')[0];
        const description = layer.getPopup().getContent().split('<br>')[1];
        const timestamp = layer.getPopup().getContent().split('Fecha y Hora:')[1].split('<br>')[0].trim();
        csv += `"${title}","${description}",${lat},${lng},"${timestamp}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'puntos.csv';
    link.click();
});
