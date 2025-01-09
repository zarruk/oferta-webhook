'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DatosRemesa {
  ciudadOrigen: string;
  ciudadDestino: string;
  tipoVehiculo: string;
  empresa: string;
  tipoCarga: string;
  valorRemesa: number;
  numeroPedido: string;
}

export default function OfertasTable({ ofertas }: { ofertas: DatosRemesa[] }) {
  const [selectedOfertas, setSelectedOfertas] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedOfertas.length === ofertas.length) {
      setSelectedOfertas([]);
    } else {
      setSelectedOfertas(ofertas.map(o => o.numeroPedido));
    }
  };

  const toggleSelect = (numeroPedido: string) => {
    setSelectedOfertas(prev => 
      prev.includes(numeroPedido)
        ? prev.filter(id => id !== numeroPedido)
        : [...prev, numeroPedido]
    );
  };

  const eliminarSeleccionadas = async () => {
    if (!selectedOfertas.length) return;
    
    if (confirm(`¿Estás seguro de que quieres eliminar ${selectedOfertas.length} ofertas?`)) {
      try {
        await Promise.all(
          selectedOfertas.map(numeroPedido =>
            fetch(`/api/ofertas/${numeroPedido}`, { method: 'DELETE' })
          )
        );
        window.location.reload();
      } catch (error) {
        console.error('Error al eliminar ofertas:', error);
        alert('Error al eliminar algunas ofertas');
      }
    }
  };

  return (
    <div>
      {selectedOfertas.length > 0 && (
        <div className="mb-4 p-2 bg-gray-100 rounded flex justify-between items-center">
          <span className="text-gray-700">
            {selectedOfertas.length} ofertas seleccionadas
          </span>
          <button
            onClick={eliminarSeleccionadas}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Eliminar Seleccionadas
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedOfertas.length === ofertas.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pedido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ruta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ofertas.map((oferta) => (
              <tr key={oferta.numeroPedido} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedOfertas.includes(oferta.numeroPedido)}
                    onChange={() => toggleSelect(oferta.numeroPedido)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {oferta.numeroPedido}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {oferta.ciudadOrigen} → {oferta.ciudadDestino}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {oferta.empresa}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {oferta.tipoVehiculo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex gap-2">
                    <Link
                      href={`/ofertas/${oferta.numeroPedido}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 