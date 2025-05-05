
# 🧾 Proyecto: Gestión de Stock y Costos

## ✅ Checklist General

### 🏗️ Estructura Base
- [x] Carpeta `frontend` con React + Vite (puerto 5173)
- [x] Carpeta `backend` con Express (puerto 5000)
- [x] Comunicación entre frontend y backend funcionando
- [x] Conexión a la base de datos remota de Kinsta
- [x] Repositorio Git en uso

---

### 📦 Gestión de Stock
- [x] Vista "Productos con bajo stock" conectada a WooCommerce (umbral mínimo)
- [x] Vista para agregar pedidos pendientes (tabla `wpot_pending_orders`)
- [x] Grilla con productos bajo stock, botón para cargar pedido
- [x] SP para obtener productos con stock bajo
- [x] SP para insertar pedidos
- [x] SP para eliminar pedidos recibidos

---

### 📋 Gestión de Pedidos Pendientes
- [x] Tabla `wpot_pending_orders` creada
- [x] Vista que muestra los pedidos cargados
- [x] Botón "Eliminar" por fila (usa SP)
- [x] Vista adicional que muestra todos los productos (no solo bajo stock)

---

### 💸 Gestión de Costos de Productos
- [x] Nueva opción de menú: "Costos de productos"
- [x] Tabla `tresdp_precio_productos` creada (con campos: producto, cantidad, unidades, envío, aduana, etc.)
- [x] Clave primaria compuesta por `product_id` y `variation_id`
- [x] Inputs editables por fila
- [x] Botón "Guardar" que actualiza o inserta registros
- [x] SP `SP_ObtenerCostosProductos` implementado
- [x] Cálculo de `costo_unidad`, `costo_ml`, `costo_ml2` usando `tresdp_parametros`
- [x] Uso de `nvalor` por ID (1: factor ajuste, 2: ML, 3: ML2)

---

## ❗To-do / Pendientes

### 🔄 Interfaz & lógica
- [ ] Validación de campos al guardar costos
- [ ] Feedback visual al guardar (ej: ícono verde o mensaje "guardado")
- [ ] Control de errores en frontend al guardar/leer datos
- [ ] Indicador de carga (spinners) al consultar datos

### 🔐 Seguridad / Backend
- [ ] Sanitizar inputs en backend
- [ ] Implementar control de acceso (login local o token, opcional si es solo local)

### 📈 Mejoras futuras (sugeridas)
- [ ] Exportar productos con bajo stock a Excel o CSV
- [ ] Historial de pedidos ingresados
- [ ] Reporte de evolución de costos por producto
- [ ] Agregar soporte multiusuario si crece el sistema
- [ ] Pruebas automatizadas básicas (unitarias/backend)
