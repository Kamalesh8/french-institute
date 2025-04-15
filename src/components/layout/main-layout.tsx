"use client";

import Header from "./header";
import Footer from "./footer";
import { useAuth } from "@/context/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FaTools } from "react-icons/fa";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isDemoMode } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {isDemoMode && (
        <Alert className="rounded-none border-primary/60 bg-primary/10 mb-0">
          <FaTools className="h-4 w-4 text-primary" />
          <AlertTitle>Development Mode</AlertTitle>
          <AlertDescription>
            Running with demo authentication. To use real functionality, create a Firebase project and update the environment variables.
          </AlertDescription>
        </Alert>
      )}

      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
