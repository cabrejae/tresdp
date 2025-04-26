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

app.get("/nombre-producto", async (req, res) => {
  const { product_id, variation_id } = req.query;

  try {
    let nombre = "";

    if (variation_id) {
      // Buscar el nombre de la variación
      const [rows] = await pool.query(
        `SELECT p.post_title AS parent_title, v.post_title AS variation_title
         FROM wpot_posts v
         JOIN wpot_posts p ON v.post_parent = p.ID
         WHERE v.ID = ?`,
        [variation_id]
      );

      if (rows.length > 0) {
        nombre = `${rows[0].parent_title} - ${rows[0].variation_title}`;
      }
    } else {
      // Buscar solo por product_id
      const [rows] = await pool.query(
        `SELECT post_title FROM wpot_posts WHERE ID = ?`,
        [product_id]
      );

      if (rows.length > 0) {
        nombre = rows[0].post_title;
      }
    }

    res.json({ success: true, nombre });
  } catch (error) {
    console.error("Error al obtener nombre del producto:", error);
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

  app.get("/todos-los-productos", async (req, res) => {
  try {
    const [rows] = await pool.query("CALL SP_ObtenerTodosLosProductos()");
    res.json({ success: true, result: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
  


  // Ruta principal
app.get("/", (req, res) => {
    res.send("¡API funcionando!");
});

//  Costo de Productos
app.get("/costos-productos", async (req, res) => {
  try {
    const [rows] = await pool.query("CALL SP_ObtenerCostosProductos()");
    res.json({ success: true, result: rows[0] });
  } catch (error) {
    console.error("Error al obtener costos:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

//Guarda el costo del producto
app.post("/guardarCostoProducto", async (req, res) => {
  const { product_id, variation_id, cantidad, unidades, envio, npedido, costo_aduana, n_precio_producto } = req.body;

  if (!product_id) {
    return res.status(400).json({ success: false, message: "Falta el ID del producto" });
  }

  try {
    await pool.query(`
      INSERT INTO tresdp_precio_productos (product_id, variation_id, cantidad, unidades, envio, npedido, costo_aduana, n_precio_producto, fecha)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
      ON DUPLICATE KEY UPDATE
        cantidad = VALUES(cantidad),
        unidades = VALUES(unidades),
        envio = VALUES(envio),
        npedido = VALUES(npedido),
        costo_aduana = VALUES(costo_aduana),
        n_precio_producto = VALUES(n_precio_producto),
        fecha = CURDATE()
    `, [product_id, variation_id, cantidad, unidades, envio, npedido, costo_aduana, n_precio_producto]);

    res.json({ success: true });
  } catch (error) {
    console.error("Error al guardar costo producto:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Iniciar servidor
app.listen(PORT, () => console.log(`✅ Servidor corriendo en http://localhost:${PORT}`));

