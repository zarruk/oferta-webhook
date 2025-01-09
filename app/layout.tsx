import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-800">Sistema de Ofertas</h1>
              <a 
                href="/admin/ofertas" 
                className="text-blue-600 hover:text-blue-800"
              >
                Administración
              </a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto py-8 px-4">
          {children}
        </main>
      </body>
    </html>
  )
}
