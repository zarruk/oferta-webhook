import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { numeroPedido: string } }
) {
  try {
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 