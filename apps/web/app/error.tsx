'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const message =
    process.env.NODE_ENV === 'production'
      ? 'Something interrupted us. Your booking data is safe — try again in a moment.'
      : error.message;

  return (
    <Container className="flex min-h-[60vh] max-w-2xl flex-col items-start justify-center py-20">
      <p aria-hidden className="text-brand/40 tabular font-serif text-6xl leading-none">
        !
      </p>
      <h1 className="text-title mt-4 text-balance">Something went wrong</h1>
      <p role="alert" className="text-muted mt-3 max-w-md text-pretty leading-relaxed">
        {message}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="secondary">
          Back to home
        </Button>
      </div>
    </Container>
  );
}
