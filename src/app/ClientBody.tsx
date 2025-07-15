"use client";

import { useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";

export default function ClientBody({ children }: { children: React.ReactNode }) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}

