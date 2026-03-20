
'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * AuthGuard ensures that only authenticated users can access the application's
 * protected routes. If no user is found, it redirects to the login page.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not loading and no user is present, redirect to login unless already there
    if (!isUserLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, isUserLoading, pathname, router]);

  // Loading state while checking authentication
  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-sm font-black text-primary animate-pulse uppercase tracking-widest leading-none">Gemma's</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Gulayan</p>
          </div>
        </div>
      </div>
    );
  }

  // Allow the login page to render freely for unauthenticated users
  if (!user && pathname === '/login') {
    return <>{children}</>;
  }

  // Only render children if a user is authenticated
  // (or if we are on the login page, handled above)
  return <>{user ? children : null}</>;
}
