'use client';

interface Props {
  oferta: {
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
}

export default function BotonAceptar({ oferta }: Props) {
  const handleClick = async () => {
    try {
      console.log('Enviando datos:', oferta); // Para debug

      const response = await fetch('https://workflows.ops.sandbox.cuentamono.com/webhook/f3ff9ef5-218d-4c67-a1b1-04cc5c1a4674', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          numeroPedido: oferta.numeroPedido,
          ciudadOrigen: oferta.ciudadOrigen,
          ciudadDestino: oferta.ciudadDestino,
          tipoVehiculo: oferta.tipoVehiculo,
          empresa: oferta.empresa,
          tipoCarga: oferta.tipoCarga,
          valorRemesa: oferta.valorRemesa,
          nombre: oferta.nombre,
          apellido: oferta.apellido,
          cedula: oferta.cedula,
          telefono: oferta.telefono,
          fecha: oferta.fecha
        })
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        throw new Error('Error al enviar la oferta: ' + text);
      }

      alert('Oferta aceptada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al aceptar la oferta: ' + (error as Error).message);
    }
  };

  return (
    <button 
      className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
      onClick={handleClick}
    >
      Aceptar Oferta
    </button>
  );
} 