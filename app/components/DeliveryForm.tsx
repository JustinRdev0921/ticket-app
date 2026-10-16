import { useState, useMemo } from 'react';

// Añadimos la propiedad boletos al componente
export default function DeliveryForm({ boletos, onDelivery }: { boletos: any[], onDelivery: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [mensaje, setMensaje] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Filtrar boletos en tiempo real por nombre, teléfono o número
  const resultados = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const termino = searchTerm.toLowerCase();
    
    return boletos.filter(b => 
      b.EstadoBoleto === 'Vendido' && 
      (b.NombreComprador.toLowerCase().includes(termino) || 
       b.NumeroTelefonoComprador.includes(termino) || 
       b.NumeroBoleto.toString() === termino)
    );
  }, [boletos, searchTerm]);

  const toggleTicket = (numero: number) => {
    setSelectedTickets(prev => 
      prev.includes(numero) ? prev.filter(n => n !== numero) : [...prev, numero]
    );
  };

  const seleccionarTodos = () => {
    const pendientes = resultados.filter(b => !b.Entregado).map(b => b.NumeroBoleto);
    setSelectedTickets(pendientes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTickets.length === 0) return;

    setLoading(true);
    setMensaje({ text: '', type: '' });

    const res = await fetch('/api/boletos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'despachar', numerosBoletos: selectedTickets }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMensaje({ text: data.error, type: 'error' });
    } else {
      setMensaje({ 
        text: `¡${data.entregados} plato(s) entregado(s) exitosamente!`, 
        type: 'success' 
      });
      setSelectedTickets([]);
      setSearchTerm('');
      onDelivery();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-orange-900 mb-1">
            Buscar Comprador (Nombre, Celular o No. Boleto)
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-900"
            placeholder="Ej: Juan Pérez"
          />
        </div>

        {/* Lista de resultados dinámicos */}
        {searchTerm && (
          <div className="bg-orange-50/50 rounded-xl border border-orange-100 p-3 max-h-64 overflow-y-auto">
            {resultados.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-2">No hay boletos vendidos con ese dato.</p>
            ) : (
              <>
                <div className="flex justify-between items-center mb-3 border-b border-orange-100 pb-2">
                  <span className="text-xs font-bold text-orange-800 uppercase">Boletos Encontrados ({resultados.length})</span>
                  <button 
                    type="button" 
                    onClick={seleccionarTodos}
                    className="text-xs bg-orange-200 hover:bg-orange-300 text-orange-900 px-2 py-1 rounded font-medium transition-colors"
                  >
                    Seleccionar Pendientes
                  </button>
                </div>
                
                <div className="space-y-2">
                  {resultados.map((boleto) => {
                    const isSelected = selectedTickets.includes(boleto.NumeroBoleto);
                    
                    return (
                      <label 
                        key={boleto.NumeroBoleto} 
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                          boleto.Entregado ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' :
                          isSelected ? 'bg-orange-100 border-orange-400' : 'bg-white border-orange-200 hover:bg-orange-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            disabled={boleto.Entregado}
                            checked={isSelected}
                            onChange={() => toggleTicket(boleto.NumeroBoleto)}
                            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                          />
                          <div>
                            <p className="font-bold text-orange-950">Boleto #{boleto.NumeroBoleto}</p>
                            <p className="text-xs text-gray-600">{boleto.NombreComprador}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          boleto.Entregado ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {boleto.Entregado ? 'Entregado' : 'Pendiente'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || selectedTickets.length === 0}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-colors text-lg shadow-sm"
        >
          {loading ? 'Procesando...' : `Entregar ${selectedTickets.length} plato(s)`}
        </button>
      </form>

      {mensaje.text && (
        <div className={`mt-4 p-4 rounded-xl text-center text-sm font-bold ${mensaje.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
          {mensaje.text}
        </div>
      )}
    </div>
  );
}