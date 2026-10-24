'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { site } from '@/lib/content';

export interface PortalNavItem {
  href: string;
  label: string;
}

export interface PortalShellProps {
  /** Small label above the wordmark, e.g. "Operations" */
  eyebrow: string;
  navLabel: string;
  items: PortalNavItem[];
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function Wordmark({ eyebrow }: { eyebrow: string }) {
  return (
    <Link href="/" className="focus-ring group block">
      <p className="text-muted text-[10px] uppercase tracking-[0.18em]">{eyebrow}</p>
      <p className="text-ink group-hover:text-brand mt-1 font-serif text-xl leading-none transition-colors">
        {site.name}
      </p>
    </Link>
  );
}

function NavList({
  items,
  navLabel,
  onNavigate,
}: {
  items: PortalNavItem[];
  navLabel: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label={navLabel} className="flex-1 px-3 py-4">
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' &&
              item.href !== '/staff/front-desk' &&
              pathname.startsWith(`${item.href}/`));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'focus-ring flex min-h-10 items-center rounded-[3px] border-l-2 px-3 text-sm transition-colors duration-150',
                  isActive
                    ? 'border-brand bg-brand-soft/60 text-ink font-medium'
                    : 'text-muted hover:border-line-strong hover:text-ink border-transparent',
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ShellFooter() {
  return (
    <div className="border-line border-t px-5 py-4">
      <Link
        href="/"
        className="focus-ring text-muted hover:text-brand inline-flex items-center gap-1.5 text-xs transition-colors"
      >
        Back to site
        <ArrowUpRight aria-hidden className="h-3 w-3" strokeWidth={1.5} />
      </Link>
    </div>
  );
}

export function PortalShell({ eyebrow, navLabel, items, children, footer }: PortalShellProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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
      const nodes = focusables();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
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
    <div className="bg-surface min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="border-line bg-raised hidden w-60 shrink-0 flex-col border-r lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="border-line border-b px-5 py-5">
          <Wordmark eyebrow={eyebrow} />
        </div>
        <NavList items={items} navLabel={navLabel} />
        {footer}
        <ShellFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="border-line bg-surface/95 sticky top-0 z-40 flex h-16 items-center justify-between border-b px-5 backdrop-blur-md lg:hidden">
          <Wordmark eyebrow={eyebrow} />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="focus-ring border-line text-ink hover:border-brand inline-flex h-11 w-11 items-center justify-center rounded-[4px] border transition-colors"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="portal-menu"
          >
            <Menu aria-hidden className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </header>

        <main id="main" className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>

      {open && (
        <div
          id="portal-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={navLabel}
          className="bg-surface animate-sheet-in fixed inset-0 z-[70] flex flex-col lg:hidden"
        >
          <div className="border-line flex h-16 items-center justify-between border-b px-5">
            <Wordmark eyebrow={eyebrow} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="focus-ring border-line text-ink hover:border-brand inline-flex h-11 w-11 items-center justify-center rounded-[4px] border"
              aria-label="Close menu"
            >
              <X aria-hidden className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
          <NavList items={items} navLabel={navLabel} onNavigate={() => setOpen(false)} />
          {footer}
          <ShellFooter />
        </div>
      )}
    </div>
  );
}
