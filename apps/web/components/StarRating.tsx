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
    <div className="flex items-center gap-0.5" aria-hidden={!interactive}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.round(rating);
        const tone = filled ? 'text-brand' : 'text-line-strong/50';

        if (interactive && onChange) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(starValue)}
              className={`focus-ring rounded-[2px] px-0.5 text-xl leading-none transition-colors duration-150 ${tone} hover:text-brand-deep`}
              aria-label={`Rate ${starValue} ${starValue === 1 ? 'star' : 'stars'}`}
              aria-pressed={filled}
            >
              ★
            </button>
          );
        }

        return (
          <span key={i} className={`text-sm leading-none ${tone}`}>
            ★
          </span>
        );
      })}
    </div>
  );
}
