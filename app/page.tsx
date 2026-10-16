'use client';

import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import TicketForm from './components/TicketForm';
import TicketTable from './components/TicketTable';
import DeliveryForm from './components/DeliveryForm';

export default function Home() {
  const [boletos, setBoletos] = useState([]);
  // El estado inicial es 'form' para que sea lo primero que vea el usuario
  const [activeView, setActiveView] = useState('form');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchBoletos = async () => {
    const res = await fetch('/api/boletos');
    const data = await res.json();
    setBoletos(data);
  };

  useEffect(() => {
    fetchBoletos();
  }, []);

  const menuItems = [
    { id: 'form', label: 'Vender Boleto', icon: '🎫' },
    { id: 'delivery', label: 'Entregar Comida', icon: '🍽️' },
    { id: 'dashboard', label: 'Resumen', icon: '📊' },
    { id: 'table', label: 'Lista de Ventas', icon: '📋' },
  ];

  return (
    <div className="flex h-screen bg-[#FFFDF9] font-sans overflow-hidden">
      
      {/* Overlay oscuro para móviles cuando el menú está abierto */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Menú Lateral (Sidebar) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-orange-100 shadow-lg md:shadow-none transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-orange-100 bg-orange-50/50">
          <h1 className="text-xl font-extrabold text-orange-950">Comida Solidaria</h1>
          {/* Botón de cerrar (solo móvil) */}
          <button 
            className="md:hidden text-orange-900 p-1 hover:bg-orange-100 rounded-lg" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setIsSidebarOpen(false); // Cierra el menú al seleccionar (útil en móvil)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeView === item.id 
                  ? 'bg-[#FFB085] text-orange-950 font-bold shadow-sm' 
                  : 'text-orange-800 hover:bg-orange-50 hover:text-orange-950'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Cabecera Móvil con botón de Hamburguesa */}
        <header className="bg-white border-b border-orange-100 p-4 flex items-center md:hidden shadow-sm z-10">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="text-orange-900 p-1 hover:bg-orange-50 rounded-lg focus:outline-none"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-3 text-lg font-bold text-orange-950">Panel de Control</h1>
        </header>

        {/* Área de contenido renderizado (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#FFFDF9]">
          <div className="max-w-4xl mx-auto">
            {activeView === 'form' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <header className="mb-6">
                  <h2 className="text-2xl font-extrabold text-orange-950">Registrar Venta de boletos</h2>
                  <p className="text-orange-700">Ingresa los datos del comprador</p>
                </header>
                <div className="max-w-md">
                  <TicketForm onTicketSold={fetchBoletos} />
                </div>
              </div>
            )}

            {activeView === 'dashboard' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <header className="mb-6">
                  <h2 className="text-2xl font-extrabold text-orange-950">Estado de Boletos</h2>
                  <p className="text-orange-700">Resumen en tiempo real de la comida solidaria</p>
                </header>
                <Dashboard boletos={boletos} />
              </div>
            )}

            {activeView === 'table' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <header className="mb-6">
                  <h2 className="text-2xl font-extrabold text-orange-950">Registro Detallado</h2>
                  <p className="text-orange-700">Lista completa de boletos vendidos</p>
                </header>
                <TicketTable boletos={boletos} onTicketUpdated={fetchBoletos} />
              </div>
            )}

            {activeView === 'delivery' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <header className="mb-6">
                  <h2 className="text-2xl font-extrabold text-orange-950">Despacho de Comida</h2>
                  <p className="text-orange-700">Registra los boletos al entregar los platos</p>
                </header>
                <div className="max-w-sm mx-auto">
                  <DeliveryForm boletos={boletos} onDelivery={fetchBoletos} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      
    </div>
  );
}