import StarRating from './StarRating'
import type { Review } from '@/types'

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const user = review.user as { _id: string; name: string; photo: string }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={user.photo}
          alt={user.name}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h6 className="font-semibold">{user.name}</h6>
          <StarRating rating={review.rating} />
        </div>
      </div>
      <p className="text-gray-600">{review.review}</p>
    </div>
  )
}
