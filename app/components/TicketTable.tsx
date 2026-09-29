import { useState } from 'react';

// Ahora recibimos la función onTicketUpdated desde el componente padre
export default function TicketTable({ boletos, onTicketUpdated }: { boletos: any[], onTicketUpdated: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [procesando, setProcesando] = useState<number | null>(null);

  const boletosVendidos = boletos
    .filter((b) => b.EstadoBoleto === 'Vendido')
    .sort((a, b) => a.NumeroBoleto - b.NumeroBoleto);

  const boletosFiltrados = boletosVendidos.filter((boleto) => {
    const termino = searchTerm.toLowerCase();
    return (
      boleto.NumeroBoleto.toString().includes(termino) ||
      boleto.NombreComprador.toLowerCase().includes(termino) ||
      boleto.NumeroTelefonoComprador.includes(termino) ||
      (boleto.Vendedor && boleto.Vendedor.toLowerCase().includes(termino))
    );
  });

  const handleDelete = async (numeroBoleto: number) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar el registro del boleto #${numeroBoleto}? Volverá a estar "Disponible".`);
    if (!confirmar) return;

    setProcesando(numeroBoleto);

    try {
      const res = await fetch('/api/boletos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ NumeroBoleto: numeroBoleto }),
      });

      if (res.ok) {
        onTicketUpdated(); // Refresca la tabla y el dashboard globalmente
      } else {
        const data = await res.json();
        alert(data.error || 'Ocurrió un error al eliminar');
      }
    } catch (error) {
      alert('Error de conexión al intentar eliminar el registro');
    } finally {
      setProcesando(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar por número, comprador, teléfono o vendedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow bg-white text-gray-700"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50 text-orange-900 text-sm border-b border-orange-100">
                <th className="p-4 font-semibold whitespace-nowrap">No.</th>
                <th className="p-4 font-semibold min-w-[150px]">Comprador</th>
                <th className="p-4 font-semibold min-w-[120px]">Vendedor</th>
                <th className="p-4 font-semibold whitespace-nowrap">Teléfono</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Entrega</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Contacto</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {boletosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400">
                    {searchTerm 
                      ? 'No se encontraron coincidencias para tu búsqueda.' 
                      : 'No hay boletos vendidos aún.'}
                  </td>
                </tr>
              ) : (
                boletosFiltrados.map((boleto) => (
                  <tr key={boleto.NumeroBoleto} className="border-b border-gray-50 hover:bg-orange-50/50">
                    <td className="p-4 font-medium text-orange-950">#{boleto.NumeroBoleto}</td>
                    <td className="p-4">{boleto.NombreComprador}</td>
                    <td className="p-4">{boleto.Vendedor || '-'}</td>
                    <td className="p-4">{boleto.NumeroTelefonoComprador}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        boleto.Entregado 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {boleto.Entregado ? 'Entregado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <a
                        href={`https://wa.me/${boleto.NumeroTelefonoComprador}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-[#25D366] hover:bg-[#1EBE5D] text-white font-medium py-1.5 px-3 rounded-full text-xs transition-colors shadow-sm"
                      >
                        WhatsApp
                      </a>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(boleto.NumeroBoleto)}
                        disabled={procesando === boleto.NumeroBoleto}
                        className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-colors ${
                          procesando === boleto.NumeroBoleto 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
                        }`}
                        title="Eliminar registro"
                      >
                        {procesando === boleto.NumeroBoleto ? (
                          <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-500 animate-spin"></span>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}