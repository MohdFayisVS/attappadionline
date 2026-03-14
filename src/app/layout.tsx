import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProvideSession from '@/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'Attappadi Online | Premium Malayalam News',
  description: 'The latest local news, video news, community updates and more from Attappadi, Kerala.',
  openGraph: {
    title: 'Attappadi Online | Premium Malayalam News',
    description: 'The latest local news, video news, community updates and more from Attappadi, Kerala.',
    url: 'https://attappadionline.com',
    siteName: 'Attappadi Online',
    images: [
      {
        url: 'https://attappadionline.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ml_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Attappadi Online | Premium Malayalam News',
    description: 'The latest local news, video news, community updates and more from Attappadi, Kerala.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ml">
      <body>
        <ProvideSession>
          <Header />
          <main>{children}</main>
          <Footer />
        </ProvideSession>
      </body>
    </html>
  );
}
