'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

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
      ? 'An unexpected error occurred. Please try again.'
      : error.message;

  return (
    <div className="flex flex-col items-center justify-center py-32">
      <h2 className="mb-4 text-4xl font-bold text-gray-800">Something went wrong!</h2>
      <p className="mb-2 text-gray-500">{message}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-green-600 px-6 py-3 text-white hover:bg-green-700"
      >
        Try again
      </button>
    </div>
  );
}
