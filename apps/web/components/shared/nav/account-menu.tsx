'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LogOut } from 'lucide-react';
import { accountNav, filterNavForRole, isNavItemActive, workspaceNav } from '@/lib/navigation';
import { initials } from '@/lib/identity';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

/**
 * Signed-in identity chip. A disclosure, not a menu widget: the panel is plain
 * navigation, so Tab order matches reading order and Escape returns focus to
 * the chip.
 */
export function AccountMenu() {
  const { user, logout, hasRole } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutside = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('touchstart', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    const raf = requestAnimationFrame(() =>
      panelRef.current?.querySelector<HTMLElement>('a, button')?.focus(),
    );

    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('touchstart', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
      cancelAnimationFrame(raf);
    };
  }, [open]);

  const workspaceItems = filterNavForRole(workspaceNav, hasRole);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="account-panel"
        aria-label={`Account menu for ${user?.name ?? 'your account'}`}
        onClick={() => setOpen((value) => !value)}
        className="focus-ring border-line bg-raised hover:border-brand inline-flex h-10 items-center gap-2 rounded-[4px] border pl-1 pr-2.5 transition-colors"
      >
        <span
          aria-hidden
          className="bg-brand-soft text-brand grid h-8 w-8 place-items-center rounded-[3px] font-serif text-xs"
        >
          {initials(user?.name)}
        </span>
        <span className="text-ink max-w-28 truncate text-sm">{user?.name || 'Account'}</span>
        <ChevronDown
          aria-hidden
          className={cn(
            'text-muted h-3.5 w-3.5 transition-transform duration-200',
            open && 'rotate-180',
          )}
          strokeWidth={1.5}
        />
      </button>

      {open && (
        <div
          id="account-panel"
          ref={panelRef}
          className="border-line bg-raised absolute right-0 top-full z-50 mt-2 w-64 rounded-[4px] border p-2 shadow-[var(--shadow-lift)]"
        >
          <p className="text-muted px-3 pb-1 pt-2 text-[10px] uppercase tracking-[0.16em]">
            Your stay
          </p>
          <ul>
            {accountNav.map((item) => {
              const isActive = isNavItemActive(pathname, item);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'focus-ring flex min-h-9 items-center justify-between rounded-[3px] px-3 text-sm transition-colors',
                      isActive
                        ? 'bg-brand-soft/60 text-ink font-medium'
                        : 'text-muted hover:bg-surface hover:text-ink',
                    )}
                  >
                    {item.label}
                    {isActive && <span aria-hidden className="bg-brand h-1 w-1 rounded-full" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          {workspaceItems.length > 0 && (
            <>
              <div className="border-line my-2 border-t" />
              <p className="text-muted px-3 pb-1 pt-2 text-[10px] uppercase tracking-[0.16em]">
                Workspace
              </p>
              <ul>
                {workspaceItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="focus-ring text-muted hover:bg-surface hover:text-ink flex min-h-9 items-center rounded-[3px] px-3 text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="border-line my-2 border-t" />
          <button
            type="button"
            onClick={() => logout()}
            className="focus-ring text-muted hover:bg-surface hover:text-ink flex min-h-9 w-full items-center gap-2 rounded-[3px] px-3 text-sm transition-colors"
          >
            <LogOut aria-hidden className="h-3.5 w-3.5" strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
