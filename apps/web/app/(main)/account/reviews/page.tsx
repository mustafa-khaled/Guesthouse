'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageSquareQuote } from 'lucide-react';
import { reviewQueries } from '@/queries/bookings.queries';
import { AccountNav } from '@/components/shared/account-nav';
import StarRating from '@/components/StarRating';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getId } from '@/lib/utils';
import type { Property } from '@/types';

function getPropertyName(propertyId: unknown): string {
  if (typeof propertyId === 'string') return 'Property';
  if (propertyId && typeof propertyId === 'object' && 'name' in propertyId) {
    return String((propertyId as Property).name);
  }
  return 'Property';
}

export default function MyReviewsPage() {
  const { data: reviews, isLoading, isError } = useQuery(reviewQueries.mine());

  return (
    <Container className="py-12 md:py-16">
      <PageHeader
        folio="—"
        title="My reviews"
        description="The words you have left after a stay — kept here so you can revisit them."
        backHref="/account"
        backLabel="Account"
      />

      <div className="mt-6">
        <AccountNav />
      </div>

      <div className="mt-10">
        {isLoading && (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border-line border-b pb-6">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-3 h-3 w-64" />
                <Skeleton className="mt-2 h-3 w-full" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <Alert variant="error" title="We could not load your reviews">
            Please refresh the page and try again.
          </Alert>
        )}

        {reviews && reviews.length === 0 && (
          <EmptyState
            icon={<MessageSquareQuote />}
            title="No reviews yet"
            description="After you check out, we will invite you to tell us how the stay felt."
            action={
              <Button href="/account/bookings" variant="secondary">
                View my bookings
              </Button>
            }
          />
        )}

        {reviews && reviews.length > 0 && (
          <ul className="border-line border-t">
            {reviews.map((review) => {
              const text =
                (review as { comment?: string; text?: string; review?: string }).comment ||
                (review as { text?: string }).text ||
                (review as { review?: string }).review ||
                '';

              return (
                <li key={getId(review)} className="border-line border-b py-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-serif text-xl leading-snug">
                        {getPropertyName(review.propertyId)}
                      </h2>
                      {review.title && <p className="text-ink mt-1 text-sm">{review.title}</p>}
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <StarRating rating={review.rating} />
                      {review.status && (
                        <Badge variant={review.status === 'approved' ? 'success' : 'default'}>
                          {review.status}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {text && (
                    <p className="text-muted mt-3 max-w-2xl text-pretty text-sm leading-relaxed">
                      {text}
                    </p>
                  )}

                  {review.createdAt && (
                    <p className="text-muted/70 mt-3 text-xs">{formatDate(review.createdAt)}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Container>
  );
}
