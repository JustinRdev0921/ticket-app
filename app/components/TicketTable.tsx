import { useState } from 'react';

export default function TicketTable({ boletos, onTicketUpdated }: { boletos: any[], onTicketUpdated: () => void }) {
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroVendedor, setFiltroVendedor] = useState('');
  const [filtroEntrega, setFiltroEntrega] = useState('');
  const [filtroPagado, setFiltroPagado] = useState('');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [procesando, setProcesando] = useState<number | null>(null);

  // Filtramos solo los vendidos
  const boletosVendidos = boletos
    .filter((b) => b.EstadoBoleto === 'Vendido')
    .sort((a, b) => a.NumeroBoleto - b.NumeroBoleto);

  // Extraemos lista única de vendedores para el selector
  const vendedoresUnicos = Array.from(new Set(boletosVendidos.map(b => b.Vendedor).filter(Boolean)));

  // Lógica de filtrado combinado
  const boletosFiltrados = boletosVendidos.filter((boleto) => {
    const termino = searchTerm.toLowerCase();
    const coincideBusqueda = 
      boleto.NumeroBoleto.toString().includes(termino) ||
      boleto.NombreComprador.toLowerCase().includes(termino) ||
      boleto.NumeroTelefonoComprador.includes(termino);
      
    const coincideVendedor = filtroVendedor === '' || boleto.Vendedor === filtroVendedor;
    const coincideEntrega = filtroEntrega === '' || (filtroEntrega === 'entregado' ? boleto.Entregado : !boleto.Entregado);
    const coincidePagado = filtroPagado === '' || (filtroPagado === 'si' ? boleto.BoletoPagado : !boleto.BoletoPagado);

    return coincideBusqueda && coincideVendedor && coincideEntrega && coincidePagado;
  });

  // Lógica matemática para paginación
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = boletosFiltrados.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(boletosFiltrados.length / recordsPerPage);

  // Resetea a la página 1 cuando se cambian los filtros
  const handleFilterChange = (setter: any, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleDelete = async (numeroBoleto: number) => {
    const confirmar = window.confirm(`¿Eliminar el registro del boleto #${numeroBoleto}? Volverá a estar "Disponible".`);
    if (!confirmar) return;

    setProcesando(numeroBoleto);
    try {
      const res = await fetch('/api/boletos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ NumeroBoleto: numeroBoleto }),
      });
      if (res.ok) onTicketUpdated();
      else alert((await res.json()).error);
    } catch (error) {
      alert('Error de conexión al eliminar');
    } finally {
      setProcesando(null);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Controles de Búsqueda y Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative col-span-1 md:col-span-1">
          <input
            type="text"
            placeholder="Buscar (No., Nombre, Tel)..."
            value={searchTerm}
            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700 text-sm"
          />
        </div>
        <select
          value={filtroVendedor}
          onChange={(e) => handleFilterChange(setFiltroVendedor, e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700 text-sm"
        >
          <option value="">Todos los vendedores</option>
          {vendedoresUnicos.map((v: any, idx) => (
            <option key={idx} value={v}>{v}</option>
          ))}
        </select>
        <select
          value={filtroPagado}
          onChange={(e) => handleFilterChange(setFiltroPagado, e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700 text-sm"
        >
          <option value="">Estado de Pago (Todos)</option>
          <option value="si">Solo Pagados</option>
          <option value="no">Pagos Pendientes</option>
        </select>
        <select
          value={filtroEntrega}
          onChange={(e) => handleFilterChange(setFiltroEntrega, e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700 text-sm"
        >
          <option value="">Estado Entrega (Todos)</option>
          <option value="entregado">Solo Entregados</option>
          <option value="pendiente">Entregas Pendientes</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50 text-orange-900 text-sm border-b border-orange-100">
                <th className="p-4 font-semibold whitespace-nowrap">No.</th>
                <th className="p-4 font-semibold min-w-[150px]">Comprador</th>
                <th className="p-4 font-semibold min-w-[120px]">Vendedor</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Pago</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Entrega</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Contacto</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400">
                    No se encontraron resultados.
                  </td>
                </tr>
              ) : (
                currentRecords.map((boleto) => (
                  <tr key={boleto.NumeroBoleto} className="border-b border-gray-50 hover:bg-orange-50/50">
                    <td className="p-4 font-medium text-orange-950">#{boleto.NumeroBoleto}</td>
                    <td className="p-4">{boleto.NombreComprador}</td>
                    <td className="p-4">{boleto.Vendedor || '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                        boleto.BoletoPagado 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {boleto.BoletoPagado ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                        boleto.Entregado 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {boleto.Entregado ? 'Entregado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <a href={`https://wa.me/${boleto.NumeroTelefonoComprador}`} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#25D366] text-white py-1 px-3 rounded-full text-xs font-medium">
                        WA
                      </a>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDelete(boleto.NumeroBoleto)} disabled={procesando === boleto.NumeroBoleto} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg">
                        {procesando === boleto.NumeroBoleto ? '...' : 'Borrar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación y Contadores */}
        <div className="bg-orange-50/50 p-4 border-t border-orange-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-orange-800 font-medium">
            Mostrando <span className="font-bold">{boletosFiltrados.length === 0 ? 0 : indexOfFirstRecord + 1}</span> a <span className="font-bold">{Math.min(indexOfLastRecord, boletosFiltrados.length)}</span> de <span className="font-bold">{boletosFiltrados.length}</span> registros filtrados
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-orange-200 bg-white text-orange-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-100 text-sm font-medium transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-orange-900 font-medium px-2">
              Página {currentPage} de {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 rounded-lg border border-orange-200 bg-white text-orange-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-100 text-sm font-medium transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}