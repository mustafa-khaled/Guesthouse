import type { Metadata } from 'next';
import { PropertyCardGrid } from '@/features/properties/components/PropertyCard';
import { SearchBar } from '@/features/properties/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { backendFetchApi } from '@/lib/api/server';
import type { PaginatedResponse, Property } from '@/types';

export const metadata: Metadata = {
  title: 'Stays',
  description:
    'Every Serene Stays address, from garden sanctuaries to horizon suites — each a quiet composition of light, texture, and unhurried comfort.',
  alternates: { canonical: '/properties' },
};

export default async function PropertiesPage() {
  let properties: Property[] = [];

  try {
    const res = await backendFetchApi<PaginatedResponse<Property>>('/?limit=50');
    properties = res.data;
  } catch {
    properties = [];
  }

  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        folio="01"
        title="Our stays"
        description="Each address is chosen for its light and its quiet. Choose your dates and we will show you the rooms that are free."
      />

      <div className="mt-10">
        <SearchBar />
      </div>

      <section aria-labelledby="all-stays" className="mt-16">
        <h2 id="all-stays" className="sr-only">
          All stays
        </h2>

        {properties.length > 0 ? (
          <PropertyCardGrid properties={properties} />
        ) : (
          <EmptyState
            title="No stays published yet"
            description="Our houses are being prepared. Search by date and we will show what is available for your stay."
            action={
              <Button href="/search" variant="secondary">
                Search by date
              </Button>
            }
          />
        )}
      </section>
    </Container>
  );
}
