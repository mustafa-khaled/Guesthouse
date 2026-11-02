import type { Metadata } from 'next';
import { PackageComparison } from '@/components/sections/package-comparison';
import { PackageTiers } from '@/components/sections/package-tiers';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Wellness packages',
  description:
    'Three tiers of renewal at Serene Stays — Essential, Signature, and Transform. Compare accommodation, dining, spa treatments, and transfers.',
  alternates: { canonical: '/packages' },
};

export default function PackagesPage() {
  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        folio="03"
        title="Wellness packages"
        description="Three tiers of renewal — from a gentle reset to a complete transformation. Compare what each one holds."
      />

      <div className="mt-12">
        <PackageTiers />
      </div>

      <section
        aria-labelledby="package-comparison"
        className="border-line mt-20 border-t pt-10 md:mt-24 md:pt-12"
      >
        <h2 id="package-comparison" className="text-heading">
          Compare the inclusions
        </h2>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-relaxed">
          Every tier includes accommodation, garden spa access, and concierge planning. Rates are
          per person and vary by season.
        </p>

        <PackageComparison className="mt-8" />

        <p className="text-muted mt-5 text-xs md:hidden">Swipe to compare all three tiers.</p>
      </section>
    </Container>
  );
}
