import { useState } from 'react';

export default function DeliveryForm({ onDelivery }: { onDelivery: () => void }) {
  const [numero, setNumero] = useState('');
  const [mensaje, setMensaje] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/[^0-9]/g, '');
    if (valor.length <= 3) setNumero(valor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ text: '', type: '' });

    if (Number(numero) < 1 || Number(numero) > 700) {
       setMensaje({ text: 'Boleto inválido', type: 'error' });
       setLoading(false);
       return;
    }

    const res = await fetch('/api/boletos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ NumeroBoleto: numero }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMensaje({ text: data.error, type: 'error' });
    } else {
      setMensaje({ 
        text: `¡Plato entregado a ${data.boleto.NombreComprador}! (Boleto #${numero})`, 
        type: 'success' 
      });
      setNumero('');
      onDelivery();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-orange-900 mb-1">
            Número de Boleto a Entregar
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            value={numero}
            onChange={handleNumeroChange}
            className="w-full text-center text-3xl font-bold px-4 py-4 rounded-xl border border-orange-200 focus:outline-none focus:ring-4 focus:ring-orange-400 text-gray-900"
            placeholder="000"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !numero}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-colors text-lg shadow-sm"
        >
          {loading ? 'Validando...' : 'Marcar como Entregado'}
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