import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
//const PORT = process.env.PORT || 5000
const PORT = process.env.PORT

app.use(express.json()); // Para leer JSON en requests
app.use(cors()); // Habilita CORS (útil si frontend y backend están separados)

// Ruta de prueba para verificar conexión a la base de datos
app.get("/test", async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT p.ID, p.post_title AS nombre, s.meta_value AS stock
            FROM wpot_posts p
            JOIN wpot_postmeta s ON p.ID = s.post_id
            WHERE p.post_type = 'product' AND s.meta_key = '_stock'
        `);
        res.json({ success: true, result: rows }); // Devuelve todas las filas
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Ruta principal
app.get("/", (req, res) => {
    res.send("¡API funcionando!");
});

// Iniciar servidor
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
