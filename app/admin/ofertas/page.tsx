import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { SPREADSHEET_ID, SHEET_ID, CREDENTIALS } from '@/app/lib/googleSheets';

interface DatosRemesa {
  numeroPedido: string;
  ciudadOrigen: string;
  ciudadDestino: string;
  tipoVehiculo: string;
  empresa: string;
  tipoCarga: string;
  valorRemesa: number;
  nombre: string;
  apellido: string;
  placa: string;
  cedula: string;
  telefono: string;
  estado: string;
  URL: string;
  UUID: string;
  fecha: string;
}

async function obtenerOfertas(): Promise<DatosRemesa[]> {
  try {
    console.log('Iniciando obtención de ofertas...');
    
    const jwt = new JWT({
      email: CREDENTIALS.client_email,
      key: CREDENTIALS.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('JWT creado, conectando con el documento...');
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
    await doc.loadInfo();
    
    console.log('Documento cargado, accediendo a la hoja...');
    const sheet = doc.sheetsById[SHEET_ID];
    const rows = await sheet.getRows();
    
    console.log('Filas obtenidas:', rows.length);
    console.log('Primera fila:', rows[0]?._rawData);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const ofertas = rows.map(row => {
      console.log('Procesando fila:', row._rawData);
      const numeroPedido = row.get('Número de Pedido');
      return {
        numeroPedido,
        ciudadOrigen: row.get('Ciudad Origen'),
        ciudadDestino: row.get('Ciudad Destino'),
        tipoVehiculo: row.get('Tipo de Vehículo'),
        empresa: row.get('Empresa'),
        tipoCarga: row.get('Tipo de Carga'),
        valorRemesa: parseFloat(row.get('Valor Remesa')) || 0,
        nombre: row.get('Nombre'),
        apellido: row.get('Apellido'),
        placa: row.get('Placa'),
        cedula: row.get('Cédula'),
        telefono: row.get('Teléfono'),
        estado: row.get('Estado'),
        URL: row.get('URL') || `${baseUrl}/ofertas/${numeroPedido}`,
        UUID: row.get('UUID'),
        fecha: row.get('Fecha')
      };
    });

    console.log('Ofertas procesadas:', ofertas);
    return ofertas;
    
  } catch (error) {
    console.error('Error al obtener ofertas:', error);
    throw error;
  }
}

export default async function AdminOfertas() {
  const ofertas = await obtenerOfertas();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Administración de Ofertas</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Número de Pedido</th>
              <th className="px-4 py-2 border">Ciudad Origen</th>
              <th className="px-4 py-2 border">Ciudad Destino</th>
              <th className="px-4 py-2 border">Tipo de Vehículo</th>
              <th className="px-4 py-2 border">Empresa</th>
              <th className="px-4 py-2 border">Tipo de Carga</th>
              <th className="px-4 py-2 border">Valor Remesa</th>
              <th className="px-4 py-2 border">Nombre</th>
              <th className="px-4 py-2 border">Apellido</th>
              <th className="px-4 py-2 border">Placa</th>
              <th className="px-4 py-2 border">Cédula</th>
              <th className="px-4 py-2 border">Teléfono</th>
              <th className="px-4 py-2 border">Estado</th>
              <th className="px-4 py-2 border">URL</th>
              <th className="px-4 py-2 border">UUID</th>
              <th className="px-4 py-2 border">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ofertas.length === 0 ? (
              <tr>
                <td colSpan={15} className="px-4 py-2 text-center border">
                  No hay ofertas disponibles
                </td>
              </tr>
            ) : (
              ofertas.map((oferta, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{oferta.numeroPedido}</td>
                  <td className="px-4 py-2 border">{oferta.ciudadOrigen}</td>
                  <td className="px-4 py-2 border">{oferta.ciudadDestino}</td>
                  <td className="px-4 py-2 border">{oferta.tipoVehiculo}</td>
                  <td className="px-4 py-2 border">{oferta.empresa}</td>
                  <td className="px-4 py-2 border">{oferta.tipoCarga}</td>
                  <td className="px-4 py-2 border">{oferta.valorRemesa}</td>
                  <td className="px-4 py-2 border">{oferta.nombre}</td>
                  <td className="px-4 py-2 border">{oferta.apellido}</td>
                  <td className="px-4 py-2 border">{oferta.placa}</td>
                  <td className="px-4 py-2 border">{oferta.cedula}</td>
                  <td className="px-4 py-2 border">{oferta.telefono}</td>
                  <td className="px-4 py-2 border">{oferta.estado}</td>
                  <td className="px-4 py-2 border">
                    <a 
                      href={oferta.URL}
                      className="text-blue-600 hover:text-blue-800 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver oferta
                    </a>
                  </td>
                  <td className="px-4 py-2 border">{oferta.UUID}</td>
                  <td className="px-4 py-2 border">{oferta.fecha}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 