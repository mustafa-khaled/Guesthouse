import { spaTreatments } from '@/lib/content';
import { cn } from '@/lib/utils';

export interface SpaMenuProps {
  /** Trim the list for the homepage summary; omit for the full menu. */
  limit?: number;
  className?: string;
}

const durationAndPrice = 'tabular shrink-0 text-xs';

export function SpaMenu({ limit, className }: SpaMenuProps) {
  const treatments = typeof limit === 'number' ? spaTreatments.slice(0, limit) : spaTreatments;

  return (
    <ul className={cn('border-line border-t', className)}>
      {treatments.map((treatment) => (
        <li key={treatment.name} className="border-line border-b py-6">
          <div className="flex items-baseline gap-4">
            <h3 className="font-serif text-xl leading-tight md:text-2xl">{treatment.name}</h3>
            <span aria-hidden className="border-line mb-1.5 flex-1 border-b border-dotted" />
            <span className={cn(durationAndPrice, 'text-muted')}>{treatment.duration}</span>
            <span className={cn(durationAndPrice, 'w-16 text-right font-serif text-xl')}>
              {treatment.price}
            </span>
          </div>
          <p className="text-muted mt-2 max-w-md text-sm leading-relaxed">
            {treatment.description}
          </p>
          <p className="text-brand mt-3 text-[11px] uppercase tracking-[0.16em]">
            {treatment.category}
          </p>
        </li>
      ))}
    </ul>
  );
}
