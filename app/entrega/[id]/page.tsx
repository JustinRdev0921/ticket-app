'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function PaginaEntrega() {
  const params = useParams();
  const compraId = params.id as string;
  
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [direccion, setDireccion] = useState('');
  
  const guardarPreferencia = async (metodo: string, gps = '', direccionManual = '') => {
    setLoading(true);
    try {
      const res = await fetch('/api/boletos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'guardarUbicacion',
          CompraId: compraId,
          MetodoEntrega: metodo,
          CoordenadasGPS: gps,
          DireccionManual: direccionManual
        }),
      });
      if (res.ok) setPaso(3); // Pantalla de éxito
    } catch (error) {
      alert("Hubo un error de conexión.");
    }
    setLoading(false);
  };

  const capturarGPS = () => {
    if (!navigator.geolocation) {
      alert("Tu dispositivo no soporta geolocalización.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude},${position.coords.longitude}`;
        guardarPreferencia('Domicilio', coords, '');
      },
      (error) => {
        alert("No pudimos obtener tu ubicación. Por favor activa el GPS en tu celular o usa la opción de escribir la dirección manual.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 font-sans text-orange-950">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-orange-100 text-center">
        
        <div className="text-5xl mb-4">🍲</div>
        <h1 className="text-2xl font-extrabold mb-2">Hornado Solidario</h1>
        <p className="text-orange-700 mb-8 text-sm">Ayúdanos a organizar tu entrega para que todo llegue perfecto.</p>

        {paso === 1 && (
          <div className="space-y-4">

            <button 
              onClick={capturarGPS}
              disabled={loading}
              className="w-full bg-[#FFB085] hover:bg-[#FF9B6A] text-orange-950 font-bold py-4 px-4 rounded-xl transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              {loading ? 'Ubicando...' : '📍 Usar mi ubicación actual para envío'}
            </button>
            <button 
              onClick={() => setPaso(2)}
              className="text-orange-600 font-medium text-sm mt-4 underline underline-offset-2"
            >
              Escribir dirección manual / Pegar link de Google Maps
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">O si prefieres</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
                        <button 
              onClick={() => guardarPreferencia('Local')}
              disabled={loading}
              className="w-full bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 font-bold py-4 px-4 rounded-xl transition-colors"
            >
              🏪 Pasaré retirando por el lugar
            </button>
          </div>
        )}

        {paso === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-sm font-bold text-left text-orange-900">Ingresa tus indicaciones de entrega:</p>
            <textarea 
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Sector La Carolina, Calle Falsa 123, casa de dos pisos. Link de Maps: https://maps.app.goo.gl/..."
              className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50/30 text-sm h-32 resize-none"
            ></textarea>
            <div className="flex gap-3">
              <button onClick={() => setPaso(1)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl">Volver</button>
              <button 
                onClick={() => guardarPreferencia('Domicilio', '', direccion)}
                disabled={loading || direccion.trim() === ''}
                className="flex-[2] bg-[#FFB085] text-orange-950 font-bold py-3 rounded-xl disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Confirmar Dirección'}
              </button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-700 mb-2">¡Preferencia Registrada!</h2>
            <p className="text-orange-700 text-sm">Muchas gracias. Ya tenemos todo organizado para tu Hornado. Puedes cerrar esta ventana.</p>
          </div>
        )}

      </div>
    </div>
  );
}