'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-surface text-ink min-h-screen antialiased">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-start justify-center px-5 py-20">
          <p aria-hidden className="text-brand/40 font-serif text-6xl leading-none">
            !
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted mt-3 max-w-md leading-relaxed">
            The site could not finish loading. Reloading usually settles it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={reset}
              className="bg-brand text-surface-raised hover:bg-brand-deep focus-ring inline-flex min-h-12 items-center rounded-[4px] px-6 text-sm font-medium transition-colors duration-200"
            >
              Try again
            </button>
            <Link
              href="/"
              className="border-line text-ink hover:border-brand focus-ring inline-flex min-h-12 items-center rounded-[4px] border px-6 text-sm font-medium transition-colors duration-200"
            >
              Back to home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
