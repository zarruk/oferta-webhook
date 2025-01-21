import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(
  _request: Request,
  { params }: { params: { numeroPedido: string } }
) {
  try {
    const { numeroPedido } = params;
    const filePath = path.join(process.cwd(), 'data', `${numeroPedido}.json`);
    await fs.unlink(filePath);
    
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar oferta:', error);
    return new NextResponse(null, { status: 500 });
  }
} 