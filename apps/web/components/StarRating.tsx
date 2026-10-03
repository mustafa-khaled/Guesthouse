interface StarRatingProps {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxStars = 5,
  interactive = false,
  onChange,
}: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.round(rating);
        if (interactive && onChange) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(starValue)}
              className={`text-lg ${filled ? 'text-green-500' : 'text-gray-300'} hover:text-green-400`}
              aria-label={`Rate ${starValue} stars`}
            >
              ★
            </button>
          );
        }
        return (
          <span key={i} className={`text-sm ${filled ? 'text-green-500' : 'text-gray-300'}`}>
            ★
          </span>
        );
      })}
    </div>
  );
}
