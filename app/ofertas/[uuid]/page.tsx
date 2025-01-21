import { notFound } from 'next/navigation';
import BotonAceptar from './BotonAceptar';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { SPREADSHEET_ID, SHEET_ID, CREDENTIALS } from '@/app/lib/googleSheets';
import { redirect } from 'next/navigation';

interface OfertaDetalle {
  uuid: string;
  numeroPedido: string;
  ciudadOrigen: string;
  ciudadDestino: string;
  tipoVehiculo: string;
  empresa: string;
  tipoCarga: string;
  valorRemesa: number;
  nombre: string;
  apellido: string;
  fecha: string;
  cedula: string;
  telefono: string;
  placa_vehiculo?: string;
  capacidad_vehiculo?: string;
  placa_remolque?: string;
  estado: string;
}

async function obtenerOferta(uuid: string): Promise<OfertaDetalle | null> {
  try {
    console.log('Iniciando búsqueda de oferta con UUID:', uuid);
    
    const jwt = new JWT({
      email: CREDENTIALS.client_email,
      key: CREDENTIALS.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
    await doc.loadInfo();
    console.log('Documento cargado');

    const sheet = doc.sheetsById[SHEET_ID];
    const rows = await sheet.getRows();
    console.log('Total de filas:', rows.length);

    // Imprimir los UUIDs disponibles
    const uuids = rows.map(row => row.get('UUID'));
    console.log('UUIDs disponibles:', uuids);

    const oferta = rows.find(row => {
      const rowUuid = row.get('UUID');
      console.log('Fila completa:', {
        uuid: rowUuid,
        placa: row.get('Placa vehículo'),
        capacidad: row.get('Capacidad de vehículo'),
        remolque: row.get('Placa remolque')
      });
      return rowUuid === uuid;
    });

    console.log('Oferta encontrada:', oferta ? 'Sí' : 'No');

    if (!oferta) return null;

    // Verificar el estado
    const estado = oferta.get('Estado');
    if (estado !== 'Recibido') {
      return {
        uuid: uuid,
        estado: estado,
        numeroPedido: oferta.get('Número de Pedido'),
        ciudadOrigen: oferta.get('Ciudad Origen'),
        ciudadDestino: oferta.get('Ciudad Destino'),
        tipoVehiculo: oferta.get('Tipo de Vehículo'),
        empresa: oferta.get('Empresa'),
        tipoCarga: oferta.get('Tipo de Carga'),
        valorRemesa: parseFloat(oferta.get('Valor Remesa')),
        nombre: oferta.get('Nombre'),
        apellido: oferta.get('Apellido'),
        fecha: oferta.get('Fecha'),
        cedula: oferta.get('Cédula'),
        telefono: oferta.get('Teléfono'),
        placa_vehiculo: oferta.get('Placa vehículo'),
        capacidad_vehiculo: oferta.get('Capacidad de vehículo'),
        placa_remolque: oferta.get('Placa remolque')
      };
    }

    console.log('🔍 Datos de la fila:', oferta ? {
      placa_vehiculo: oferta.get('Placa Vehículo'),
      capacidad_vehiculo: oferta.get('Capacidad Vehículo'),
      placa_remolque: oferta.get('Placa Remolque')
    } : null);

    console.log('Fila encontrada:', oferta ? {
      'Número de Pedido': oferta.get('Número de Pedido'),
      'Capacidad de vehículo (raw)': oferta.get('Capacidad de vehículo'),
      'Capacidad de vehículo (columna Q)': oferta.get('Q'),
      'Todos los campos': Object.fromEntries(
        Object.entries(oferta.toObject())
      )
    } : null);

    return {
      uuid: uuid,
      estado: estado,
      numeroPedido: oferta.get('Número de Pedido'),
      ciudadOrigen: oferta.get('Ciudad Origen'),
      ciudadDestino: oferta.get('Ciudad Destino'),
      tipoVehiculo: oferta.get('Tipo de Vehículo'),
      empresa: oferta.get('Empresa'),
      tipoCarga: oferta.get('Tipo de Carga'),
      valorRemesa: parseFloat(oferta.get('Valor Remesa')),
      nombre: oferta.get('Nombre'),
      apellido: oferta.get('Apellido'),
      fecha: oferta.get('Fecha'),
      cedula: oferta.get('Cédula'),
      telefono: oferta.get('Teléfono'),
      placa_vehiculo: oferta.get('Placa vehículo'),
      capacidad_vehiculo: oferta.get('Capacidad de vehículo'),
      placa_remolque: oferta.get('Placa remolque')
    };
  } catch (error) {
    console.error('Error al obtener oferta:', error);
    return null;
  }
}

export default async function OfertaPage({
  params,
}: {
  params: { uuid: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const oferta = await obtenerOferta(params.uuid);
  
  if (!oferta) {
    notFound();
  }

  // Si la oferta no está en estado "Recibido", mostrar mensaje
  if (oferta.estado !== 'Recibido') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Oferta no disponible
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Esta oferta ya no está vigente. Su estado actual es: {oferta.estado}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const valorFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(oferta.valorRemesa);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Detalles de la Oferta</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">
            Oferta: {oferta.numeroPedido}
          </h1>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Ciudad Origen</h3>
              <p className="mt-1 text-lg text-gray-900">{oferta.ciudadOrigen}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Ciudad Destino</h3>
              <p className="mt-1 text-lg text-gray-900">{oferta.ciudadDestino}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tipo de Vehículo</h3>
              <p className="mt-1 text-lg text-gray-900">{oferta.tipoVehiculo}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Empresa</h3>
              <p className="mt-1 text-lg text-gray-900">{oferta.empresa}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tipo de Carga</h3>
              <p className="mt-1 text-lg text-gray-900">{oferta.tipoCarga}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Valor de Remesa</h3>
              <p className="mt-1 text-lg text-gray-900">{valorFormateado}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Responsable</h3>
              <p className="mt-1 text-lg text-gray-900">{oferta.nombre} {oferta.apellido}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Fecha</h3>
              <p className="mt-1 text-lg text-gray-900">{oferta.fecha}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Cédula</h3>
              <p className="mt-1 text-lg text-gray-900">{oferta.cedula}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
              <p className="mt-1 text-lg text-gray-900">{oferta.telefono}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Placa del Vehículo</h3>
              <p className="mt-1 text-lg text-gray-900">{oferta.placa_vehiculo || 'No especificado'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Capacidad del Vehículo</h3>
              <p className="mt-1 text-lg text-gray-900">{oferta.capacidad_vehiculo || 'No especificado'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Placa del Remolque</h3>
              <p className="mt-1 text-lg text-gray-900">{oferta.placa_remolque || 'No especificado'}</p>
            </div>
          </div>

          <div className="mt-8">
            <BotonAceptar oferta={oferta} />
          </div>
        </div>
      </div>
    </div>
  );
} 