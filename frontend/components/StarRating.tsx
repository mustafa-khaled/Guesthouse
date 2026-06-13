interface StarRatingProps {
  rating: number
  maxStars?: number
}

export default function StarRating({ rating, maxStars = 5 }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${
            i < Math.round(rating) ? 'text-green-500' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  )
}
