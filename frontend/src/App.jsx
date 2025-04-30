import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [selectedOption, setSelectedOption] = useState("productos");
  const [data, setData] = useState([]);
  const [inputs, setInputs] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData(selectedOption);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption]);

  const fetchData = async (option = selectedOption) => {
    try {
      const response = await axios.get(`http://localhost:5000/${option}`);
      setData(response.data.result);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setData([]);
    }
  };

  const handleInputChange = (index, field, value) => {
    setInputs((prev) => ({
      ...prev,
      [`${index}-${field}`]: value,
    }));
  };

  const handleGuardarCosto = async (item, index) => {
    const cantidad = inputs[`${index}-cantidad`] || "";
    const unidades = inputs[`${index}-unidades`] || "";
    const envio = inputs[`${index}-costo_envio`] || "";
    const npedido = inputs[`${index}-costo_pedido`] || "";
    const aduana = inputs[`${index}-costo_aduana`] || "";
    const precio = inputs[`${index}-n_precio_producto`] || "";

    if (!cantidad || !unidades || !envio || !npedido || !aduana || !precio) {
      alert("Complete todos los campos antes de guardar.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/guardarCostoProducto", {
        product_id: item.product_id,
        variation_id: item.variation_id,
        cantidad,
        unidades,
        envio,
        npedido,
        costo_aduana: aduana,
        n_precio_producto: precio,
      });

      alert("Costo guardado con éxito.");
      fetchData("costos-productos");
    } catch (err) {
      console.error("Error al guardar costo:", err);
      alert("Error al guardar el costo.");
    }
  };

  const renderCostosProductos = () => (
    <table className="w-full border-collapse border border-gray-300 text-sm">
      <thead className="bg-gray-200">
        <tr>
          <th className="border p-2">ID</th>
          <th className="border p-2">Variación</th>
          <th className="border p-2">Nombre</th>
          <th className="border p-2">Precio</th>
          <th className="border p-2">Cantidad</th>
          <th className="border p-2">Unidades</th>
          <th className="border p-2">Envío</th>
          <th className="border p-2">Pedido</th>
          <th className="border p-2">Aduana</th>
          <th className="border p-2">Costo/Unidad</th>
          <th className="border p-2">Costo ML</th>
          <th className="border p-2">Costo ML 2</th>
          <th className="border p-2">Guardar</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index} className="border">
            <td className="border p-1">{item.product_id}</td>
            <td className="border p-1">{item.variation_id || ""}</td>
            <td className="border p-1">{item.post_title}</td>
            <td className="border p-1">
              <input
                type="number"
                className="w-full border px-1"
                value={inputs[`${index}-n_precio_producto`] ?? item.costo_producto ?? ""}
                onChange={(e) => handleInputChange(index, "n_precio_producto", e.target.value)}
              />
            </td>
            <td className="border p-1">
              <input
                type="number"
                className="w-full border px-1"
                value={inputs[`${index}-cantidad`] ?? item.cantidad ?? ""}
                onChange={(e) => handleInputChange(index, "cantidad", e.target.value)}
              />
            </td>
            <td className="border p-1">
              <input
                type="number"
                className="w-full border px-1"
                value={inputs[`${index}-unidades`] ?? item.unidades ?? ""}
                onChange={(e) => handleInputChange(index, "unidades", e.target.value)}
              />
            </td>
            <td className="border p-1">
              <input
                type="number"
                className="w-full border px-1"
                value={inputs[`${index}-costo_envio`] ?? item.costo_envio ?? ""}
                onChange={(e) => handleInputChange(index, "costo_envio", e.target.value)}
              />
            </td>
            <td className="border p-1">
              <input
                type="number"
                className="w-full border px-1"
                value={inputs[`${index}-costo_pedido`] ?? item.costo_pedido ?? ""}
                onChange={(e) => handleInputChange(index, "costo_pedido", e.target.value)}
              />
            </td>
            <td className="border p-1">
              <input
                type="number"
                className="w-full border px-1"
                value={inputs[`${index}-costo_aduana`] ?? item.costo_aduana ?? ""}
                onChange={(e) => handleInputChange(index, "costo_aduana", e.target.value)}
              />
            </td>
            <td className="border p-1">{item.costo_unidad ?? "-"}</td>
            <td className="border p-1">{item.costo_ml ?? "-"}</td>
            <td className="border p-1">{item.costo_ml2 ?? "-"}</td>
            <td className="border p-1">
              <button
                className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                onClick={() => handleGuardarCosto(item, index)}
              >
                Guardar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-lg font-bold mb-4">Menú</h1>
        <ul className="space-y-2">
          <li
            className={`cursor-pointer p-2 ${selectedOption === "productos" ? "bg-gray-700" : ""}`}
            onClick={() => setSelectedOption("productos")}
          >
            Productos con bajo stock
          </li>
          <li
            className={`cursor-pointer p-2 ${selectedOption === "pedidos-pendientes" ? "bg-gray-700" : ""}`}
            onClick={() => setSelectedOption("pedidos-pendientes")}
          >
            Pedidos pendientes
          </li>
          <li
            className={`cursor-pointer p-2 ${selectedOption === "todos-los-productos" ? "bg-gray-700" : ""}`}
            onClick={() => setSelectedOption("todos-los-productos")}
          >
            Todos los productos
          </li>
          <li
            className={`cursor-pointer p-2 ${selectedOption === "costos-productos" ? "bg-gray-700" : ""}`}
            onClick={() => setSelectedOption("costos-productos")}
          >
            Costos de productos
          </li>
        </ul>
      </aside>
      <main className="flex-grow p-6">
        <h2 className="text-xl font-bold mb-4">
          {{
            productos: "Productos con bajo stock",
            "pedidos-pendientes": "Pedidos pendientes",
            "todos-los-productos": "Todos los productos",
            "costos-productos": "Costos de productos",
          }[selectedOption]}
        </h2>
        <div className="bg-white shadow rounded p-4 overflow-auto max-h-[80vh] text-sm">
          {selectedOption === "costos-productos"
            ? renderCostosProductos()
            : <p>Vista no implementada aquí. Asegúrate de tener la lógica para las demás vistas también.</p>}
        </div>
      </main>
    </div>
  );
}

export default App;
