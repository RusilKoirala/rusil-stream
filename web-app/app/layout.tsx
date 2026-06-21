import type { Metadata } from "next";
import localFont from 'next/font/local';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryClientProvider } from '@/lib/query-client';
import { Analytics } from '@vercel/analytics/next';
import { BraveBanner } from '@/components/brave-banner';
import "./globals.css";

const netflixSans = localFont({
  src: [
    {
      path: '../public/fonts/NetflixSans-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/NetflixSans-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/NetflixSans-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/NetflixSans-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://rusil.me'),
  title: {
    default: 'Rusil Stream',
    template: '%s | Rusil Stream',
  },
  description: 'Rusil Stream is a modern streaming experience for movies and TV shows.',
  applicationName: 'Rusil Stream',
  openGraph: {
    title: 'Rusil Stream',
    description: 'Rusil Stream is a modern streaming experience for movies and TV shows.',
    siteName: 'Rusil Stream',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rusil Stream',
    description: 'Rusil Stream is a modern streaming experience for movies and TV shows.',
  },
  appleWebApp: {
    title: 'Rusil Stream',
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appContent = (
    <QueryClientProvider>
      <html
        lang="en"
        className={`${netflixSans.variable} dark h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {children}
          <BraveBanner />
          <Analytics />
        </body>
      </html>
    </QueryClientProvider>
  );

  return <ClerkProvider>{appContent}</ClerkProvider>;
}
