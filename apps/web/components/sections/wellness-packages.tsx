import { Button } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { packageComparison, packages } from '@/lib/content';
import { cn } from '@/lib/utils';

export function WellnessPackages() {
  return (
    <Section
      id="packages"
      folio="04"
      title="Curated retreats for every rhythm"
      description="Three tiers of renewal — from a gentle reset to a complete transformation. Compare what each one holds."
    >
      <div className="-mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <caption className="sr-only">Wellness package comparison</caption>

          <thead>
            <tr>
              <th scope="col" className="w-[26%] pb-6 pr-6 align-bottom">
                <span className="text-muted text-xs uppercase tracking-[0.16em]">Inclusions</span>
              </th>
              {packages.map((pkg) => (
                <th
                  key={pkg.name}
                  scope="col"
                  className={cn(
                    'border-line border-t px-5 py-6 align-bottom',
                    pkg.highlighted && 'bg-brand-soft/55',
                  )}
                >
                  {pkg.highlighted && (
                    <span className="bg-brand text-surface-raised mb-3 inline-flex rounded-[3px] px-2 py-0.5 text-[11px] font-medium">
                      Recommended
                    </span>
                  )}
                  <p className="font-serif text-2xl leading-none">{pkg.name}</p>
                  <p className="text-muted mt-2 text-sm">{pkg.duration}</p>
                  <p className="mt-5 font-serif text-3xl leading-none">{pkg.price}</p>
                  <p className="text-muted mt-1.5 text-xs">total</p>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {packageComparison.map((row) => (
              <tr key={row.label} className="border-line border-t">
                <th scope="row" className="text-ink py-4 pr-6 text-sm font-medium">
                  {row.label}
                </th>
                {row.values.map((value, index) => (
                  <td
                    key={`${row.label}-${packages[index].name}`}
                    className={cn(
                      'px-5 py-4 text-sm',
                      packages[index].highlighted && 'bg-brand-soft/40',
                      value === '—' && 'text-muted/50',
                    )}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="border-line border-t">
              <td />
              {packages.map((pkg) => (
                <td
                  key={pkg.name}
                  className={cn('px-5 py-6', pkg.highlighted && 'bg-brand-soft/40')}
                >
                  <Button
                    href="/search"
                    variant={pkg.highlighted ? 'primary' : 'secondary'}
                    className="w-full"
                  >
                    Reserve {pkg.name}
                  </Button>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-muted mt-5 text-xs">
        All packages include accommodation, garden spa access, and concierge planning. Rates are per
        person and vary by season.
      </p>
      <p className="text-muted mt-2 text-xs md:hidden">Swipe to compare all three tiers.</p>
    </Section>
  );
}
