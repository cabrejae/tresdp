require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Importar CORS

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors()); // Habilita CORS para que el frontend pueda hacer peticiones al backend

// Conectar a MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: process.env.DB_waitForConnections === "true",
    connectionLimit: Number(process.env.DB_connectionLimit), // Número de conexiones simultáneas permitidas
    queueLimit: Number(process.env.DB_queueLimit),
    connectTimeout: Number(process.env.DB_connectTimeout) // 20 segundos para evitar desconexión rápida

});

db.connect(err => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('✅ Conectado a MySQL en Kinsta');
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API funcionando 🚀');
});

app.listen(PORT, () => {
    console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});
