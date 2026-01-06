import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "Rusil Stream - Watch Movies & TV Shows Online",
  description: "Stream unlimited movies and TV shows on Rusil Stream. Educational streaming platform built with Next.js, MongoDB, and TMDB API. Watch anywhere, anytime.",
  keywords: "streaming, movies, tv shows, watch online, rusil stream, netflix alternative, educational project",
  authors: [{ name: "Rusil Koirala", url: "https://rusilkoirala.com.np" }],
  creator: "Rusil Koirala",
  publisher: "Rusil Koirala",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rusilstream.com",
    title: "Rusil Stream - Watch Movies & TV Shows Online",
    description: "Stream unlimited movies and TV shows. Educational streaming platform showcasing modern web development.",
    siteName: "Rusil Stream",
    images: [
      {
        url: "/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "Rusil Stream Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Rusil Stream - Watch Movies & TV Shows Online",
    description: "Stream unlimited movies and TV shows. Educational streaming platform.",
    images: ["/logo/logo.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo/logo.png", sizes: "any" }
    ],
    shortcut: "/favicon.svg",
    apple: "/logo/logo.png"
  },
  manifest: "/manifest.json"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <Analytics/>
        {children}
      </body>
    </html>
  );
}
