const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Usamos body-parser para manejar solicitudes JSON
app.use(bodyParser.json());

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname))); // Para acceder a index.html directamente

// Ruta para manejar el guardado de puntos
app.post('/savePoint', (req, res) => {
    const { title, description, lat, lng, timestamp } = req.body;
    console.log('Punto recibido:', { title, description, lat, lng, timestamp });

    // Aquí puedes agregar lógica para guardar el punto (por ejemplo, en una base de datos)

    // Responder con éxito
    res.json({ success: true, point: { title, description, lat, lng, timestamp } });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
