'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthShell } from '@/components/shared/auth-shell';

export default function SignupPage() {
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    try {
      await signup(
        String(fd.get('name')),
        String(fd.get('email')),
        String(fd.get('password')),
        String(fd.get('passwordConfirm')),
      );
      setDone(true);
      toast.success('Check your email to verify your account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not create your account.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthShell
        title="Check your inbox"
        description="One small step, then the rest is quiet."
        footer={
          <Link href="/login" className="text-brand text-sm underline-offset-4 hover:underline">
            Go to login
          </Link>
        }
      >
        <Alert variant="success" title="Verify your email">
          We sent a verification link to your inbox. Open it before signing in.
        </Alert>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      description="Save your stays, keep your details close, and make the next arrival easier."
      footer={
        <p className="text-muted text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-brand underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
          />
          <p className="text-muted mt-1.5 text-xs">At least 6 characters.</p>
        </div>

        <div>
          <Label htmlFor="passwordConfirm">Confirm password</Label>
          <Input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  );
}
