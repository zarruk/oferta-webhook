import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

type Params = {
  params: {
    numeroPedido: string;
  };
};

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const filePath = path.join(process.cwd(), 'data', `${params.numeroPedido}.json`);
    await fs.unlink(filePath);
    
    return NextResponse.json({ mensaje: 'Oferta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar oferta:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la oferta' },
      { status: 500 }
    );
  }
} 