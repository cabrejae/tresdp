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
        [`${index}-cantidad`] : "",
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

  const handleSaveManual = async () => {
    const product_id = inputs["new-product_id"];
    const variation_id = inputs["new-variation_id"] || null;
    const order_number = inputs["new-order_number"];
    const quantity = inputs["new-quantity"];

    if (!product_id || !order_number || !quantity) {
      alert("Complete al menos ID de producto, número de pedido y cantidad.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/guardarPedido", {
        product_id,
        variation_id: variation_id === "" ? null : variation_id,
        order_number,
        quantity,
      });

      alert("Pedido ingresado correctamente.");
      setInputs((prev) => ({
        ...prev,
        "new-product_id": "",
        "new-variation_id": "",
        "new-order_number": "",
        "new-quantity": "",
      }));

      await fetchData("pedidos-pendientes");
    } catch (error) {
      console.error("Error al guardar pedido manual:", error);
      alert("Error al ingresar el pedido.");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Menú lateral */}
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
        </ul>
      </aside>

      {/* Contenido principal */}
      <main className="flex-grow p-6">
        <h2 className="text-xl font-bold mb-4">
          {selectedOption === "productos" ? "Productos con bajo stock" : "Pedidos pendientes"}
        </h2>

        {selectedOption === "productos" && (
          <div className="mb-4">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              onClick={handleSaveAll}
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar todos los pedidos cargados"}
            </button>
          </div>
        )}

        <div className="bg-white text-black shadow-md p-4 rounded overflow-auto max-h-[80vh]">
          {data.length > 0 || selectedOption === "pedidos-pendientes" ? (
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-200">
                  {selectedOption === "productos" ? (
                    <>
                      <th className="border p-2">ID</th>
                      <th className="border p-2">Nombre</th>
                      <th className="border p-2">Stock</th>
                      <th className="border p-2">Código de Pedido</th>
                      <th className="border p-2">Cantidad</th>
                      <th className="border p-2">Acciones</th>
                    </>
                  ) : (
                    <>
                      <th className="border p-2">Producto ID</th>
                      <th className="border p-2">Nombre</th>
                      <th className="border p-2">Orden #</th>
                      <th className="border p-2">Cantidad</th>
                      <th className="border p-2">Fecha</th>
                      <th className="border p-2">Acciones</th>
                    </>
                  )}
                </tr>
                {selectedOption === "pedidos-pendientes" && (
                  <tr className="bg-yellow-50">
                    <td className="border p-2">
                      <input
                        type="text"
                        placeholder="Product ID"
                        value={inputs["new-product_id"] || ""}
                        onChange={(e) => handleInputChange("new", "product_id", e.target.value)}
                        className="border p-1 w-full bg-white text-black"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        placeholder="Nombre (opcional)"
                        disabled
                        className="w-full p-1 border bg-gray-100"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        placeholder="Orden #"
                        value={inputs["new-order_number"] || ""}
                        onChange={(e) => handleInputChange("new", "order_number", e.target.value)}
                        className="border p-1 w-full bg-white text-black"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        placeholder="Cantidad"
                        value={inputs["new-quantity"] || ""}
                        onChange={(e) => handleInputChange("new", "quantity", e.target.value)}
                        className="border p-1 w-full bg-white text-black"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        placeholder="Fecha (auto)"
                        disabled
                        className="w-full p-1 border bg-gray-100"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        placeholder="Variation ID"
                        value={inputs["new-variation_id"] || ""}
                        onChange={(e) => handleInputChange("new", "variation_id", e.target.value)}
                        className="border p-1 w-full bg-white text-black"
                      />
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded w-full"
                        onClick={handleSaveManual}
                      >
                        Guardar
                      </button>
                    </td>
                  </tr>
                )}
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="border">
                    {selectedOption === "productos" ? (
                      <>
                        <td className="border p-2">{item.product_id}</td>
                        <td className="border p-2">{item.post_title}</td>
                        <td className="border p-2">{item.stock}</td>
                        <td className="border p-2">
                          <input
                            type="text"
                            className="border p-1 w-full bg-white text-black"
                            value={inputs[`${index}-codigoPedido`] || ""}
                            onChange={(e) => handleInputChange(index, "codigoPedido", e.target.value)}
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="text"
                            className="border p-1 w-full bg-white text-black"
                            value={inputs[`${index}-cantidad`] || ""}
                            onChange={(e) => handleInputChange(index, "cantidad", e.target.value)}
                          />
                        </td>
                        <td className="border p-2">
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded"
                            onClick={() => handleSave(item, index)}
                          >
                            Guardar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay datos disponibles.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
