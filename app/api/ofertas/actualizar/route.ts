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

    // Obtener la cédula del transportista
    const cedulaTransportista = ofertaRow.get('Cédula');
    console.log('🔍 Cédula del transportista:', cedulaTransportista);

    // Actualizar todas las ofertas del mismo transportista
    console.log('📝 Actualizando ofertas del transportista...');
    for (const row of rows) {
      // Solo procesar ofertas del mismo transportista que estén en estado "Recibido"
      if (row.get('Cédula') === cedulaTransportista && row.get('Estado') === 'Recibido') {
        if (row.get('UUID') === data.uuid) {
          console.log('✅ Aceptando oferta:', row.get('UUID'));
          row.set('Estado', 'Aceptado');
        } else {
          console.log('❌ Cancelando oferta:', row.get('UUID'));
          row.set('Estado', 'Cancelado');
        }
        await row.save();
        // Esperar un momento entre actualizaciones para evitar rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Verificar que los cambios se guardaron
    const rowsActualizadas = await sheet.getRows();
    console.log('🔍 Verificando estados actualizados:');
    rowsActualizadas
      .filter(row => row.get('Cédula') === cedulaTransportista)
      .forEach(row => {
        console.log(`- Oferta ${row.get('UUID')}: ${row.get('Estado')}`);
      });

    console.log('✅ Todas las ofertas actualizadas exitosamente');
    return new Response(JSON.stringify({
      success: true,
      message: 'Estados actualizados correctamente'
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