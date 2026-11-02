import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { packages } from '@/lib/content';

export interface PackageTiersProps {
  className?: string;
}

/**
 * Compact tier cards. The full inclusion matrix lives on `/packages`, so the
 * homepage can summarise without duplicating the comparison table.
 */
export function PackageTiers({ className }: PackageTiersProps) {
  return (
    <div className={cn('grid gap-6 md:grid-cols-3', className)}>
      {packages.map((pkg) => (
        <article
          key={pkg.name}
          className={cn(
            'border-line flex flex-col rounded-[4px] border p-6',
            pkg.highlighted && 'bg-brand-soft/55',
          )}
        >
          {pkg.highlighted && (
            <span className="bg-brand text-surface-raised mb-4 inline-flex self-start rounded-[3px] px-2 py-0.5 text-[11px] font-medium">
              Recommended
            </span>
          )}
          <h3 className="font-serif text-2xl leading-none">{pkg.name}</h3>
          <p className="text-muted mt-2 text-sm">{pkg.duration}</p>
          <p className="mt-5 font-serif text-3xl leading-none">{pkg.price}</p>
          <p className="text-muted mt-1.5 text-xs">total</p>
          <p className="text-muted mt-5 flex-1 text-sm leading-relaxed">{pkg.description}</p>
          <Button
            href="/search"
            variant={pkg.highlighted ? 'primary' : 'secondary'}
            size="sm"
            className="mt-6 w-full"
          >
            Reserve {pkg.name}
          </Button>
        </article>
      ))}
    </div>
  );
}
