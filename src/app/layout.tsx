import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PolyDub - AI-Powered Universal Dubbing",
    template: "%s | PolyDub",
  },
  description: "AI-powered universal dubbing tool that converts audio/video content from any language to any other language while preserving voice character and synchronization.",
  keywords: [
    "AI dubbing",
    "video translation",
    "voice cloning",
    "multilingual content",
    "automatic translation",
    "video localization",
  ],
  authors: [{ name: "PolyDub Team" }],
  creator: "PolyDub",
  publisher: "PolyDub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://polydub.com'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "PolyDub - AI-Powered Universal Dubbing",
    description: "Convert audio/video content from any language to any other language with AI-powered dubbing.",
    siteName: "PolyDub",
  },
  twitter: {
    card: "summary_large_image",
    title: "PolyDub - AI-Powered Universal Dubbing",
    description: "Convert audio/video content from any language to any other language with AI-powered dubbing.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <div className="min-h-screen bg-background text-foreground">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'hsl(var(--primary-foreground))',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'hsl(var(--destructive-foreground))',
                },
              },
            }}
          />
        </div>
      </body>
    </html>
  );
}
