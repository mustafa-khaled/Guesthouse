'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserRound } from 'lucide-react';
import { guestQueries } from '@/queries/bookings.queries';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import Spinner from '@/components/Spinner';
import { formatCurrency, formatDate, getId } from '@/lib/utils';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-muted text-sm">{label}</dt>
      <dd className="text-ink text-right text-sm">{value}</dd>
    </div>
  );
}

export default function StaffGuestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: guest, isLoading, isError, error } = useQuery(guestQueries.detail(id));

  if (isLoading) return <Spinner />;

  if (isError || !guest) {
    return (
      <Container className="max-w-none px-0 sm:px-0 lg:px-0">
        <EmptyState
          icon={<UserRound />}
          title="Guest not found"
          description={
            error instanceof Error ? error.message : 'This guest profile may have been removed.'
          }
          action={<Button href="/staff/guests">Back to guests</Button>}
        />
      </Container>
    );
  }

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title={`${guest.firstName} ${guest.lastName}`}
        description={guest.email}
        backHref="/staff/guests"
        backLabel="Guests"
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-12">
        <section className="border-line border-t pt-6" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="font-serif text-xl leading-snug">
            Contact
          </h2>
          <dl className="border-line divide-line mt-4 divide-y border-y">
            <DetailRow label="Email" value={guest.email} />
            <DetailRow label="Phone" value={guest.phone || '—'} />
            <DetailRow label="Nationality" value={guest.nationality || '—'} />
            <DetailRow
              label="Date of birth"
              value={guest.dateOfBirth ? formatDate(guest.dateOfBirth) : '—'}
            />
          </dl>
        </section>

        <section className="border-line border-t pt-6" aria-labelledby="history-heading">
          <h2 id="history-heading" className="font-serif text-xl leading-snug">
            Stay history
          </h2>
          <dl className="border-line divide-line mt-4 divide-y border-y">
            <DetailRow label="Total stays" value={guest.stats?.totalStays ?? '—'} />
            <DetailRow
              label="Total spent"
              value={
                guest.stats?.totalSpent != null ? (
                  <span className="tabular font-serif text-lg leading-none">
                    {formatCurrency(guest.stats.totalSpent)}
                  </span>
                ) : (
                  '—'
                )
              }
            />
            {guest.userId && (
              <DetailRow
                label="User account"
                value={
                  <span className="break-all font-mono text-xs">
                    {getId(guest.userId as never) || String(guest.userId)}
                  </span>
                }
              />
            )}
          </dl>
        </section>
      </div>
    </Container>
  );
}
