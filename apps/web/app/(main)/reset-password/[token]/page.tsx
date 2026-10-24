'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { clientFetch } from '@/lib/api/client';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthShell } from '@/components/shared/auth-shell';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = String(params.token);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError('Those passwords do not match yet.');
      return;
    }

    setIsSubmitting(true);

    try {
      await clientFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      toast.success('Password reset successfully');
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not reset your password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      description="Choose something you will remember, and keep the rest of the day quiet."
      footer={
        <Link href="/login" className="text-brand text-sm underline-offset-4 hover:underline">
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="passwordConfirm">Confirm new password</Label>
          <Input
            id="passwordConfirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            minLength={6}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Resetting…' : 'Reset password'}
        </Button>
      </form>
    </AuthShell>
  );
}
