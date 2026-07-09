import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import { packages } from '@/lib/content';
import { cn } from '@/lib/utils';

export function WellnessPackages() {
  return (
    <Section
      id="packages"
      variant="divider"
      eyebrow="Wellness packages"
      title="Curated retreats for every rhythm"
      description="Three tiers of renewal — from a gentle reset to a complete transformation."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card
            key={pkg.name}
            className={cn(
              'flex h-full flex-col',
              pkg.highlighted && 'border-matcha-brand ring-matcha-brand/20 ring-1',
            )}
          >
            {pkg.highlighted && (
              <span className="bg-matcha-brand text-matcha-white mb-4 inline-flex self-start rounded-[4px] px-3 py-1 text-xs font-medium uppercase tracking-wide">
                Recommended
              </span>
            )}
            <h3 className="text-matcha-heading font-serif text-2xl font-medium">{pkg.name}</h3>
            <p className="text-matcha-brand mt-2 text-sm">{pkg.duration}</p>
            <p className="text-matcha-heading mt-4 font-serif text-3xl font-medium">{pkg.price}</p>
            <p className="text-matcha-body mt-3 text-sm leading-relaxed">{pkg.description}</p>
            <ul className="border-matcha-border mt-6 flex-1 space-y-2 border-t pt-6">
              {pkg.features.map((feature) => (
                <li key={feature} className="text-matcha-body flex gap-2 text-sm">
                  <span aria-hidden className="text-matcha-brand">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              href="#book"
              variant={pkg.highlighted ? 'primary' : 'secondary'}
              className="mt-8 w-full"
            >
              View package
            </Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}
