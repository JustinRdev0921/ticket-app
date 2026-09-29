import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'boletos.json');

export async function GET() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Error leyendo la base de datos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { numerosBoletos, NombreComprador, NumeroTelefonoComprador, Vendedor } = body; 

    const data = await fs.readFile(filePath, 'utf-8');
    let boletos = JSON.parse(data);

    for (const num of numerosBoletos) {
      const index = boletos.findIndex((b: any) => b.NumeroBoleto === Number(num));
      if (index === -1) return NextResponse.json({ error: `Boleto #${num} no existe (1-700)` }, { status: 404 });
      if (boletos[index].EstadoBoleto === 'Vendido') return NextResponse.json({ error: `El boleto #${num} ya está vendido` }, { status: 400 });
    }

    numerosBoletos.forEach((num: number) => {
      const index = boletos.findIndex((b: any) => b.NumeroBoleto === Number(num));
      boletos[index].EstadoBoleto = 'Vendido';
      boletos[index].NombreComprador = NombreComprador;
      boletos[index].NumeroTelefonoComprador = NumeroTelefonoComprador;
      boletos[index].Vendedor = Vendedor; // Se registra el vendedor
      boletos[index].Entregado = false; 
    });

    await fs.writeFile(filePath, JSON.stringify(boletos, null, 2), 'utf-8');
    return NextResponse.json({ success: true, message: 'Venta registrada con éxito' });
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando la venta' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { NumeroBoleto } = body;

    const data = await fs.readFile(filePath, 'utf-8');
    let boletos = JSON.parse(data);

    const index = boletos.findIndex((b: any) => b.NumeroBoleto === Number(NumeroBoleto));
    
    if (index === -1) return NextResponse.json({ error: 'Boleto no encontrado' }, { status: 404 });
    if (boletos[index].EstadoBoleto !== 'Vendido') return NextResponse.json({ error: 'Este boleto no ha sido vendido aún' }, { status: 400 });
    if (boletos[index].Entregado) return NextResponse.json({ error: 'La comida de este boleto ya fue entregada' }, { status: 400 });

    boletos[index].Entregado = true;

    await fs.writeFile(filePath, JSON.stringify(boletos, null, 2), 'utf-8');
    return NextResponse.json({ success: true, boleto: boletos[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando la entrega' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { NumeroBoleto } = body;

    const data = await fs.readFile(filePath, 'utf-8');
    let boletos = JSON.parse(data);

    const index = boletos.findIndex((b: any) => b.NumeroBoleto === Number(NumeroBoleto));
    
    if (index === -1) {
      return NextResponse.json({ error: 'Boleto no encontrado' }, { status: 404 });
    }

    // Revertir al estado original
    boletos[index].EstadoBoleto = 'Disponible';
    boletos[index].NombreComprador = '';
    boletos[index].NumeroTelefonoComprador = '';
    boletos[index].Vendedor = '';
    boletos[index].Entregado = false;

    // Guardar cambios
    await fs.writeFile(filePath, JSON.stringify(boletos, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, message: 'Registro eliminado con éxito' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al intentar eliminar el registro' }, { status: 500 });
  }
}