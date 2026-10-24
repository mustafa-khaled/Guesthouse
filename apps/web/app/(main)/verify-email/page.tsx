'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { clientFetch } from '@/lib/api/client';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AuthShell } from '@/components/shared/auth-shell';
import Spinner from '@/components/Spinner';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }

    clientFetch<{ message?: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((data) => {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verification failed.');
      });
  }, [token]);

  return (
    <AuthShell
      title={
        status === 'loading'
          ? 'Verifying your email'
          : status === 'success'
            ? 'Email verified'
            : 'Verification failed'
      }
      description="A small check, then everything is ready."
      footer={
        <Link href="/" className="text-brand text-sm underline-offset-4 hover:underline">
          Back to home
        </Link>
      }
    >
      {status === 'loading' && <Spinner />}

      {status !== 'loading' && (
        <Alert variant={status === 'success' ? 'success' : 'error'}>{message}</Alert>
      )}

      {status === 'success' && (
        <Button href="/login" className="mt-5 w-full">
          Continue to login
        </Button>
      )}
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
