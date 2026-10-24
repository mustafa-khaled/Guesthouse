'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { navLinks, site } from '@/lib/content';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

function BrandMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 32"
      className="text-brand h-7 w-7 shrink-0"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1.25"
        y="1.25"
        width="29.5"
        height="29.5"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M16 6.5c-4.6 0-7.4 3.3-7.4 7.8V25.5h14.8V14.3c0-4.5-2.8-7.8-7.4-7.8Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path d="M16 24.5v-9.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M16 17.8c2.4 0 4-1.5 4-3.9-2.4 0-4 1.4-4 3.9Z" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { user, logout, isLoading } = useAuth();
  const isAuthenticated = !!user;
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
        setOpen(false);
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
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'border-line bg-surface/92 sticky top-0 z-50 border-b backdrop-blur-md transition-shadow duration-200',
          scrolled && 'shadow-[0_1px_0_rgb(34_46_37_/_0.06)]',
        )}
      >
        <Container
          as="nav"
          aria-label="Main"
          className="flex h-16 items-center justify-between gap-6 md:h-20"
        >
          <Link
            href="/"
            className="focus-ring text-ink hover:text-brand flex items-center gap-3 transition-colors"
          >
            <BrandMark />
            <span className="font-serif text-xl leading-none tracking-tight md:text-2xl">
              {site.name}
            </span>
          </Link>

          <ul className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="focus-ring text-muted hover:text-brand text-sm transition-colors duration-200"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-5 md:flex">
            {!isLoading &&
              (isAuthenticated ? (
                <>
                  <Link
                    href="/account"
                    className="focus-ring text-muted hover:text-brand max-w-32 truncate text-sm transition-colors"
                  >
                    {user?.name || 'Account'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="focus-ring text-muted hover:text-brand text-sm transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="focus-ring text-muted hover:text-brand text-sm transition-colors"
                >
                  Sign in
                </Link>
              ))}
            <Button href="/search" size="sm" className="px-5">
              Check availability
            </Button>
          </div>

          <button
            type="button"
            className="focus-ring border-line text-ink hover:border-brand hover:text-brand inline-flex h-12 w-12 items-center justify-center rounded-[4px] border transition-colors md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(true)}
          >
            <Menu aria-hidden className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </Container>
      </header>

      {open && (
        <div
          id="mobile-nav"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="bg-surface animate-sheet-in fixed inset-0 z-[70] flex flex-col md:hidden"
        >
          <div className="border-line flex h-16 items-center justify-between border-b px-5">
            <Link
              href="/"
              className="text-ink flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              <BrandMark />
              <span className="font-serif text-xl leading-none">{site.name}</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="focus-ring border-line text-ink hover:border-brand hover:text-brand inline-flex h-12 w-12 items-center justify-center rounded-[4px] border"
              aria-label="Close menu"
            >
              <X aria-hidden className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-6">
            <ul>
              {navLinks.map((link, index) => (
                <li key={link.href} className="border-line border-b">
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="focus-ring text-ink hover:text-brand flex min-h-16 items-center justify-between gap-4 py-4 font-serif text-3xl transition-colors"
                  >
                    {link.label}
                    <span aria-hidden className="text-brand/30 tabular font-serif text-sm">
                      0{index + 1}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-10 space-y-3">
              <Button href="/search" className="w-full" onClick={() => setOpen(false)}>
                Check availability
              </Button>
              {!isLoading &&
                (isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <Button
                      href="/account"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setOpen(false)}
                    >
                      {user?.name || 'Your account'}
                    </Button>
                    <Button variant="ghost" onClick={() => logout()} className="flex-1">
                      Log out
                    </Button>
                  </div>
                ) : (
                  <Button
                    href="/login"
                    variant="secondary"
                    className="w-full"
                    onClick={() => setOpen(false)}
                  >
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
      )}
    </>
  );
}
