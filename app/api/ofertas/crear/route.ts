import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { SPREADSHEET_ID, SHEET_ID, CREDENTIALS } from '@/app/lib/googleSheets';
import { v4 as uuidv4 } from 'uuid';

// Función para esperar un tiempo determinado
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    const oferta = await request.json();
    const uuid = uuidv4(); // Generamos el UUID aquí
    
    // Intentar hasta 3 veces con retraso exponencial
    for (let intento = 0; intento < 3; intento++) {
      try {
        const jwt = new JWT({
          email: CREDENTIALS.client_email,
          key: CREDENTIALS.private_key,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
        await doc.loadInfo();
        const sheet = doc.sheetsById[SHEET_ID];

        // Obtener todas las filas actuales
        const rows = await sheet.getRows();
        
        // Verificar si el número de pedido ya existe
        const pedidoExistente = rows.find(row => 
          row.get('Número de Pedido') === oferta.numeroPedido &&
          row.get('Cédula') === oferta.cedula
        );
        
        if (pedidoExistente) {
          console.log('Pedido ya existe para esta cédula:', oferta.numeroPedido);
          return NextResponse.json({ success: true, message: 'Oferta ya registrada' });
        }

        // Añadir la nueva fila
        await sheet.addRow({
          'UUID': uuid, // Usamos el UUID generado
          'Número de Pedido': oferta.numeroPedido,
          'Ciudad Origen': oferta.ciudadOrigen,
          'Ciudad Destino': oferta.ciudadDestino,
          'Tipo de Vehículo': oferta.tipoVehiculo,
          'Empresa': oferta.empresa,
          'Tipo de Carga': oferta.tipoCarga,
          'Valor Remesa': oferta.valorRemesa,
          'Nombre': oferta.nombre,
          'Apellido': oferta.apellido,
          'Cédula': oferta.cedula,
          'Teléfono': oferta.telefono,
          'Fecha': oferta.fecha,
          'Estado': 'Recibido',
          'Placa vehículo': oferta.placa_vehiculo || '',
          'Capacidad de vehículo': oferta.capacidad_vehiculo || '',
          'Placa remolque': oferta.placa_remolque || ''
        });

        // Esperar un momento para asegurar que la escritura se complete
        await wait(1000);

        // Verificar que la oferta se guardó correctamente
        const rowsActualizadas = await sheet.getRows();
        const ofertaGuardada = rowsActualizadas.find(row => row.get('UUID') === uuid);
        
        if (!ofertaGuardada) {
          throw new Error('La oferta no se guardó correctamente');
        }

        // Devolver el UUID generado
        return NextResponse.json({ 
          success: true,
          uuid: uuid
        });

      } catch (error) {
        console.error(`Error en intento ${intento + 1}:`, error);
        
        if (intento === 2) throw error;
        
        await wait(Math.pow(2, intento) * 500);
      }
    }

    throw new Error('No se pudo guardar la oferta después de 3 intentos');

  } catch (error) {
    console.error('Error al crear oferta:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al crear oferta',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 