'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { clientFetch } from '@/lib/api/client';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthShell } from '@/components/shared/auth-shell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await clientFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSent(true);
      toast.success('Reset link sent if the email exists');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not send the reset email.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthShell
        title="Check your email"
        description="If the address is with us, a reset link is already on its way."
        footer={
          <Link href="/login" className="text-brand text-sm underline-offset-4 hover:underline">
            Back to login
          </Link>
        }
      >
        <Alert variant="success" title="Request received">
          If an account exists for {email}, a password reset link has been sent.
        </Alert>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      description="Enter the email you use for Serene Stays and we will send a quiet way back in."
      footer={
        <Link href="/login" className="text-brand text-sm underline-offset-4 hover:underline">
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </AuthShell>
  );
}
