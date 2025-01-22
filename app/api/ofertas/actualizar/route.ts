import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { SPREADSHEET_ID, SHEET_ID, CREDENTIALS } from '@/app/lib/googleSheets';

export async function POST(req: Request) {
  try {
    console.log('🔄 Iniciando actualización de oferta...');
    const data = await req.json();
    console.log('📦 Datos recibidos:', data);

    if (!data.uuid) {
      console.error('❌ UUID no proporcionado');
      return new Response(JSON.stringify({
        success: false,
        message: 'UUID no proporcionado'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    const jwt = new JWT({
      email: CREDENTIALS.client_email,
      key: CREDENTIALS.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('🔑 Conectando a Google Sheets...');
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
    await doc.loadInfo();
    const sheet = doc.sheetsById[SHEET_ID];

    console.log('📊 Buscando oferta con UUID:', data.uuid);
    const rows = await sheet.getRows();
    
    console.log('Filas totales:', rows.length);
    console.log('UUIDs disponibles:', rows.map(row => row.get('UUID')));
    
    const ofertaRow = rows.find(row => row.get('UUID') === data.uuid);

    if (!ofertaRow) {
      console.error('❌ Oferta no encontrada para UUID:', data.uuid);
      return new Response(JSON.stringify({
        success: false,
        message: 'Oferta no encontrada'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('✍️ Actualizando estado de la oferta...');
    ofertaRow.set('Estado', 'Aceptado');
    await ofertaRow.save();

    console.log('✅ Oferta actualizada exitosamente');
    return new Response(JSON.stringify({
      success: true,
      message: 'Estado actualizado correctamente'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Error al actualizar oferta:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error al actualizar oferta',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 