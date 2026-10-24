'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import Spinner from '@/components/Spinner';

const ERROR_MESSAGES: Record<string, string> = {
  oauth_init_failed: 'Could not start Google sign-in. Please try again.',
  invalid_state: 'Sign-in session expired. Please try again.',
  code_missing: 'Authorization code was not received.',
  invalid_code: 'Invalid authorization code.',
  invalid_google_profile: 'Could not retrieve your Google profile.',
  oauth_failed: 'Google sign-in failed. Please try again.',
  access_denied: 'You denied access to your Google account.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const rawMessage = searchParams.get('message') ?? 'unknown_error';
  const message = ERROR_MESSAGES[rawMessage] ?? decodeURIComponent(rawMessage).replace(/_/g, ' ');

  return (
    <Container className="max-w-xl py-12 md:py-16">
      <PageHeader
        folio="—"
        title="Sign-in error"
        description="Something interrupted the handshake between your account and ours."
      />

      <Alert variant="error" className="mt-8" title="We could not sign you in">
        {message}
      </Alert>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/login">Try again</Button>
        <Button href="/" variant="secondary">
          Back to home
        </Button>
      </div>
    </Container>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
