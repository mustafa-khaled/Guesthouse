'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clientFetch } from '@/lib/api/client';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import Spinner from '@/components/Spinner';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function completeAuth() {
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.slice(1)
        : window.location.hash;
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');

      try {
        if (accessToken) {
          await clientFetch('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ accessToken }),
          });
        } else {
          await clientFetch('/auth/refresh', { method: 'POST' });
        }

        await refreshUser();
        router.replace('/account');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    }

    completeAuth();
  }, [router, refreshUser]);

  return (
    <Container className="flex min-h-[60vh] max-w-md flex-col items-start justify-center py-20">
      {error ? (
        <>
          <h1 className="text-title">We could not finish signing you in</h1>
          <Alert variant="error" className="mt-5 w-full">
            {error}
          </Alert>
          <Button href="/login" className="mt-6">
            Back to login
          </Button>
        </>
      ) : (
        <>
          <Spinner className="!p-0" />
          <p className="text-muted mt-4 text-sm" role="status">
            Completing sign in…
          </p>
        </>
      )}
    </Container>
  );
}
