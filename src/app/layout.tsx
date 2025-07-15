import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from '@/components/AuthProvider';
import { RealtimeProvider } from "@/context/realtime-context";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { CourseProgressProvider } from "@/context/courseProgressContext";
import { ThemeProvider } from "@/context/themeContext";

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Optimize font loading with display swap
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "L'école Bibliothèque - Learn French Online",
  description: "Learn French from A1 to C2 level with our online French courses.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  keywords: ['French', 'Language Learning', 'Online Courses', 'L\u0027école Bibliothèque'],
  authors: [{ name: 'L\u0027école Bibliothèque' }],
  creator: 'L\u0027école Bibliothèque',
  publisher: 'L\u0027école Bibliothèque',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

// Add preconnect for external domains
const ExternalLinks = () => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
    <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
  </>
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="en">
      <head>
        <ExternalLinks />
        <link rel="icon" href="/images/EB_LOGO_.jpg" />
      </head>
      <body className={cn("min-h-screen bg-background antialiased font-sans", inter.className)}>
        <AuthProvider session={session}>
          <ThemeProvider>
            <RealtimeProvider>
              <CourseProgressProvider>
                {children}
                <Toaster />

              </CourseProgressProvider>
            </RealtimeProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
