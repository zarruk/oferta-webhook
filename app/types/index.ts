export interface DatosRemesa {
  numeroPedido: string;
  ciudadOrigen: string;
  ciudadDestino: string;
  tipoVehiculo: string;
  empresa: string;
  tipoCarga: string;
  valorRemesa: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  fecha: string;
  estado: string;
  URL?: string;
  UUID?: string;
  // Nuevos campos
  placa_vehiculo?: string;
  capacidad_vehiculo?: string;
  placa_remolque?: string;
} 