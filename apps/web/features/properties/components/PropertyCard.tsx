import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Photo } from '@/components/ui/photo';
import type { Property } from '@/types';
import { getId } from '@/lib/utils';

export function PropertyCard({ property }: { property: Property }) {
  const image = property.images?.find((i) => i.isPrimary)?.url || property.images?.[0]?.url;
  const city = property.address?.city;
  const country = property.address?.country;
  const location = [city, country].filter(Boolean).join(', ') || 'Location on request';

  return (
    <Link href={`/properties/${property.slug}`} className="focus-ring group block">
      <div className="bg-brand-soft relative aspect-[4/3] overflow-hidden rounded-[4px]">
        {image ? (
          <Photo
            src={image}
            alt={property.name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="ease-soft object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="text-brand/40 flex h-full items-center justify-center px-6 text-center font-serif text-lg">
            {property.name}
          </div>
        )}
      </div>

      <div className="border-line mt-4 flex items-start justify-between gap-4 border-t pt-4">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-xl leading-tight">{property.name}</h3>
          <p className="text-muted mt-1 text-sm">{location}</p>
          <p className="text-brand mt-2 text-xs uppercase tracking-[0.14em]">
            {property.starRating ? `${property.starRating}-star` : 'Serene stay'}
          </p>
        </div>
        <ArrowUpRight
          aria-hidden
          className="text-brand mt-1 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          strokeWidth={1.5}
        />
      </div>
    </Link>
  );
}

export function PropertyCardGrid({ properties }: { properties: Property[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={getId(property)} property={property} />
      ))}
    </div>
  );
}
