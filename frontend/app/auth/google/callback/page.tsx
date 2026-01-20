'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import api from '@/lib/api';
import { useUser } from '@/contexts/UserContext';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState('');
  const { refreshUser } = useUser();

  useEffect(() => {
    const syncWithBackend = async () => {
      if (status === 'loading') {
        // Still loading session
        return;
      }

      if (!session || status !== 'authenticated') {
        // No session or not authenticated
        setError('Authentication failed');
        setTimeout(() => router.push('/login?error=google_auth_failed'), 2000);
        return;
      }

      try {
        // Send Google user info to our backend      
        const response = await api.post('/auth/oauth-login', {
          email: session.user?.email,
          google_id: session.user?.googleId,
          display_name: session.user?.name,
          profile_picture: session.user?.image,
        });

        // Store OUR backend's JWT token
        localStorage.setItem('token', response.data.access_token);

        // Refresh UserContext to load the user data
        await refreshUser();

        // Success! Redirect to dashboard
        router.push('/dashboard');
      } catch (err: any) {
        setError('Failed to complete login');
        setTimeout(() => router.push('/login?error=backend_sync_failed'), 2000);
      }
    };

    syncWithBackend();
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-600 text-xl mb-4">❌ {error}</div>
            <p className="text-gray-600">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Completing Google Sign-In...
            </h2>
            <p className="text-gray-600">Please wait</p>
          </>
        )}
      </div>
    </div>
  );
}
