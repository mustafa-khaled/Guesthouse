'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { AccountMenu } from '@/components/shared/nav/account-menu';
import { BrandMark } from '@/components/shared/nav/brand-mark';
import { MobileSheet } from '@/components/shared/nav/mobile-sheet';
import { NavLink } from '@/components/shared/nav/nav-link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { site } from '@/lib/content';
import { guestNav } from '@/lib/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  const closeSheet = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
          className={cn(
            'flex h-16 items-center justify-between gap-6 transition-[height] duration-200',
            scrolled ? 'md:h-16' : 'md:h-20',
          )}
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
            {guestNav.map((item) => (
              <li key={item.href}>
                <NavLink item={item} />
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-5 md:flex">
            {!isLoading &&
              (user ? (
                <AccountMenu />
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
            className="focus-ring border-line text-ink hover:border-brand hover:text-brand inline-flex h-12 w-12 items-center justify-center rounded-[4px] border transition-colors lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(true)}
          >
            <Menu aria-hidden className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </Container>
      </header>

      <MobileSheet open={open} onClose={closeSheet} />
    </>
  );
}
