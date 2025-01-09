export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Sistema de Ofertas</h1>
      <p className="text-lg text-gray-600">
        Bienvenido al sistema de gestión de ofertas
      </p>
      <div className="mt-8">
        <a 
          href="/admin/ofertas" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Ver Ofertas
        </a>
      </div>
    </div>
  );
} 