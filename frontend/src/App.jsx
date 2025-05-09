// 🔄 MISMA CABECERA
import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [selectedOption, setSelectedOption] = useState("productos");
  const [parametros, setParametros] = useState({ multiplicador_general: 1, ml: 1, ml2: 1 });
  const [data, setData] = useState([]);
  const [inputs, setInputs] = useState({});
  const [isSaving, setIsSaving] = useState(false);



  useEffect(() => {
    const fetchParametros = async () => {
      try {
        const res = await axios.get("http://localhost:5000/parametros");
        if (res.data.success && Array.isArray(res.data.result)) {
          const p = {};
          res.data.result.forEach((row) => {
            if (row.id === 1) p.multiplicador_general = parseFloat(row.nvalor);
            if (row.id === 2) p.ml = parseFloat(row.nvalor);
            if (row.id === 3) p.ml2 = parseFloat(row.nvalor);
          });
          setParametros(p);
          console.log("Parametros cargados:", p);
        } else {
          console.error("Respuesta inesperada:", res.data);
        }
        
      } catch (error) {
        console.error("Error al obtener parámetros:", error);
      }
    };
  
    fetchParametros();
  }, []);
  
  

  useEffect(() => {
    fetchData(selectedOption);
  });


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

  const [comparacion, setComparacion] = useState({
    cantidad: "",
    unidades: "",
    precio: "",
    envio: "",
    pedido: "",
    aduana: "",
  });
  
  const handleComparacion = (campo, valor) => {
    setComparacion((prev) => ({
      ...prev,
      [campo]: valor || 0,
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

  const handleSaveCostos = async (item, index) => {
    try {
      await axios.post("http://localhost:5000/guardarCostoProducto", {
        product_id: item.product_id,
        variation_id: item.variation_id,
        cantidad: inputs[`${index}-cantidad`] ?? item.cantidad ?? 0,
        unidades: inputs[`${index}-unidades`] ?? item.unidades ?? 0,
        costo_envio: inputs[`${index}-costo_envio`] ?? item.costo_envio ?? 0,
        costo_pedido: inputs[`${index}-costo_pedido`] ?? item.costo_pedido ?? 0,
        costo_aduana: inputs[`${index}-costo_aduana`] ?? item.costo_aduana ?? 0,
        n_precio_producto: inputs[`${index}-n_precio_producto`] ?? item.costo_producto ?? 0,
      });
  
      alert("Costo guardado correctamente.");
      await fetchData("costos-productos");
    } catch (error) {
      console.error("Error al guardar costo:", error);
      alert("Error al guardar el costo del producto.");
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
          <table className="w-full border-collapse border border-gray-500 text-sm">
            <thead>
              <tr className="bg-gray-500">
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
                      className="border p-1 h-8 w-full bg-gray-400  text-black font-bold focus:outline-none"
                      
                      value={inputs[`${index}-codigoPedido`] || ""}
                      onChange={(e) => handleInputChange(index, "codigoPedido", e.target.value)}
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      className="border p-1 h-8 w-full text-black bg-gray-400 font-bold focus:outline-none"
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
    if (selectedOption === "pedidos-pendientes") {
      return (
        <table className="w-full border-collapse border border-gray-500 text-sm">
          <thead>
            <tr className="bg-gray-500">
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
    }

    if (selectedOption === "costos-productos") {

      
      // cálculo exactamente igual al resto de las filas
      const cantidad = comparacion.cantidad;
      const unidades = comparacion.unidades;
      const costo_producto = comparacion.precio;
      const costo_envio = comparacion.envio;
      const costo_pedido = comparacion.pedido;
      const costo_aduana = comparacion.aduana;
      const total_producto = cantidad * costo_producto;
      
      let envio_ponderado = 0;
      if (cantidad > 0 && costo_pedido > 0 && parametros?.multiplicador_general) {
        envio_ponderado = parseFloat(((costo_envio + (costo_aduana / parametros.multiplicador_general)) / costo_pedido * total_producto).toFixed(2));
        //envio_ponderado = parseFloat(((costo_envio + (costo_aduana / parametros.multiplicador_general)) / costo_pedido * total_producto).toFixed(2));
      } 
      
      let costoUnidad = 0;
      if (cantidad > 0 && unidades > 0 && parametros?.multiplicador_general) {
        costoUnidad = ((total_producto + envio_ponderado) / (cantidad * unidades)) * parametros.multiplicador_general;
      }
      
      const costoML = costoUnidad * (parametros?.ml ?? 0);
      const costoML2 = costoUnidad * (parametros?.ml2 ?? 0);
      
      return (
        <table className="w-full border-collapse border border-gray-500 text-sm">
          <thead>
            <tr className="bg-gray-500">
              <th className="sticky top-[36px] z-10 bg-gray-800 border p-2 w-12">ID</th>
              <th className="sticky top-[36px] z-10 bg-gray-800 border p-2 w-64">Nombre</th>
              <th className="sticky top-[36px] z-10 bg-gray-800 border p-2 w-14">Cantidad</th>
              <th className="sticky top-[36px] z-10 bg-gray-800 border p-2 w-14">Unidades</th>
              <th className="sticky top-[36px] z-10 bg-gray-800 border p-2 w-14">Precio</th>
              <th className="sticky top-[36px] z-10 bg-gray-800 border p-2 w-14">Envío</th>
              <th className="sticky top-[36px] z-10 bg-gray-800 border p-2 w-14">Pedido</th>
              <th className="sticky top-[36px] z-10 bg-gray-800 border p-2 w-14">Aduana</th>
              <th className="sticky top-[36px] z-10 bg-gray-800 border p-2 w-16">Costo unidad</th>
              <th className="sticky top-[36px] z-10 bg-gray-800 border p-2 w-16">Costo ML</th>
              <th className="sticky top-[36px] z-10 bg-gray-800 border p-2 w-16">Costo ML 2</th>
              <th className="sticky top-[36px] z-10 bg-gray-800 border p-2 w-20">Acción</th>
            </tr>
          </thead>
{/* Fila fija de comparación */}
<tr className="sticky top-0 bg-gray-700 z-20 text-white text-sm">
  <td className="border p-2"></td>
  <td className="border p-2 font-bold">Comparar</td>
  <td className="border p-2">
    <input type="text" value={comparacion.cantidad} onChange={(e) => handleComparacion("cantidad", e.target.value)} className="w-full text-black px-1" />
  </td>
  <td className="border p-2">
    <input type="text" value={comparacion.unidades} onChange={(e) => handleComparacion("unidades", e.target.value)} className="w-full text-black px-1" />
  </td>
  <td className="w-full border p-2">
  <input type="text" value={comparacion.precio}onChange={(e) => handleComparacion("precio", e.target.value)} className="w-full text-black px-1"
/>
  </td>
  <td className="border p-2">
    <input type="text" value={comparacion.envio} onChange={(e) => handleComparacion("envio", e.target.value)} className="w-full text-black px-1" />
  </td>
  <td className="border p-2">
    <input type="text" value={comparacion.pedido} onChange={(e) => handleComparacion("pedido", e.target.value)} className="w-full text-black px-1" />
  </td>
  <td className="border p-2">
    <input type="text" value={comparacion.aduana} onChange={(e) => handleComparacion("aduana", e.target.value)} className="w-full text-black px-1" />
  </td>
  <td className="border p-2 text-right">{isNaN(costoUnidad) ? "-" : costoUnidad.toFixed(2)}</td>
  <td className="border p-2 text-right">{isNaN(costoML) ? "-" : costoML.toFixed(2)}</td>
  <td className="border p-2 text-right">{isNaN(costoML2) ? "-" : costoML2.toFixed(2)}</td>
  <td className="border p-2"></td>
</tr>

    <tbody>
      {data.map((item, index) => {
        const cantidad = parseFloat(inputs[`${index}-cantidad`] ?? item.cantidad ?? 0) || 0;
        const unidades = parseFloat(inputs[`${index}-unidades`] ?? item.unidades ?? 0) || 0;
        const costo_producto = parseFloat(inputs[`${index}-n_precio_producto`] ?? item.costo_producto ?? 0) || 0;
        const costo_envio = parseFloat(inputs[`${index}-costo_envio`] ?? item.costo_envio ?? 0) || 0;
        const costo_pedido = parseFloat(inputs[`${index}-costo_pedido`] ?? item.costo_pedido ?? 0) || 0;
        const costo_aduana = parseFloat(inputs[`${index}-costo_aduana`] ?? item.costo_aduana ?? 0) || 0;
        const total_producto = cantidad * costo_producto;
        let envio_ponderado = 0;
        if (cantidad > 0 && costo_pedido > 0 && parametros?.multiplicador_general) {
          //envio_ponderado =()
          //  ((cantidad * costo_producto * parametros.multiplicador_general) /
          //    (costo_pedido * parametros.multiplicador_general)) *
          //  ((costo_envio * parametros.multiplicador_general) + costo_aduana);
          
          envio_ponderado = parseFloat(((costo_envio+(costo_aduana/parametros.multiplicador_general))/costo_pedido* total_producto).toFixed(2));
        
          //console.log("costo_envio:" + costo_envio );
          //console.log("costo_aduana:" + costo_aduana );
          //console.log("costo_pedido:" + costo_pedido );
          //console.log("costo_producto:" + total_producto );
          //console.log("envio_ponderado:" + envio_ponderado );
        }

      let costo_unidad = 0;
      if (cantidad > 0 && unidades > 0 && parametros?.multiplicador_general) {
        costo_unidad = ((total_producto + envio_ponderado) / (cantidad * unidades) * parametros.multiplicador_general);
      }0;

      const costo_ml = costo_unidad * (parametros?.ml ?? 0);
      const costo_ml2 = costo_unidad * (parametros?.ml2 ?? 0);

      return (
        <tr key={index} className="border">
          <td className="border p-2">{item.product_id}/{item.variation_id}</td>
          <td className="border p-2">{item.post_title}</td>
          <td className="border p-2">
            <input
              type="text"
              value={inputs[`${index}-cantidad`] ?? item.cantidad ?? ""}
              onChange={(e) => handleInputChange(index, "cantidad", e.target.value)}
              className="border w-full px-1 py-0.5  bg-gray-400 font-bold"
            />
          </td>
          <td className="border p-2">
            <input
              type="text"
              value={inputs[`${index}-unidades`] ?? item.unidades ?? ""}
              onChange={(e) => handleInputChange(index, "unidades", e.target.value)}
              className="border w-full px-1 py-0.5 bg-gray-400 font-bold"
            />
          </td>
          <td className="border p-2">
            <input
              type="text"
              value={inputs[`${index}-n_precio_producto`] ?? item.costo_producto ?? ""}
              onChange={(e) => handleInputChange(index, "n_precio_producto", e.target.value)}
              className="border w-full px-1 py-0.5  bg-gray-400 font-bold"
            />
          </td>
          <td className="border p-2">
            <input
              type="text"
              value={inputs[`${index}-costo_envio`] ?? item.costo_envio ?? ""}
              onChange={(e) => handleInputChange(index, "costo_envio", e.target.value)}
              className="border w-full px-1 py-0.5  bg-gray-400 font-bold"
            />
          </td>
          <td className="border p-2">
            <input
              type="text"
              value={inputs[`${index}-costo_pedido`] ?? item.costo_pedido ?? ""}
              onChange={(e) => handleInputChange(index, "costo_pedido", e.target.value)}
              className="border w-full px-1 py-0.5  bg-gray-400 font-bold"
            />
          </td>
          <td className="border p-2">
            <input
              type="text"
              value={inputs[`${index}-costo_aduana`] ?? item.costo_aduana ?? ""}
              onChange={(e) => handleInputChange(index, "costo_aduana", e.target.value)}
              className="border w-full px-1 py-0.5  bg-gray-400 font-bold"
            />
          </td>
          <td className="border p-2 text-right">{isNaN(costo_unidad) ? "-" : costo_unidad.toFixed(2)}</td>
          <td className="border p-2 text-right">{isNaN(costo_ml) ? "-" : costo_ml.toFixed(2)}</td>
          <td className="border p-2 text-right">{isNaN(costo_ml2) ? "-" : costo_ml2.toFixed(2)}</td>
          <td className="border p-2">
            <button
              className="bg-green-600 text-white  px-3 py-1 rounded"
              onClick={() => handleSaveCostos(item, index)}
            >
              Guardar
            </button>
          </td>
        </tr>
      );
  })}
    </tbody>
</table>
      );
    }
    return <div className="text-gray-500">Seleccione una opción del menú.</div>;  //pilu
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Control de Stock</h1>
      <div className="mb-4 space-x-2">
        <button
          className={`px-4 py-2 rounded ${selectedOption === "productos" ? "bg-blue-600 text-white" : "bg-gray-500"}`}
          onClick={() => setSelectedOption("productos")}
        >
          Productos con bajo stock
        </button>
        <button
          className={`px-4 py-2 rounded ${selectedOption === "todos-los-productos" ? "bg-blue-600 text-white" : "bg-gray-500"}`}
          onClick={() => setSelectedOption("todos-los-productos")}
        >
          Todos los productos
        </button>
        <button
          className={`px-4 py-2 rounded ${selectedOption === "pedidos-pendientes" ? "bg-blue-600 text-white" : "bg-gray-500"}`}
          onClick={() => setSelectedOption("pedidos-pendientes")}
        >
          Pedidos pendientes
        </button>
        <button
          className={`px-4 py-2 rounded ${selectedOption === "costos-productos" ? "bg-blue-600 text-white" : "bg-gray-500"}`}
          onClick={() => setSelectedOption("costos-productos")}
        >
          Costos de productos
        </button>
      </div>
      {renderTable()}
    </div>
  );
}

export default App;