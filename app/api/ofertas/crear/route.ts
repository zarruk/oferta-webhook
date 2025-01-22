import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { SPREADSHEET_ID, SHEET_ID, CREDENTIALS } from '@/app/lib/googleSheets';
import { v4 as uuidv4 } from 'uuid';

// Reducir el tiempo de espera máximo para evitar timeout
const waitRandom = () => new Promise(resolve => 
  setTimeout(resolve, 500 + Math.random() * 1000) // Reducido de 1-3s a 0.5-1.5s
);

export async function POST(req: Request) {
  try {
    const oferta = await req.json();
    const uuid = uuidv4();
    
    // Añadir log inicial
    console.log('📝 Iniciando creación de oferta:', { 
      numeroPedido: oferta.numeroPedido,
      cedula: oferta.cedula 
    });
    
    for (let intento = 0; intento < 3; intento++) {
      try {
        console.log(`🔄 Intento ${intento + 1} de 3`);
        
        const jwt = new JWT({
          email: CREDENTIALS.client_email,
          key: CREDENTIALS.private_key,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
        await doc.loadInfo();
        const sheet = doc.sheetsById[SHEET_ID];

        await waitRandom();
        console.log('📊 Verificando duplicados...');

        const rows = await sheet.getRows();
        const pedidoExistente = rows.find(row => 
          row.get('Número de Pedido') === oferta.numeroPedido &&
          row.get('Cédula') === oferta.cedula
        );
        
        if (pedidoExistente) {
          console.log('⚠️ Pedido duplicado encontrado:', oferta.numeroPedido);
          return new Response(JSON.stringify({
            success: true,
            message: 'Oferta ya registrada'
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        await waitRandom();
        console.log('✍️ Guardando nueva oferta...');

        // Añadir la nueva fila
        await sheet.addRow({
          'UUID': uuid,
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

        await waitRandom();
        console.log('✅ Verificando guardado...');
        
        const rowsActualizadas = await sheet.getRows();
        const ofertaGuardada = rowsActualizadas.find(row => row.get('UUID') === uuid);
        
        if (!ofertaGuardada) {
          throw new Error('La oferta no se guardó correctamente');
        }

        console.log('🎉 Oferta creada exitosamente:', uuid);
        return new Response(JSON.stringify({
          success: true,
          message: "Oferta creada exitosamente",
          data: {
            uuid: uuid
          }
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });

      } catch (error) {
        console.error(`❌ Error en intento ${intento + 1}:`, error);
        if (intento === 2) throw error;
        await waitRandom();
      }
    }

    throw new Error('No se pudo guardar la oferta después de 3 intentos');

  } catch (error) {
    console.error('❌ Error fatal al crear oferta:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: "Error al crear la oferta",
      error: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 