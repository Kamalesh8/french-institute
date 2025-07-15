"use client";
import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

interface Props {
  children: ReactNode;
}

export default function ResourcesLayout({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(pathname ?? '/resources')}`);
    }
  }, [loading, user, router, pathname]);

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
