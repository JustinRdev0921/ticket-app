import { useState } from 'react';

export default function TicketTable({ boletos, onTicketUpdated }: { boletos: any[], onTicketUpdated: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroVendedor, setFiltroVendedor] = useState('');
  const [filtroEntrega, setFiltroEntrega] = useState('');
  const [filtroPagado, setFiltroPagado] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [procesando, setProcesando] = useState<number | null>(null);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    NombreComprador: '',
    Vendedor: '',
    NumeroTelefonoComprador: '',
    BoletoPagado: false
  });

  const boletosVendidos = boletos
    .filter((b) => b.EstadoBoleto === 'Vendido')
    .sort((a, b) => a.NumeroBoleto - b.NumeroBoleto);

  const vendedoresUnicos = Array.from(new Set(boletosVendidos.map(b => b.Vendedor).filter(Boolean)));

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

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = boletosFiltrados.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(boletosFiltrados.length / recordsPerPage);

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

  const handleEditClick = (boleto: any) => {
    setEditingId(boleto.NumeroBoleto);
    setEditForm({
      NombreComprador: boleto.NombreComprador,
      Vendedor: boleto.Vendedor || '',
      NumeroTelefonoComprador: boleto.NumeroTelefonoComprador,
      BoletoPagado: boleto.BoletoPagado
    });
  };

  const handleSaveEdit = async (numeroBoleto: number) => {
    setProcesando(numeroBoleto);
    try {
      const res = await fetch('/api/boletos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ NumeroBoleto: numeroBoleto, ...editForm }),
      });
      if (res.ok) {
        setEditingId(null);
        onTicketUpdated();
      } else {
        alert((await res.json()).error);
      }
    } catch (error) {
      alert('Error al intentar guardar los cambios');
    } finally {
      setProcesando(null);
    }
  };

  // Obtenemos el dominio actual de manera dinámica para inyectarlo en el link de WhatsApp
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative col-span-1 md:col-span-1">
          <input
            type="text" placeholder="Buscar (No., Nombre, Tel)..." value={searchTerm}
            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700 text-sm"
          />
        </div>
        <select value={filtroVendedor} onChange={(e) => handleFilterChange(setFiltroVendedor, e.target.value)} className="px-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700 text-sm">
          <option value="">Todos los vendedores</option>
          {vendedoresUnicos.map((v: any, idx) => <option key={idx} value={v}>{v}</option>)}
        </select>
        <select value={filtroPagado} onChange={(e) => handleFilterChange(setFiltroPagado, e.target.value)} className="px-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700 text-sm">
          <option value="">Estado de Pago (Todos)</option>
          <option value="si">Solo Pagados</option>
          <option value="no">Pagos Pendientes</option>
        </select>
        <select value={filtroEntrega} onChange={(e) => handleFilterChange(setFiltroEntrega, e.target.value)} className="px-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700 text-sm">
          <option value="">Estado Entrega (Todos)</option>
          <option value="entregado">Solo Entregados</option>
          <option value="pendiente">Entregas Pendientes</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50 text-orange-900 text-sm border-b border-orange-100">
                <th className="p-4 font-semibold whitespace-nowrap">No.</th>
                <th className="p-4 font-semibold min-w-[160px]">Comprador</th>
                <th className="p-4 font-semibold min-w-[120px]">Vendedor</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Pago</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Entrega</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap min-w-[100px]">Contacto / Tel</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap min-w-[120px]">Acción</th>
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
                currentRecords.map((boleto) => {
                  const isEditing = editingId === boleto.NumeroBoleto;
                  const isProcessing = procesando === boleto.NumeroBoleto;

                  return (
                    <tr key={boleto.NumeroBoleto} className={`border-b border-gray-50 hover:bg-orange-50/50 ${isEditing ? 'bg-orange-50/80' : ''}`}>
                      <td className="p-4 font-medium text-orange-950">#{boleto.NumeroBoleto}</td>
                      
                      {isEditing ? (
                        <>
                          <td className="p-2"><input type="text" value={editForm.NombreComprador} onChange={e => setEditForm({...editForm, NombreComprador: e.target.value})} className="w-full px-2 py-1.5 border border-orange-300 rounded focus:ring-2 focus:ring-orange-400 focus:outline-none" /></td>
                          <td className="p-2"><input type="text" value={editForm.Vendedor} onChange={e => setEditForm({...editForm, Vendedor: e.target.value})} className="w-full px-2 py-1.5 border border-orange-300 rounded focus:ring-2 focus:ring-orange-400 focus:outline-none" /></td>
                          <td className="p-2 text-center">
                            <select value={editForm.BoletoPagado ? 'si' : 'no'} onChange={e => setEditForm({...editForm, BoletoPagado: e.target.value === 'si'})} className="w-full px-1 py-1.5 border border-orange-300 rounded focus:ring-2 focus:ring-orange-400 focus:outline-none text-xs">
                              <option value="si">Pagado</option>
                              <option value="no">Pendiente</option>
                            </select>
                          </td>
                          <td className="p-4 text-center text-xs text-gray-500">No editable aquí</td>
                          <td className="p-2"><input type="text" value={editForm.NumeroTelefonoComprador} onChange={e => setEditForm({...editForm, NumeroTelefonoComprador: e.target.value.replace(/[^0-9]/g, '')})} className="w-full px-2 py-1.5 border border-orange-300 rounded focus:ring-2 focus:ring-orange-400 focus:outline-none" placeholder="Teléfono" /></td>
                          <td className="p-2 text-center flex justify-center gap-2">
                            <button onClick={() => handleSaveEdit(boleto.NumeroBoleto)} disabled={isProcessing} className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg font-medium text-xs w-full">Guardar</button>
                            <button onClick={() => setEditingId(null)} disabled={isProcessing} className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-1.5 rounded-lg font-medium text-xs w-full">x</button>
                          </td>
                        </>
                      ) : (
                        <>
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
                            {boleto.NumeroTelefonoComprador && (
                              <div className="flex justify-center">
                                <a 
                                  href={`https://wa.me/${boleto.NumeroTelefonoComprador}?text=${encodeURIComponent(`¡Hola ${boleto.NombreComprador}! 🍲 Gracias por apoyar nuestra comida solidaria. Para agilizar tu pedido, indícanos si pasarás retirando tus platos por el local o si necesitas envío a domicilio ingresando aquí: ${baseUrl}/entrega/${boleto.CompraId}`)}`}
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-block bg-[#25D366] text-white py-1 px-3 rounded-full text-xs font-medium hover:bg-green-600 transition-colors shadow-sm"
                                >
                                  Notificar
                                </a>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center flex justify-center gap-2">
                            <button onClick={() => handleEditClick(boleto)} disabled={isProcessing} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg" title="Editar">
                              ✏️
                            </button>
                            <button onClick={() => handleDelete(boleto.NumeroBoleto)} disabled={isProcessing} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg" title="Eliminar">
                              🗑️
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
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