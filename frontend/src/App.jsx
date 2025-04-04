import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [selectedOption, setSelectedOption] = useState("productos");
  const [data, setData] = useState([]);
  const [inputs, setInputs] = useState({}); // Estado para los inputs

  useEffect(() => {
    fetchData(selectedOption);
  }, [selectedOption]);

  const fetchData = async (option) => {
    try {
      const response = await axios.get(`http://localhost:5000/${option}`);     
      setData(response.data.result);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setData([]);
    }
  };

  // Manejar cambios en los inputs por fila
  const handleInputChange = (index, field, value) => {
    setInputs((prev) => ({
      ...prev,
      [`${index}-${field}`]: value,
    }));
  };

  // Función para guardar los datos en el SP
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
        variation_id: item.variation_id, // Si no tiene variación, enviará null
        order_number: codigoPedido,
        quantity : cantidad,
      });

      alert("Pedido guardado con éxito.");
      setInputs((prev) => ({
        ...prev,
        [`${index}-codigoPedido`]: "",
        [`${index}-cantidad`]: "",
      }));
    } catch (error) {
      console.error("Error al guardar el pedido:", error);
      alert("Hubo un error al guardar." + error);
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
            className={`p-2 cursor-pointer ${selectedOption === "pedidos" ? "bg-gray-700" : ""}`}
            onClick={() => setSelectedOption("pedidos")}
          >
            Pedidos pendientes
          </li>
        </ul>
      </aside>

      {/* Sección de contenido */}
      <main className="flex-grow p-6">
        <h2 className="text-xl font-bold mb-4">
          {selectedOption === "productos" ? "Productos con bajo stock" : "Pedidos pendientes"}
        </h2>
        <div className="bg-white text-black shadow-md p-4 rounded">
          {data.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  {selectedOption === "productos" ? (
                    <>
                      <th className="border p-2">ID</th>
                      <th className="border p-2">Nombre</th>
                      <th className="border p-2">Stock</th>
                      <th className="border p-2">Código de Pedido</th>
                      <th className="border p-2">Cantidad</th>
                      <th className="border p-2">Acción</th>
                    </>
                  ) : (
                    <>
                      <th className="border p-2">Pedido #</th>
                      <th className="border p-2">Producto ID</th>
                      <th className="border p-2">Cantidad</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="border">
                    {selectedOption === "productos" ? (
                      <>
                        <td className="border p-2">{item.product_id}</td>
                        <td className="border p-2">{item.variation_name}</td> 
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
                        <td className="border p-2">{item.order_number}</td>
                        <td className="border p-2">{item.product_id}</td>
                        <td className="border p-2">{item.quantity}</td>
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
