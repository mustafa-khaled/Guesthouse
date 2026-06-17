import type { Review } from '@/types'
import StarRating from '@/components/StarRating'
import { getRefLabel } from '@/lib/utils'

export default function ReviewCard({ review }: { review: Review }) {
  const author = getRefLabel(review.userId as string | Record<string, unknown>)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          {review.createdAt && (
            <p className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <StarRating rating={review.rating} />
      </div>
      {review.title && (
        <h4 className="mb-1 font-medium text-gray-800">{review.title}</h4>
      )}
      {review.comment && (
        <p className="text-sm text-gray-600">{review.comment}</p>
      )}
    </div>
  )
}
