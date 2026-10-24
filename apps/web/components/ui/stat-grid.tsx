import { cn } from '@/lib/utils';

export interface StatItem {
  label: string;
  value: string | number;
}

export interface StatGridProps {
  items: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const widthClasses = {
  2: 'w-1/2',
  3: 'w-1/2 sm:w-1/3',
  4: 'w-1/2 sm:w-1/3 lg:w-1/4',
} as const;

/**
 * Turns an API key into a readable label: `inProgress` → `In progress`.
 */
export function formatStatLabel(key: string) {
  const spaced = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .trim()
    .toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Hairline metric grid shared by the staff and admin dashboards.
 *
 * Callers pass an explicit list rather than a raw payload: dashboard responses
 * are nested (`{ today: { arrivals } }`), so mapping keys to metrics is a
 * decision the screen has to make — and it keeps currency and percentage
 * formatting next to the number it belongs to.
 *
 * Rules live on the cells with a single left rule on the wrapper, so a partly
 * filled last row ends cleanly instead of trailing a border into empty space.
 */
export function StatGrid({ items, columns = 4, className }: StatGridProps) {
  if (items.length === 0) return null;

  return (
    <dl className={cn('border-line flex flex-wrap border-l', className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className={cn('border-line border-b border-r border-t px-5 py-5', widthClasses[columns])}
        >
          <dt className="text-muted text-xs tracking-wide">{item.label}</dt>
          <dd className="text-ink tabular mt-1.5 font-serif text-2xl leading-none">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
