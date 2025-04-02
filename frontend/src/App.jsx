import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [activeSection, setActiveSection] = useState('productos');
  const [productos, setProductos] = useState([]);
  
  useEffect(() => {
    if (activeSection === 'productos') {
      axios.get('http://localhost:5000/productos')
        .then(response => setProductos(response.data.result))
        .catch(error => console.error('Error al obtener productos:', error));
    }
  }, [activeSection]);

  return (
    <div className="flex h-screen">
      {/* Menú lateral */}
      <nav className="w-1/4 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Menú</h2>
        <ul>
          <li className="mb-2 cursor-pointer" onClick={() => setActiveSection('productos')}>Ver Productos</li>
          <li className="mb-2 cursor-pointer" onClick={() => setActiveSection('pedidos')}>Ver Pedidos</li>
        </ul>
      </nav>

      {/* Contenido principal */}
      <div className="w-3/4 p-4">
        {activeSection === 'productos' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Productos con Bajo Stock</h2>
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 p-2">ID</th>
                  <th className="border border-gray-400 p-2">Nombre</th>
                  <th className="border border-gray-400 p-2">Stock</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(producto => (
                  <tr key={producto.product_id} className="border border-gray-400">
                    <td className="p-2">{producto.product_id}</td>
                    <td className="p-2">{producto.product_name}</td>
                    <td className="p-2">{producto.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeSection === 'pedidos' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Pedidos Pendientes</h2>
            <p>Aquí se mostrarán los pedidos...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
