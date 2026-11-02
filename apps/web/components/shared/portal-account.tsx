'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { initials, roleLabel } from '@/lib/identity';

/**
 * Portal identity block. Staff and managers work from these shells for a whole
 * shift, so the account and the way out of it live in the rail rather than
 * behind a trip back to the marketing site.
 */
export function PortalAccount() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  // Hold the space while the session resolves so the rail does not jump.
  if (isLoading) return <div aria-hidden className="border-line min-h-[96px] border-t" />;
  if (!user) return null;

  async function handleSignOut() {
    setPending(true);
    try {
      await logout();
    } finally {
      router.replace('/login');
    }
  }

  return (
    <div className="border-line border-t px-4 py-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="bg-brand-soft text-brand grid h-9 w-9 shrink-0 place-items-center rounded-[3px] font-serif text-xs"
        >
          {initials(user.name)}
        </span>
        <div className="min-w-0">
          <p className="text-ink truncate text-sm leading-tight">{user.name || 'Your account'}</p>
          <p className="text-muted mt-0.5 truncate text-xs">{user.email}</p>
        </div>
      </div>

      <p className="text-brand mt-3 text-[10px] uppercase tracking-[0.16em]">
        {roleLabel(user.role)}
      </p>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={pending}
        className="focus-ring text-muted hover:bg-surface hover:text-ink mt-1 flex min-h-11 w-full items-center gap-2 rounded-[3px] px-2 text-sm transition-colors disabled:opacity-60"
      >
        <LogOut aria-hidden className="h-3.5 w-3.5" strokeWidth={1.5} />
        {pending ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  );
}
