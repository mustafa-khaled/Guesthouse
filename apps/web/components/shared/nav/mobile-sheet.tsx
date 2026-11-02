'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { BrandMark } from '@/components/shared/nav/brand-mark';
import { Button } from '@/components/ui/button';
import {
  accountNav,
  filterNavForRole,
  guestNav,
  isNavItemActive,
  workspaceNav,
} from '@/lib/navigation';
import { site } from '@/lib/content';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export interface MobileSheetProps {
  open: boolean;
  onClose: () => void;
}

function SheetSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="border-line mt-8 border-t pt-6">
      {title && <p className="text-muted mb-2 text-[10px] uppercase tracking-[0.18em]">{title}</p>}
      {children}
    </div>
  );
}

export function MobileSheet({ open, onClose }: MobileSheetProps) {
  const pathname = usePathname();
  const { user, logout, isLoading, hasRole } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusables();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const raf = requestAnimationFrame(() => focusables()[0]?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      cancelAnimationFrame(raf);
    };
  }, [open, onClose]);

  if (!open) return null;

  const workspaceItems = filterNavForRole(workspaceNav, hasRole);

  return (
    <div
      id="mobile-nav"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      className="bg-surface animate-sheet-in fixed inset-0 z-[70] flex flex-col lg:hidden"
    >
      <div className="border-line flex h-16 items-center justify-between border-b px-5">
        <Link href="/" className="text-ink flex items-center gap-3" onClick={onClose}>
          <BrandMark />
          <span className="font-serif text-xl leading-none">{site.name}</span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="focus-ring border-line text-ink hover:border-brand hover:text-brand inline-flex h-12 w-12 items-center justify-center rounded-[4px] border"
          aria-label="Close menu"
        >
          <X aria-hidden className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">
        <ul>
          {guestNav.map((item) => {
            const isActive = isNavItemActive(pathname, item);

            return (
              <li key={item.href} className="border-line border-b">
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'focus-ring flex min-h-16 items-center justify-between gap-4 py-4 font-serif text-3xl transition-colors',
                    isActive ? 'text-brand' : 'text-ink hover:text-brand',
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      'tabular font-serif text-sm',
                      isActive ? 'text-brand' : 'text-brand/30',
                    )}
                  >
                    {item.folio}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {!isLoading && user && (
          <SheetSection title="Your stay">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
              {accountNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={isNavItemActive(pathname, item) ? 'page' : undefined}
                    className="focus-ring text-muted hover:text-ink flex min-h-11 items-center text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </SheetSection>
        )}

        {!isLoading && workspaceItems.length > 0 && (
          <SheetSection title="Workspace">
            <ul className="space-y-1">
              {workspaceItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="focus-ring text-muted hover:text-ink flex min-h-11 items-center text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </SheetSection>
        )}

        <div className="mt-8 space-y-3">
          <Button href="/search" className="w-full" onClick={onClose}>
            Check availability
          </Button>
          {!isLoading &&
            (user ? (
              <Button variant="ghost" onClick={() => logout()} className="w-full">
                Sign out
              </Button>
            ) : (
              <Button href="/login" variant="secondary" className="w-full" onClick={onClose}>
                Sign in
              </Button>
            ))}
        </div>
      </nav>

      <div className="border-line text-muted border-t px-5 py-6 text-sm">
        <p>{site.phone}</p>
        <p>{site.email}</p>
        <p className="mt-3 text-xs">{site.location}</p>
      </div>
    </div>
  );
}
