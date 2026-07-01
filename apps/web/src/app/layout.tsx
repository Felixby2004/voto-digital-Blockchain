import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/ui/Navbar';

export const metadata: Metadata = {
  title: 'NextVote',
  description: 'Sistema de votación digital universitario',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <Providers>
          <Navbar />
          <main className="container mx-auto py-8 px-4">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
