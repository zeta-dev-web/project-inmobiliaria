import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/src/components/providers/SessionProvider';
import { TanstackQueryProvider } from '@/src/components/providers/TanstackQueryProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GoogleAnalytics from '@/src/components/GoogleAnalytics';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const APP_NAME = 'Polar Inmobiliaria';
const APP_DEFAULT_TITLE =
  'Polar Inmobiliaria - Raíces familiares, soluciones profesionales desde hace 30 años';
const APP_TITLE_TEMPLATE = '%s | Polar Inmobiliaria';
const APP_DESCRIPTION =
  'Polar Inmobiliaria en Tafí Viejo, Tucumán. Más de 30 años de experiencia en alquileres, ventas, administración de propiedades, tasaciones y contratos. Encontrá tu hogar ideal.';

export const metadata: Metadata = {
  metadataBase: new URL('https://polarinmobiliaria.com.ar'),
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    'inmobiliaria',
    'inmobiliaria Tafí Viejo',
    'inmobiliaria Tucumán',
    'propiedades',
    'alquiler',
    'venta',
    'Tafí Viejo',
    'Tucumán',
    'Argentina',
    'casas',
    'departamentos',
    'tasaciones',
    'valuaciones',
    'administración de alquileres',
    'contratos de alquiler',
    'Polar Inmobiliaria',
  ],
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: '#FFFFFF',
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    url: 'https://polarinmobiliaria.com.ar',
    images: [
      {
        url: '/favicon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Logo de Polar Inmobiliaria',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export function generateViewport() {
  return {
    themeColor: '#FFFFFF',
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'RealEstateAgent',
              name: 'Polar Inmobiliaria',
              description:
                'Inmobiliaria en Tafí Viejo, Tucumán con más de 30 años de experiencia',
              url: 'https://polarinmobiliaria.com.ar',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Tafí Viejo',
                addressRegion: 'Tucumán',
                addressCountry: 'AR',
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <SessionProvider>
          <TanstackQueryProvider>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={4000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </TanstackQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
