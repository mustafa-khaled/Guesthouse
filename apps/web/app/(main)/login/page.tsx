'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/alert';
import { Button, buttonClass } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthShell } from '@/components/shared/auth-shell';
import Spinner from '@/components/Spinner';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectTo = searchParams.get('redirect') || '/account';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    try {
      await login(String(fd.get('email')), String(fd.get('password')));
      toast.success('Welcome back');
      router.push(redirectTo.startsWith('/') ? redirectTo : '/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not sign you in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Log in to your account"
      description="Return to your stays, saved cards, and the quieter parts of the day."
      footer={
        <div className="text-muted space-y-2 text-sm">
          <p>
            New here?{' '}
            <Link href="/signup" className="text-brand underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
          <p>
            <Link href="/forgot-password" className="text-brand underline-offset-4 hover:underline">
              Forgot your password?
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

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
            autoComplete="current-password"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Log in'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="border-line flex-1 border-t" />
        <span className="text-muted text-xs uppercase tracking-[0.12em]">or</span>
        <span className="border-line flex-1 border-t" />
      </div>

      <a
        href="/api/auth/google"
        className={buttonClass({ variant: 'secondary', className: 'w-full' })}
      >
        Continue with Google
      </a>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
