'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import Loading from '@/components/ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if loading is done AND user is null
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Show loading while checking auth
  if (loading) {
    return <Loading fullPage message="Checking authentication..." />;
  }

  // No user after loading → will redirect (show loading meanwhile)
  if (!user) {
    return <Loading fullPage message="Redirecting to login..." />;
  }

  // User authenticated, render protected content
  return <>{children}</>;
}
