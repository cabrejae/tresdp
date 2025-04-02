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

app.get("/productos", async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT 
            p.ID AS product_id, 
            p.post_title AS product_name, 
            COALESCE(s.meta_value, 0) AS stock,
            COALESCE(ls.meta_value, 0) AS low_stock_threshold,
            v.ID AS variation_id,
            COALESCE(vs.meta_value, 0) AS variation_stock,
            po.order_number,
            po.quantity,
            po.order_date
            FROM wpot_posts p
            LEFT JOIN wpot_postmeta s 
                ON p.ID = s.post_id AND s.meta_key = '_stock'
            LEFT JOIN wpot_postmeta ls 
                ON p.ID = ls.post_id AND ls.meta_key = '_low_stock_amount'
           LEFT JOIN wpot_posts v 
                ON p.ID = v.post_parent AND v.post_type = 'product_variation'
            LEFT JOIN wpot_postmeta vs 
                ON v.ID = vs.post_id AND vs.meta_key = '_stock'
            LEFT JOIN wpot_pending_orders po
                ON (p.ID = po.product_id OR v.ID = po.product_id)  -- Relación con productos y variaciones
            WHERE p.post_type = 'product' OR v.post_type = 'product_variation'
            HAVING (stock <= low_stock_threshold OR variation_stock <= low_stock_threshold)`);
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
