import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Property } from '@/types'
import { getId } from '@/lib/utils'

export function PropertyCard({ property }: { property: Property }) {
  const image = property.images?.find((i) => i.isPrimary)?.url || property.images?.[0]?.url
  const city = property.address?.city
  const country = property.address?.country

  return (
    <Link href={`/properties/${property.slug}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-[16/10] bg-gray-200">
          {image ? (
            <img
              src={image}
              alt={property.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-1">{property.name}</CardTitle>
          <p className="text-sm text-gray-500">
            {[city, country].filter(Boolean).join(', ') || 'Location unavailable'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {property.starRating && (
              <span className="text-sm text-yellow-600">
                {'★'.repeat(property.starRating)}
              </span>
            )}
            <span className="text-xs text-gray-400">View details →</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function PropertyCardGrid({ properties }: { properties: Property[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((p) => (
        <PropertyCard key={getId(p)} property={p} />
      ))}
    </div>
  )
}
