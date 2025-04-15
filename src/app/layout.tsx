import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { RealtimeProvider } from "@/context/realtime-context";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "French Institute - Learn French Online",
  description: "Learn French from A1 to C2 level with our online French courses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <AuthProvider>
          <RealtimeProvider>
            {children}
            <Toaster />
          </RealtimeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
