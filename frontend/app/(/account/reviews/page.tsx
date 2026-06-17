'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { reviewQueries } from '@/queries/bookings.queries'
import StarRating from '@/components/StarRating'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Spinner from '@/components/Spinner'
import { formatDate, getId } from '@/lib/utils'
import type { Property } from '@/types'

function getPropertyName(propertyId: unknown): string {
  if (typeof propertyId === 'string') return 'Property'
  if (propertyId && typeof propertyId === 'object' && 'name' in propertyId) {
    return String((propertyId as Property).name)
  }
  return 'Property'
}

export default function MyReviewsPage() {
  const { data: reviews, isLoading, isError } = useQuery(reviewQueries.mine())

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/account"
        className="mb-6 inline-block text-sm text-green-700 hover:underline"
      >
        ← Back to account
      </Link>

      <h1 className="mb-6 text-2xl font-bold">My reviews</h1>

      {isError && (
        <p className="text-red-600">Failed to load reviews. Please try again.</p>
      )}

      {reviews && reviews.length === 0 && (
        <p className="text-gray-500">
          You haven&apos;t written any reviews yet.
        </p>
      )}

      <div className="space-y-4">
        {reviews?.map((review) => {
          const text =
            (review as { comment?: string; text?: string; review?: string })
              .comment ||
            (review as { text?: string }).text ||
            (review as { review?: string }).review ||
            ''
          return (
            <Card key={getId(review)}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-base">
                    {getPropertyName(review.propertyId)}
                  </CardTitle>
                  {review.title && (
                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {review.title}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StarRating rating={review.rating} />
                  {review.status && (
                    <Badge variant="default">{review.status}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {text && <p className="text-gray-600">{text}</p>}
                {review.createdAt && (
                  <p className="mt-2 text-xs text-gray-400">
                    {formatDate(review.createdAt)}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
