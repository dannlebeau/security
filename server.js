const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg'); // Importa el cliente de PostgreSQL

const app = express();
const port = 3000;

// Configura la conexión a PostgreSQL
const pool = new Pool({
    user: 'postgres',         // Reemplaza con tu usuario de PostgreSQL
    host: 'localhost',           // La dirección de tu servidor PostgreSQL
    database: 'mapadeldelito',   // Nombre de tu base de datos
    password: '3022',   // Reemplaza con tu contraseña de PostgreSQL
    port: 5432,                  // Puerto de PostgreSQL (por defecto 5432)
});

// Usamos body-parser para manejar solicitudes JSON
app.use(bodyParser.json());

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname))); // Para acceder a index.html directamente

// Ruta para manejar el guardado de puntos
app.post('/savePoint', async (req, res) => {
    const { title, description, lat, lng, timestamp } = req.body;
    console.log('Punto recibido:', { title, description, lat, lng, timestamp });

    // Guardar el punto en la base de datos
    try {
        const query = `
            INSERT INTO puntos (title, description, lat, lng, date)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await pool.query(query, [title, description, lat, lng, timestamp]);
        res.json({ success: true, message: 'Punto guardado correctamente' });
    } catch (error) {
        console.error('Error al guardar el punto en la base de datos:', error);
        res.status(500).json({ success: false, message: 'Error al guardar el punto en la base de datos' });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
