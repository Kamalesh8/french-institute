"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import MainLayout from "@/components/layout/main-layout";
import { Loader2 } from "lucide-react";

export default function AuthHandleCallback() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const signInToFirebaseIfNeeded = async () => {
      if (status !== "authenticated") return;

      try {
        const { getFirebaseAuth } = await import("@/config/firebase");
        const { signInWithCustomToken } = await import("firebase/auth");

        const auth = getFirebaseAuth();
        if (!auth.currentUser && (session as any).firebaseToken) {
          await signInWithCustomToken(auth, (session as any).firebaseToken);
        }
      } catch (err) {
        console.warn("Failed to sign in to Firebase with custom token:", err);
      }

      const role = (session.user as any).role || "user";
      const redirectParam = searchParams?.get("redirect") || "";

      let target: string;
      if (role === "admin") {
        target = redirectParam && redirectParam !== "/dashboard" ? redirectParam : "/admin";
      } else {
        target = redirectParam || "/dashboard";
      }
      router.replace(target);
    };

    signInToFirebaseIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </MainLayout>
  );
}
