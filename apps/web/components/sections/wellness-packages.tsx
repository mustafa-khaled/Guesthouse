import Link from 'next/link';
import { PackageTiers } from '@/components/sections/package-tiers';
import { Section } from '@/components/ui/section';

export function WellnessPackages() {
  return (
    <Section
      id="packages"
      folio="04"
      title="Curated retreats for every rhythm"
      description="Three tiers of renewal — from a gentle reset to a complete transformation."
      aside={
        <Link
          href="/packages"
          className="focus-ring text-brand hover:text-brand-deep mt-4 inline-flex text-sm underline-offset-4 hover:underline"
        >
          Compare all inclusions →
        </Link>
      }
    >
      <PackageTiers />

      <p className="text-muted mt-6 text-xs">
        All packages include accommodation, garden spa access, and concierge planning. Rates are per
        person and vary by season.
      </p>
    </Section>
  );
}
