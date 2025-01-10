import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { SPREADSHEET_ID, SHEET_ID, CREDENTIALS } from '@/app/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const { numeroPedido } = await request.json();

    const jwt = new JWT({
      email: CREDENTIALS.client_email,
      key: CREDENTIALS.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
    await doc.loadInfo();
    const sheet = doc.sheetsById[SHEET_ID];
    const rows = await sheet.getRows();

    // Encontrar la fila con el número de pedido
    const row = rows.find(row => row.get('Número de Pedido') === numeroPedido);
    
    if (row) {
      // Actualizar el estado
      row.set('Estado', 'Aceptada');
      await row.save();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Pedido no encontrado' });

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al actualizar estado',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 