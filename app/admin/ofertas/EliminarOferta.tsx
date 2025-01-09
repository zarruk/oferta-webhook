'use client';

export default function EliminarOferta({ numeroPedido }: { numeroPedido: string }) {
  const eliminarOferta = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta oferta?')) {
      try {
        const response = await fetch(`/api/ofertas/${numeroPedido}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Recargar la página para actualizar la lista
          window.location.reload();
        } else {
          alert('Error al eliminar la oferta');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la oferta');
      }
    }
  };

  return (
    <button
      onClick={eliminarOferta}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Eliminar
    </button>
  );
} 