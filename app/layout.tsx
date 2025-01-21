import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sistema de Ofertas',
  description: 'Sistema de gestión de ofertas de transporte',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
