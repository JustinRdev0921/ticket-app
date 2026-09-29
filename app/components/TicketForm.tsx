import { useState } from 'react';

export default function TicketForm({ onTicketSold }: { onTicketSold: () => void }) {
  const [numeros, setNumeros] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [mensaje, setMensaje] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleNumerosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/[^0-9,\s]/g, '');
    setNumeros(valor);
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/[^0-9]/g, '');
    if (valor.length <= 10) setTelefono(valor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ text: '', type: '' });

    const boletosArray = numeros
      .split(',')
      .map(n => n.trim())
      .filter(n => n !== '')
      .map(Number);

    if (boletosArray.length === 0) {
      setMensaje({ text: 'Ingresa al menos un número de boleto', type: 'error' });
      setLoading(false);
      return;
    }

    const invalidos = boletosArray.filter(n => n < 1 || n > 700);
    if (invalidos.length > 0) {
      setMensaje({ text: `Números fuera de rango (1-700): ${invalidos.join(', ')}`, type: 'error' });
      setLoading(false);
      return;
    }

    const boletosUnicos = Array.from(new Set(boletosArray));

    const res = await fetch('/api/boletos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        numerosBoletos: boletosUnicos, 
        NombreComprador: nombre, 
        NumeroTelefonoComprador: telefono,
        Vendedor: vendedor // Nuevo campo enviado
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMensaje({ text: data.error, type: 'error' });
    } else {
      setMensaje({ text: `¡Boletos vendidos exitosamente!`, type: 'success' });
      setNumeros('');
      setNombre('');
      setTelefono('');
      // No borramos el nombre del vendedor intencionalmente para agilizar ventas consecutivas
      onTicketSold();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-orange-900 mb-1">
            Números de Boletos (Separados por coma)
          </label>
          <input
            type="text"
            required
            value={numeros}
            onChange={handleNumerosChange}
            className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-900"
            placeholder="Ej: 145, 146, 147"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-orange-900 mb-1">Nombre del Comprador</label>
          <input
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-900"
            placeholder="Juan Pérez"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-orange-900 mb-1">Número de Teléfono</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            value={telefono}
            onChange={handleTelefonoChange}
            className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-900"
            placeholder="Ej: 0991234567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-orange-900 mb-1">Vendido por</label>
          <input
            type="text"
            required
            value={vendedor}
            onChange={(e) => setVendedor(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-900"
            placeholder="Nombre de quien vendió el boleto"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FFB085] hover:bg-[#FF9B6A] text-orange-950 font-bold py-2 px-4 rounded-lg transition-colors mt-2"
        >
          {loading ? 'Procesando...' : 'Registrar Venta'}
        </button>
      </form>
      {mensaje.text && (
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${mensaje.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>
          {mensaje.text}
        </div>
      )}
    </div>
  );
}