import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  style: ['normal', 'italic'],
});

export const viewport = {
  themeColor: '#1a1625',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'LuminaSphere - The Immersive Culture OS',
  description: 'Your ultimate reading companion with AI-powered mood recommendations',
  keywords: ['reading', 'books', 'AI', 'recommendations', 'library'],
  authors: [{ name: 'Veloxia' }],
};

import { Providers } from './providers';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { cookies } from 'next/headers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const lang = cookieStore.get('lumina-locale')?.value || 'en';

  return (
    <html lang={lang} className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <ToastProvider />
          {children}
        </Providers>
      </body>
    </html>
  );
}
