import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  const { data, error } = await supabase
    .from('boletos')
    .select('*')
    .order('NumeroBoleto', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  // Se recibe BoletoPagado
  const { numerosBoletos, NombreComprador, NumeroTelefonoComprador, Vendedor, BoletoPagado } = body;

  const { data, error } = await supabase
    .from('boletos')
    .update({
      EstadoBoleto: 'Vendido',
      NombreComprador,
      NumeroTelefonoComprador,
      Vendedor,
      BoletoPagado, // Nuevo campo
      Entregado: false
    })
    .in('NumeroBoleto', numerosBoletos)
    .eq('EstadoBoleto', 'Disponible') 
    .select();

  if (error) return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 });

  if (!data || data.length !== numerosBoletos.length) {
    return NextResponse.json(
      { error: 'Uno o varios de los boletos seleccionados acaban de ser vendidos o no existen.' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, message: 'Venta registrada con éxito' });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { NumeroBoleto } = body;

  const { data, error } = await supabase
    .from('boletos')
    .update({ Entregado: true })
    .eq('NumeroBoleto', Number(NumeroBoleto))
    .eq('EstadoBoleto', 'Vendido')
    .eq('Entregado', false)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Boleto inválido, no vendido, o ya entregado' }, { status: 400 });
  }

  return NextResponse.json({ success: true, boleto: data });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const { NumeroBoleto } = body;

  const { error } = await supabase
    .from('boletos')
    .update({
      EstadoBoleto: 'Disponible',
      NombreComprador: '',
      NumeroTelefonoComprador: '',
      Vendedor: '',
      BoletoPagado: false, // Se resetea el campo
      Entregado: false
    })
    .eq('NumeroBoleto', Number(NumeroBoleto));

  if (error) return NextResponse.json({ error: 'Error eliminando el registro' }, { status: 500 });
  return NextResponse.json({ success: true, message: 'Registro eliminado' });
}