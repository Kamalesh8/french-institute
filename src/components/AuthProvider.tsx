"use client";

import { SessionProvider } from 'next-auth/react';
import { AuthProvider as AuthContextProvider } from '@/context/auth-context';

export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <SessionProvider session={session}>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </SessionProvider>
  );
}
