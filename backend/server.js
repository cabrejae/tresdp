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
        const [rows] = await pool.query("CALL SP_ObtenerProductosBajoStock()");
        res.json({ success: true, result: rows[0] }); // Devuelve todas las filas
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Ruta para guardar el pedido
app.post("/guardarPedido", async (req, res) => {
    try {
      const { product_id, variation_id, order_number , quantity } = req.body;
  
      if (!product_id || !order_number || !quantity) {
        return res.status(400).json({ error: "Faltan datos obligatorios." });
      }
  
      // Llamada al procedimiento almacenado en MySQL
      const [result] = await pool.query(
        "CALL GuardarPedido(?, ?, ?, ?)",
        [product_id, variation_id || null, order_number, quantity]
      );
  
      res.json({ success: true, message: "Pedido guardado correctamente.", result });
    } catch (error) {
      res.status(500).json({ error: "Error interno del servidor." });
    }
  });

  app.get("/pedidos-pendientes", async (req, res) => {
    try {
      const [rows] = await pool.query("CALL SP_ObtenerPedidosPendientes()");
      res.json({ success: true, result: rows[0] }); // El resultado está en rows[0] por ser un SP
    } catch (error) {
      console.error("Error al obtener pedidos pendientes:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete('/eliminarPedido', async (req, res) => {
    const { order_number } = req.body;
    try {
      const conn = await pool.getConnection();
      const result = await conn.query("CALL SP_EliminarPedido(?)", [order_number]);
      conn.release();
      res.json({ success: true, result });
    } catch (err) {
      console.error('Error eliminando pedido:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
  
// Ruta principal
app.get("/", (req, res) => {
    res.send("¡API funcionando!");
});

// Iniciar servidor
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));
