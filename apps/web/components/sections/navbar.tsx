'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { navLinks, site } from '@/lib/content';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const isAuthenticated = !!user;

  return (
    <header className="border-matcha-border bg-matcha-surface/95 sticky top-0 z-50 border-b backdrop-blur-sm">
      <Container
        as="nav"
        aria-label="Main"
        className="flex h-16 items-center justify-between md:h-20"
      >
        <Link
          href="/"
          className="text-matcha-heading font-serif text-xl font-medium tracking-tight md:text-2xl"
        >
          {site.name}
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-matcha-body hover:text-matcha-brand text-sm transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 md:flex">
          {!isLoading && isAuthenticated ? (
            <>
              <Link href="/account" className="text-matcha-body hover:text-matcha-brand text-sm">
                {user?.name || 'Account'}
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="text-matcha-body hover:text-matcha-brand text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            !isLoading && (
              <Link href="/login" className="text-matcha-body hover:text-matcha-brand text-sm">
                Sign in
              </Link>
            )
          )}
          <Button href="/search">Book your stay</Button>
        </div>

        <button
          type="button"
          className="border-matcha-border bg-matcha-white inline-flex min-h-12 min-w-12 items-center justify-center rounded-[4px] border md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="flex flex-col gap-1.5">
            <span
              className={cn(
                'bg-matcha-brand block h-0.5 w-5 transition-transform',
                open && 'translate-y-2 rotate-45',
              )}
            />
            <span
              className={cn(
                'bg-matcha-brand block h-0.5 w-5 transition-opacity',
                open && 'opacity-0',
              )}
            />
            <span
              className={cn(
                'bg-matcha-brand block h-0.5 w-5 transition-transform',
                open && '-translate-y-2 -rotate-45',
              )}
            />
          </span>
        </button>
      </Container>

      {open && (
        <div id="mobile-nav" className="border-matcha-border bg-matcha-surface border-t md:hidden">
          <Container className="flex flex-col gap-2 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-matcha-body hover:bg-matcha-brand-medium/20 min-h-12 rounded-[4px] px-3 py-3 text-sm"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button href="#book" className="mt-2 w-full">
              Book your stay
            </Button>
          </Container>
        </div>
      )}
    </header>
  );
}
