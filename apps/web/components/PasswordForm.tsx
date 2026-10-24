'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { clientFetch } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PasswordForm() {
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      await clientFetch('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ passwordCurrent, password }),
      });
      toast.success('Password updated successfully');
      setPasswordCurrent('');
      setPassword('');
      setPasswordConfirm('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="password-current">Current password</Label>
        <Input
          id="password-current"
          type="password"
          autoComplete="current-password"
          value={passwordCurrent}
          onChange={(e) => setPasswordCurrent(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password-confirm">Confirm new password</Label>
          <Input
            id="password-confirm"
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Updating…' : 'Save password'}
      </Button>
    </form>
  );
}
