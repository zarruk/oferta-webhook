import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { SPREADSHEET_ID, SHEET_ID, CREDENTIALS } from '@/app/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const { numeroPedido, uuid } = await request.json();

    const jwt = new JWT({
      email: CREDENTIALS.client_email,
      key: CREDENTIALS.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
    await doc.loadInfo();
    const sheet = doc.sheetsById[SHEET_ID];
    const rows = await sheet.getRows();

    // Encontrar la oferta actual por UUID
    const ofertaActual = rows.find(row => row.get('UUID') === uuid);
    
    if (!ofertaActual) {
      return NextResponse.json({ success: false, error: 'Oferta no encontrada' });
    }

    const cedulaTransportista = ofertaActual.get('Cédula');

    // Actualizar todas las ofertas del mismo transportista
    for (const row of rows) {
      if (
        row.get('Cédula') === cedulaTransportista && 
        row.get('Estado') === 'Recibido'
      ) {
        if (row.get('UUID') === uuid) {
          row.set('Estado', 'Aceptada');
        } else {
          row.set('Estado', 'Cancelada');
        }
        await row.save();
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al actualizar estado',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 