import { notFound } from 'next/navigation'
import Link from 'next/link'
import { backendFetchApi } from '@/lib/api/server'
import { SearchBar } from '@/components/guest/SearchBar'
import StarRating from '@/components/StarRating'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Property, Review, RoomType } from '@/types'
import { formatCurrency, getId } from '@/lib/utils'

interface PropertyPageProps {
  params: Promise<{ slug: string }>
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params

  let property: Property | null = null
  let roomTypes: RoomType[] = []
  let reviews: Review[] = []
  let reviewSummary: { averageRating: number; totalReviews: number } | null = null

  try {
    const propertyRes = await backendFetchApi<{ data: Property }>(
      `/slug/${slug}`,
      { auth: false },
    )
    property = propertyRes.data
  } catch {
    notFound()
  }

  if (!property) notFound()

  const propertyId = getId(property)

  try {
    const [roomTypesRes, reviewsRes, summaryRes] = await Promise.all([
      backendFetchApi<{ data: RoomType[] }>(
        `/properties/${propertyId}/room-types`,
        { auth: false },
      ),
      backendFetchApi<{ data: Review[] }>(
        `/properties/${propertyId}/reviews`,
        { auth: false },
      ),
      backendFetchApi<{ data: { averageRating: number; totalReviews: number } }>(
        `/properties/${propertyId}/reviews/summary`,
        { auth: false },
      ),
    ])
    roomTypes = roomTypesRes.data
    reviews = reviewsRes.data
    reviewSummary = summaryRes.data
  } catch {
    // Non-critical data — page still renders
  }

  const images = property.images ?? []
  const primaryImage = images.find((i: { url: string; isPrimary?: boolean }) => i.isPrimary)?.url || images[0]?.url
  const galleryImages = images.filter((i: { url: string }) => i.url !== primaryImage)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="aspect-[16/10] overflow-hidden rounded-lg bg-gray-200">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={property.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {galleryImages.slice(0, 4).map((img: { url: string; caption?: string }, idx: number) => (
              <div
                key={idx}
                className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-200"
              >
                <img
                  src={img.url}
                  alt={img.caption || property.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
              {property.starRating && (
                <StarRating rating={property.starRating} />
              )}
              {reviewSummary && reviewSummary.totalReviews > 0 && (
                <span className="text-sm text-gray-600">
                  {reviewSummary.averageRating.toFixed(1)} ({reviewSummary.totalReviews}{' '}
                  reviews)
                </span>
              )}
            </div>
            <p className="mt-2 text-gray-600">
              {[
                property.address?.city,
                property.address?.state,
                property.address?.country,
              ]
                .filter(Boolean)
                .join(', ')}
            </p>
            {property.description && (
              <p className="mt-4 text-gray-700 leading-relaxed">
                {property.description}
              </p>
            )}
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity: string) => (
                  <Badge key={amenity} variant="info">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-4 text-xl font-semibold">Room types</h2>
            {roomTypes.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {roomTypes.map((roomType) => {
                  const image =
                    roomType.images?.find((i: { isPrimary?: boolean; url: string }) => i.isPrimary)?.url ||
                    roomType.images?.[0]?.url
                  return (
                    <Card key={getId(roomType)}>
                      {image && (
                        <div className="aspect-[16/9] overflow-hidden">
                          <img
                            src={image}
                            alt={roomType.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-lg">{roomType.name}</CardTitle>
                        {roomType.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {roomType.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Up to {roomType.occupancy?.maxOccupancy ?? '—'} guests
                          </div>
                          {roomType.basePrice != null && (
                            <span className="font-semibold text-green-700">
                              from {formatCurrency(roomType.basePrice)}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500">No room types listed yet.</p>
            )}
          </div>

          {reviews.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Guest reviews</h2>
              <div className="space-y-4">
                {reviews.slice(0, 6).map((review) => {
                  const extended = review as Review & {
                    text?: string
                    ratings?: { overall?: number }
                    guestId?: { firstName?: string; lastName?: string }
                  }
                  const rating =
                    extended.rating ??
                    extended.ratings?.overall ??
                    0
                  const text = extended.comment ?? extended.text ?? ''
                  const guestName = extended.guestId
                    ? [extended.guestId.firstName, extended.guestId.lastName]
                        .filter(Boolean)
                        .join(' ')
                    : 'Guest'

                  return (
                    <div
                      key={getId(review)}
                      className="rounded-lg bg-white p-6 shadow-md"
                    >
                      <div className="mb-4 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold">
                          {guestName.charAt(0)}
                        </div>
                        <div>
                          <h6 className="font-semibold">{guestName}</h6>
                          <StarRating rating={rating} />
                        </div>
                      </div>
                      {extended.title && (
                        <p className="mb-1 font-medium">{extended.title}</p>
                      )}
                      {text && <p className="text-gray-600">{text}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <SearchBar action={`/book/${property.slug}`} />
          <Card>
            <CardContent className="p-6">
              <p className="mb-4 text-sm text-gray-600">
                Ready to book? Select your dates and guests to check availability.
              </p>
              <Link href={`/book/${property.slug}`}>
                <Button className="w-full">Book now</Button>
              </Link>
            </CardContent>
          </Card>
          {property.settings && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Property info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                {property.settings.checkInTime && (
                  <p>Check-in: {property.settings.checkInTime}</p>
                )}
                {property.settings.checkOutTime && (
                  <p>Check-out: {property.settings.checkOutTime}</p>
                )}
                {property.contact?.phone && (
                  <p>Phone: {property.contact.phone}</p>
                )}
                {property.contact?.email && (
                  <p>Email: {property.contact.email}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
