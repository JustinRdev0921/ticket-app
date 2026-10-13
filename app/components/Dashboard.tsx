export default function Dashboard({ boletos }: { boletos: any[] }) {
  const total = boletos.length;
  const vendidos = boletos.filter((b) => b.EstadoBoleto === 'Vendido').length;
  const disponibles = total - vendidos;
  const entregados = boletos.filter((b) => b.Entregado === true).length;
  const pagados = boletos.filter((b) => b.BoletoPagado === true).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 text-center">
        <p className="text-xs sm:text-sm font-medium text-orange-600 uppercase tracking-wide">Total</p>
        <p className="text-2xl sm:text-3xl font-bold text-orange-950">{total}</p>
      </div>
      <div className="bg-[#FFB085] p-4 rounded-2xl shadow-sm border border-orange-200 text-center">
        <p className="text-xs sm:text-sm font-medium text-orange-900 uppercase tracking-wide">Vendidos</p>
        <p className="text-2xl sm:text-3xl font-bold text-orange-950">{vendidos}</p>
      </div>
      <div className="bg-orange-50 p-4 rounded-2xl shadow-sm border border-orange-200 text-center">
        <p className="text-xs sm:text-sm font-medium text-orange-600 uppercase tracking-wide">Disponibles</p>
        <p className="text-2xl sm:text-3xl font-bold text-orange-900">{disponibles}</p>
      </div>
      <div className="bg-green-100 p-4 rounded-2xl shadow-sm border border-green-200 text-center">
        <p className="text-xs sm:text-sm font-medium text-green-800 uppercase tracking-wide">Entregados</p>
        <p className="text-2xl sm:text-3xl font-bold text-green-900">{entregados}</p>
      </div>
      <div className="bg-blue-100 p-4 rounded-2xl shadow-sm border border-blue-200 text-center col-span-2 lg:col-span-1">
        <p className="text-xs sm:text-sm font-medium text-blue-800 uppercase tracking-wide">Pagados</p>
        <p className="text-2xl sm:text-3xl font-bold text-blue-900">{pagados}</p>
      </div>
    </div>
  );
}