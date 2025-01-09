async function enviarPrueba() {
  try {
    const response = await fetch('https://9b9b-186-113-8-194.ngrok-free.app/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        numeroPedido: "12345",
        ciudadOrigen: "Bogotá",
        ciudadDestino: "Medellín",
        tipoVehiculo: "Camión",
        empresa: "Mi Empresa",
        tipoCarga: "General",
        valorRemesa: 1000000,
        nombre: "Juan",
        apellido: "Pérez",
        cedula: "123456789",
        telefono: "3001234567",
        fecha: new Date().toISOString()
      })
    });

    console.log('Status:', response.status);
    const texto = await response.text();
    console.log('Respuesta:', texto);
  } catch (error) {
    console.error('Error:', error);
  }
}

enviarPrueba(); 