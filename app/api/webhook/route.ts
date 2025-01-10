import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { SPREADSHEET_ID, SHEET_ID, CREDENTIALS } from '@/app/lib/googleSheets';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  console.log('🟢 POST request recibido en /api/webhook');
  
  try {
    const datos = await request.json();
    console.log('📦 Datos recibidos RAW:', datos);
    console.log('🚗 Datos del vehículo:', {
      placa: datos.placa_vehiculo,
      capacidad: datos.capacidad_vehiculo,
      remolque: datos.placa_remolque
    });

    // Generar UUID para la oferta
    const uuid = uuidv4();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const ofertaUrl = `${baseUrl}/ofertas/${uuid}`;

    // Verificar método
    if (request.method !== 'POST') {
      console.log('❌ Método no permitido:', request.method);
      return NextResponse.json(
        { error: 'Método no permitido' },
        { status: 405 }
      );
    }

    // Inicializar Google Sheets
    const jwt = new JWT({
      email: CREDENTIALS.client_email,
      key: CREDENTIALS.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('🔑 JWT inicializado');
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
    await doc.loadInfo();
    const sheet = doc.sheetsById[SHEET_ID];
    console.log('📊 Google Sheets conectado');

    // Añadir fila incluyendo el UUID
    await sheet.addRow({
      'UUID': uuid,
      'Número de Pedido': datos.numeroPedido,
      'Ciudad Origen': datos.ciudadOrigen,
      'Ciudad Destino': datos.ciudadDestino,
      'Tipo de Vehículo': datos.tipoVehiculo,
      'Empresa': datos.empresa,
      'Tipo de Carga': datos.tipoCarga,
      'Valor Remesa': datos.valorRemesa,
      'Nombre': datos.nombre,
      'Apellido': datos.apellido,
      'Cédula': datos.cedula,
      'Teléfono': datos.telefono,
      'Fecha': datos.fecha,
      'Placa vehículo': datos.placa_vehiculo,
      'Capacidad de vehículo': datos.capacidad_vehiculo,
      'Placa remolque': datos.placa_remolque,
      'Estado': 'Recibido'
    });
    console.log('✅ Fila añadida:', {
      'UUID': uuid,
      'Placa Vehículo': datos.placa_vehiculo,
      'Capacidad Vehículo': datos.capacidad_vehiculo,
      'Placa Remolque': datos.placa_remolque,
    });
    console.log('✅ Datos guardados en Google Sheets');

    return NextResponse.json({ 
      success: true, 
      message: 'Datos recibidos y guardados correctamente',
      data: {
        uuid: uuid,
        url: ofertaUrl
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al procesar la solicitud',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  console.log('🔵 GET request recibido en /api/webhook');
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
} 