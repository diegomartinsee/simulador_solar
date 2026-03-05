import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Simulador Solar | Investimento Fotovoltaico',
  description: 'Ferramenta interna para simulação de retorno em energia solar',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
