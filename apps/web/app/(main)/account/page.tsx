import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  MessageSquareQuote,
  Settings,
  UserRound,
} from 'lucide-react';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { AccountNav } from '@/components/shared/account-nav';

export const metadata: Metadata = {
  title: 'Your account',
};

const accountLinks = [
  {
    href: '/account/bookings',
    title: 'My bookings',
    description: 'Upcoming stays, past visits, and any changes to your reservations.',
    icon: CalendarDays,
  },
  {
    href: '/account/profile',
    title: 'Guest profile',
    description: 'Contact details and travel preferences we keep on file.',
    icon: UserRound,
  },
  {
    href: '/account/reviews',
    title: 'My reviews',
    description: 'What you have written about the stays you have had with us.',
    icon: MessageSquareQuote,
  },
  {
    href: '/account/billing',
    title: 'Payment methods',
    description: 'Saved cards for a faster, quieter checkout next time.',
    icon: CreditCard,
  },
  {
    href: '/account/settings',
    title: 'Account settings',
    description: 'Your login email, password, and account preferences.',
    icon: Settings,
  },
];

export default function AccountPage() {
  return (
    <Container className="py-12 md:py-16">
      <PageHeader
        folio="—"
        title="Your account"
        description="Everything we hold for you — the stays ahead, the details that make arrival easier, and the notes you have left behind."
      />

      <div className="mt-6">
        <AccountNav />
      </div>

      <div className="mt-10 grid gap-px sm:grid-cols-2">
        {accountLinks.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring border-line hover:bg-raised group flex items-start gap-4 border-b px-1 py-6 transition-colors duration-200 sm:px-6 sm:odd:border-r"
            >
              <span className="text-brand mt-0.5 shrink-0" aria-hidden>
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-3">
                  <span className="text-ink font-serif text-xl leading-snug">{link.title}</span>
                  <ArrowUpRight
                    aria-hidden
                    className="text-brand/50 group-hover:text-brand mt-1 h-4 w-4 shrink-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                  />
                </span>
                <span className="text-muted mt-1.5 block text-sm leading-relaxed">
                  {link.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
