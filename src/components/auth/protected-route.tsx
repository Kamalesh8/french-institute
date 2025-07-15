"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState('');

  // Derived auth status available throughout component
  const isAuthenticated = !!user || status === 'authenticated';

  useEffect(() => {
    // Only run this effect when loading state changes
    if (!loading && status !== 'loading') {
      
      if (!isAuthenticated && status === 'unauthenticated') {
        // Store the current path for redirecting back after login
        const redirect = pathname && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : '';
        setRedirectPath(redirect);

        // Use replace instead of push to prevent adding to history
        router.replace(`/auth/login${redirect}`);
      } else {
        setIsLoading(false);
      }
    }
  }, [user, loading, status, router, pathname]);

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your session...</p>
        </div>
      </div>
    );
  }

  // If there's no user but we're not loading, we're already redirecting
  if (!isAuthenticated) {
    return null;
  }

  // Prevent admins from accessing student dashboard
  if (isAuthenticated && (user?.role === 'admin' || (session?.user as any)?.role === 'admin')) {
    if (pathname?.startsWith('/dashboard')) {
      router.replace('/admin');
      return null;
    }
  }

  // If we have a user, render the children
  return <>{children}</>;
}
