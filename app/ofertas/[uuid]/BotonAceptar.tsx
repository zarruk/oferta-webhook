'use client';

import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import axios from 'axios';

interface Props {
  oferta: {
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
    cedula: string;
    telefono: string;
    fecha: string;
    placa_vehiculo?: string;
    capacidad_vehiculo?: string;
    placa_remolque?: string;
  };
}

export default function BotonAceptar({ oferta }: Props) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      console.log('🚀 Iniciando proceso de aceptación...');
      
      // Primero actualizar el estado en Google Sheets
      console.log('📝 Actualizando estado en Sheets...');
      const updateResponse = await fetch('/api/ofertas/actualizar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uuid: oferta.uuid
        })
      });

      if (!updateResponse.ok) {
        throw new Error(`Error al actualizar estado: ${updateResponse.status}`);
      }

      const updateData = await updateResponse.json();
      console.log('✅ Respuesta de actualización:', updateData);

      if (!updateData.success) {
        throw new Error(updateData.message || 'Error al actualizar estado');
      }

      try {
        // Luego enviar a webhook
        console.log('🌐 Enviando a webhook...');
        const payload = {
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
          fecha: oferta.fecha,
          placa_vehiculo: oferta.placa_vehiculo || '',
          capacidad_vehiculo: oferta.capacidad_vehiculo || '',
          placa_remolque: oferta.placa_remolque || ''
        };

        const webhookResponse = await axios.post(
          'https://summologistics.app.n8n.cloud/webhook/f3ff9ef5-218d-4c67-a1b1-04cc5c1a4674',
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 10000
          }
        );

        console.log('✅ Respuesta de webhook:', webhookResponse.data);
      } catch (webhookError) {
        console.error('⚠️ Error al enviar webhook (no crítico):', webhookError);
        // Continuamos aunque falle el webhook
      }

      // Mostrar éxito incluso si falla el webhook
      setShowSuccess(true);

    } catch (error) {
      console.error('❌ Error en el proceso:', error);
      if (axios.isAxiosError(error)) {
        console.error('Detalles del error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
      alert('Error al procesar la oferta. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? 'Procesando...' : 'Aceptar Oferta'}
      </button>

      <Transition show={showSuccess} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-10"
          onClose={() => {
            setShowSuccess(false);
            window.location.reload();
          }}
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
          
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <Dialog.Title 
                  as="h3" 
                  className="text-lg font-medium leading-6 text-gray-900 text-center mt-4"
                >
                  ¡Oferta aceptada exitosamente!
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 text-center">
                    La oferta ha sido aceptada y las demás ofertas asociadas a tu cédula han sido canceladas.
                  </p>
                </div>
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => {
                      setShowSuccess(false);
                      window.location.reload();
                    }}
                  >
                    Entendido
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
} 