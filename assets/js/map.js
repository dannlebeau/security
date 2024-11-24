// Inicialización del mapa centrado en Santiago de Chile
const map = L.map('map').setView([-33.4489, -70.6693], 12); // Coordenadas de Santiago, Chile

// Capa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; Dann LeBeau'
}).addTo(map);

// Capa para los puntos
let pointLayer = L.layerGroup(); // Crea una capa de puntos vacía para agregar marcadores

// Almacén de puntos para generar el control de capas dinámicamente
let points = [];

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

    // Crear marcador con popup de información
    const newPoint = L.marker([lat, lng]).bindPopup(`
        <b>Título<b>:${title}<br>
        <b>Descripción</b>:${description}<br>
        <b>Coordenadas</b>:${lat}, ${lng}<br>
        <b>Fecha</b>:${timestamp}
    `);
      // Agregar el marcador a la capa de puntos
    pointLayer.addLayer(newPoint);

      // Guardar el punto en la lista de puntos para control de capas
    points.push({ title, layer: newPoint });

      // Actualizar el control de capas
    updateLayerControl();

      // Forzar actualización del mapa para que el punto se renderice de inmediato
    map.invalidateSize();

      // Cerrar el popup después de guardar
    map.closePopup();
}

// Función para actualizar el control de capas
function updateLayerControl() {
    // Limpiar el contenido del control de capas
    const layerControlDiv = document.getElementById('layer-control');
    layerControlDiv.innerHTML = '<h3>Control de Capas</h3>'; // Restablecer el encabezado

    // Agregar dinámicamente los puntos al control de capas
    points.forEach((point, index) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `layer${index}`;
        checkbox.checked = true;
        checkbox.addEventListener('change', () => togglePointLayer(index, checkbox.checked));

        const label = document.createElement('label');
        label.innerHTML = point.title;
        label.prepend(checkbox);

        layerControlDiv.appendChild(label);
        layerControlDiv.appendChild(document.createElement('br'));
    });
}

// Función para activar o desactivar un punto en el mapa
function togglePointLayer(index, isChecked) {
    const point = points[index];
    if (isChecked) {
        point.layer.addTo(map);
    } else {
        map.removeLayer(point.layer);
    }
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
