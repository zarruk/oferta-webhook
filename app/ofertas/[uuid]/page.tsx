import { notFound } from 'next/navigation';
import BotonAceptar from './BotonAceptar';
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { SPREADSHEET_ID, SHEET_ID, CREDENTIALS } from '@/app/lib/googleSheets';

interface OfertaDetalle {
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
      console.log('Comparando UUID:', rowUuid, 'con', uuid);
      return rowUuid === uuid;
    });

    console.log('Oferta encontrada:', oferta ? 'Sí' : 'No');

    if (!oferta) return null;

    return {
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
      telefono: oferta.get('Teléfono')
    };
  } catch (error) {
    console.error('Error al obtener oferta:', error);
    return null;
  }
}

export default async function OfertaPage({ params }: { params: { uuid: string } }) {
  const oferta = await obtenerOferta(params.uuid);
  
  if (!oferta) {
    notFound();
  }

  const valorFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(oferta.valorRemesa);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md">
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
        </div>

        <div className="mt-8">
          <BotonAceptar oferta={oferta} />
        </div>
      </div>
    </div>
  );
} 