// 🔄 MISMA CABECERA
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
  });

  useEffect(() => {
    const product_id = inputs["new-product_id"];
    const variation_id = inputs["new-variation_id"];

    if (product_id) {
      const fetchNombre = async () => {
        try {
          const res = await axios.get("http://localhost:5000/nombre-producto", {
            params: {
              product_id,
              variation_id: variation_id || "",
            },
          });
          if (res.data.success) {
            setInputs((prev) => ({
              ...prev,
              "new-nombre_producto": res.data.nombre,
            }));
          }
        } catch (err) {
          console.error("Error al obtener nombre:", err);
        }
      };

      fetchNombre();
    } else {
      setInputs((prev) => ({
        ...prev,
        "new-nombre_producto": "",
      }));
    }
  }, [inputs]);

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

  const handleSaveAll = async () => {
    const registrosAGuardar = data
      .map((item, index) => {
        const codigoPedido = inputs[`${index}-codigoPedido`];
        const cantidad = inputs[`${index}-cantidad`];

        if (codigoPedido && cantidad) {
          return {
            product_id: item.product_id,
            variation_id: item.variation_id,
            order_number: codigoPedido,
            quantity: cantidad,
            index,
          };
        }
        return null;
      })
      .filter(Boolean);

    if (registrosAGuardar.length === 0) {
      alert("No hay registros con datos para guardar.");
      return;
    }

    setIsSaving(true);
    try {
      for (const pedido of registrosAGuardar) {
        await axios.post("http://localhost:5000/guardarPedido", {
          product_id: pedido.product_id,
          variation_id: pedido.variation_id,
          order_number: pedido.order_number,
          quantity: pedido.quantity,
        });

        setInputs((prev) => ({
          ...prev,
          [`${pedido.index}-codigoPedido`]: "",
          [`${pedido.index}-cantidad`]: "",
        }));
      }

      alert("Pedidos guardados correctamente.");
      await fetchData();
    } catch (error) {
      console.error("Error al guardar pedidos:", error);
      alert("Ocurrió un error al guardar los pedidos.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (item, index) => {
    const codigoPedido = inputs[`${index}-codigoPedido`] || "";
    const cantidad = inputs[`${index}-cantidad`] || "";

    if (!codigoPedido || !cantidad) {
      alert("Debe completar todos los campos.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/guardarPedido", {
        product_id: item.product_id,
        variation_id: item.variation_id,
        order_number: codigoPedido,
        quantity: cantidad,
      });

      alert("Pedido guardado con éxito.");
      setInputs((prev) => ({
        ...prev,
        [`${index}-codigoPedido`]: "",
        [`${index}-cantidad`]: "",
      }));
      await fetchData();
    } catch (error) {
      console.error("Error al guardar el pedido:", error);
      alert("Hubo un error al guardar.");
    }
  };

  const handleDelete = async (item) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este pedido?");
    if (!confirmDelete) return;

    try {
      await axios.delete("http://localhost:5000/eliminarPedido", {
        data: {
          order_number: item.order_number,
        },
      });
      alert("Pedido eliminado con éxito.");
      fetchData("pedidos-pendientes");
    } catch (error) {
      console.error("Error al eliminar el pedido:", error);
      alert("Hubo un error al eliminar.");
    }
  };


  const renderTable = () => {
    if (selectedOption === "productos" || selectedOption === "todos-los-productos") {
      return (
        <>
          <div className="mb-4">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={handleSaveAll}
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar todos los pedidos cargados"}
            </button>
          </div>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 w-8">ID</th>
                <th className="border p-2" style={{ width: '30rem' }}>Nombre</th>
                {selectedOption === "productos" && <th className="border p-2 w-8">Stock</th>}
                <th className="border p-2 w-28">Código de Pedido</th>
                <th className="border p-2 w-10">Cantidad</th>
                <th className="border p-2 w-14">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border h-12">
                  <td className="border px-2 py-1">{item.product_id}</td>
                  <td className="border px-2 py-1 truncate">{item.post_title}</td>
                  {selectedOption === "productos" && <td className="border px-2 py-1">{item.stock}</td>}
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="border p-1 h-8 w-full bg-white text-black focus:outline-none"
                      value={inputs[`${index}-codigoPedido`] || ""}
                      onChange={(e) => handleInputChange(index, "codigoPedido", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="border p-1 h-8 w-full bg-white text-black focus:outline-none"
                      value={inputs[`${index}-cantidad`] || ""}
                      onChange={(e) => handleInputChange(index, "cantidad", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded h-8"
                      onClick={() => handleSave(item, index)}
                    >
                      Guardar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    }

    // PEDIDOS PENDIENTES
    return (
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 w-10">ID</th>
            <th className="border p-2" style={{ width: '30rem' }}>Nombre</th>
            <th className="border p-2 w-20">Orden #</th>
            <th className="border p-2 w-10">Cantidad</th>
            <th className="border p-2 w-14">Fecha</th>
            <th className="border p-2 w-10">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border">
              <td className="border p-2">{item.product_id}</td>
              <td className="border p-2">{item.post_title}</td>
              <td className="border p-2">{item.order_number}</td>
              <td className="border p-2">{item.quantity}</td>
              <td className="border p-2">{item.order_date}</td>
              <td className="border p-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(item)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="flex h-screen">
      <aside className="w-[250px] min-w-[250px] bg-gray-800 text-white p-4 flex flex-col">
        <h1 className="text-lg font-bold mb-4">Menú</h1>
        <ul className="space-y-2">
          <li
            className={`p-2 cursor-pointer ${selectedOption === "productos" ? "bg-gray-700" : ""}`}
            onClick={() => setSelectedOption("productos")}
          >
            Productos con bajo stock
          </li>
          <li
            className={`p-2 cursor-pointer ${selectedOption === "pedidos-pendientes" ? "bg-gray-700" : ""}`}
            onClick={() => setSelectedOption("pedidos-pendientes")}
          >
            Pedidos pendientes
          </li>
          <li
            className={`p-2 cursor-pointer ${selectedOption === "todos-los-productos" ? "bg-gray-700" : ""}`}
            onClick={() => setSelectedOption("todos-los-productos")}
          >
            Todos los productos
          </li>
          <li
            className={`p-2 cursor-pointer ${selectedOption === "costos-productos" ? "bg-gray-700" : ""}`}
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
          }[selectedOption]}
        </h2>

        <div className="bg-white text-black shadow-md p-4 rounded overflow-auto max-h-[80vh]">
          {data.length > 0 ? renderTable() : <p>No hay datos disponibles.</p>}
        </div>
      </main>
    </div>
  );
}

export default App;
