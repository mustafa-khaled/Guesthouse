'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

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
      <body>
        <div className="flex flex-col items-center justify-center py-32">
          <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>
          <button
            onClick={reset}
            className="mt-4 rounded-full bg-green-600 px-6 py-3 text-white hover:bg-green-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
