import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, MapPin, Phone, Mail, Clock, Users } from 'lucide-react';
import { backendFetchApi } from '@/lib/api/server';
import { SearchBar } from '@/features/properties/components/SearchBar';
import StarRating from '@/components/StarRating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { Photo } from '@/components/ui/photo';
import type { Property, Review, RoomType } from '@/types';
import { formatCurrency, getId } from '@/lib/utils';
import { photography } from '@/lib/content';

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await backendFetchApi<{ data: Property }>(`/slug/${slug}`, { auth: false });
    const property = res.data;
    return {
      title: property.name,
      description: property.description?.slice(0, 160) || `Book your stay at ${property.name}`,
      openGraph: {
        title: property.name,
        description: property.description?.slice(0, 160),
        type: 'website',
      },
    };
  } catch {
    return { title: 'Property' };
  }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-brand text-xs font-medium uppercase tracking-[0.16em]">{children}</h2>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;

  let property: Property | null = null;
  let roomTypes: RoomType[] = [];
  let reviews: Review[] = [];
  let reviewSummary: { averageRating: number; totalReviews: number } | null = null;

  try {
    const propertyRes = await backendFetchApi<{ data: Property }>(`/slug/${slug}`, { auth: false });
    property = propertyRes.data;
  } catch {
    notFound();
  }

  if (!property) notFound();

  const propertyId = getId(property);

  try {
    const [roomTypesRes, reviewsRes, summaryRes] = await Promise.all([
      backendFetchApi<{ data: RoomType[] }>(`/properties/${propertyId}/room-types`, {
        auth: false,
      }),
      backendFetchApi<{ data: Review[] }>(`/properties/${propertyId}/reviews`, { auth: false }),
      backendFetchApi<{ data: { averageRating: number; totalReviews: number } }>(
        `/properties/${propertyId}/reviews/summary`,
        { auth: false },
      ),
    ]);
    roomTypes = roomTypesRes.data;
    reviews = reviewsRes.data;
    reviewSummary = summaryRes.data;
  } catch {
    // Non-critical data — page still renders without it
  }

  const images = property.images ?? [];
  const primaryImage =
    images.find((i: { url: string; isPrimary?: boolean }) => i.isPrimary)?.url || images[0]?.url;
  const galleryImages = images
    .filter((i: { url: string }) => i.url !== primaryImage)
    .slice(0, 4)
    .map((i: { url: string }) => i.url);

  const heroImage = primaryImage || photography.hero;
  const mosaic = [...galleryImages, photography.suites[0], photography.suites[1]].slice(0, 4);

  const location = [property.address?.city, property.address?.state, property.address?.country]
    .filter(Boolean)
    .join(', ');

  const reviewCount = reviewSummary?.totalReviews ?? 0;

  // The cancellation note is stored in property settings by the seed/back office,
  // but is not yet part of the shared Property type contract.
  const cancellationPolicy = (property.settings as { cancellationPolicy?: string } | undefined)
    ?.cancellationPolicy;

  return (
    <Container className="py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="text-muted mb-6 text-xs">
        <Link href="/" className="hover:text-brand underline-offset-4 hover:underline">
          Home
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <Link href="/search" className="hover:text-brand underline-offset-4 hover:underline">
          Stays
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <span className="text-ink">{property.name}</span>
      </nav>

      {/* Gallery mosaic */}
      <div className="grid gap-2 md:h-[520px] md:grid-cols-[2fr_1fr] md:gap-3">
        <div className="bg-brand-soft relative aspect-[4/3] overflow-hidden rounded-[4px] md:aspect-auto md:h-full">
          <Photo
            src={heroImage}
            alt={property.name}
            fill
            priority
            sizes="(min-width: 768px) 62vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="hidden gap-2 md:grid md:grid-rows-3 md:gap-3">
          {mosaic.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="bg-brand-soft relative overflow-hidden rounded-[4px]"
            >
              <Photo
                src={image}
                alt={`${property.name} — view ${index + 2}`}
                fill
                sizes="(min-width: 768px) 32vw, 0vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-14">
        {/* Main column */}
        <div className="lg:col-span-8">
          <header className="border-line border-t pt-6">
            <p className="text-brand/40 tabular font-serif text-2xl leading-none">—</p>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-title text-balance">{property.name}</h1>
                {location && (
                  <p className="text-muted mt-3 flex items-center gap-1.5 text-sm">
                    <MapPin aria-hidden className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {location}
                  </p>
                )}
              </div>

              <div className="shrink-0 text-right">
                {property.starRating ? (
                  <div className="flex items-center justify-end gap-2">
                    <StarRating rating={property.starRating} />
                    <span className="text-muted text-xs">{property.starRating}-star</span>
                  </div>
                ) : null}
                {reviewCount > 0 && reviewSummary && (
                  <p className="text-muted mt-1.5 text-xs">
                    {reviewSummary.averageRating.toFixed(1)} · {reviewCount}{' '}
                    {reviewCount === 1 ? 'review' : 'reviews'}
                  </p>
                )}
              </div>
            </div>

            {property.description && (
              <p className="text-muted mt-6 max-w-2xl text-pretty text-base leading-relaxed">
                {property.description}
              </p>
            )}
          </header>

          {property.amenities && property.amenities.length > 0 && (
            <section
              className="border-line mt-10 border-t pt-6"
              aria-labelledby="amenities-heading"
            >
              <SectionLabel>Amenities</SectionLabel>
              <h2 id="amenities-heading" className="sr-only">
                Amenities
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {property.amenities.map((amenity: string) => (
                  <Badge key={amenity} variant="brand">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          <section className="border-line mt-10 border-t pt-6" aria-labelledby="rooms-heading">
            <SectionLabel>Rooms</SectionLabel>
            <h2 id="rooms-heading" className="mt-1 font-serif text-2xl">
              Choose your room
            </h2>

            {roomTypes.length > 0 ? (
              <ul className="divide-line mt-6 divide-y">
                {roomTypes.map((roomType) => {
                  const image =
                    roomType.images?.find((i: { isPrimary?: boolean; url: string }) => i.isPrimary)
                      ?.url || roomType.images?.[0]?.url;

                  return (
                    <li key={getId(roomType)} className="py-6 first:pt-0">
                      <article className="grid gap-5 sm:grid-cols-[180px_1fr]">
                        <div className="bg-brand-soft relative aspect-[4/3] overflow-hidden rounded-[4px] sm:aspect-[4/3]">
                          <Photo
                            src={
                              image ||
                              photography.suites[
                                roomTypes.indexOf(roomType) % photography.suites.length
                              ]
                            }
                            alt={roomType.name}
                            fill
                            sizes="(min-width: 640px) 180px, 100vw"
                            className="object-cover"
                          />
                        </div>

                        <div className="flex flex-col justify-between gap-3">
                          <div>
                            <h3 className="font-serif text-xl leading-tight">{roomType.name}</h3>
                            {roomType.description && (
                              <p className="text-muted mt-2 line-clamp-2 text-sm leading-relaxed">
                                {roomType.description}
                              </p>
                            )}
                            <p className="text-muted mt-2 flex items-center gap-1.5 text-xs">
                              <Users aria-hidden className="h-3.5 w-3.5" strokeWidth={1.5} />
                              Up to {roomType.occupancy?.maxOccupancy ?? '—'} guests
                            </p>
                          </div>

                          <div className="flex flex-wrap items-end justify-between gap-3">
                            {roomType.basePrice != null && (
                              <p className="tabular font-serif text-xl leading-none">
                                {formatCurrency(roomType.basePrice)}
                                <span className="text-muted font-sans text-xs"> / night</span>
                              </p>
                            )}
                            <Link
                              href={`/book/${property.slug}?roomTypeId=${getId(roomType)}`}
                              className="focus-ring text-brand inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
                            >
                              Reserve
                              <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </Link>
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                className="mt-6"
                title="Rooms are being prepared"
                description="Our team is finalising the room list for this property. Contact the concierge and we will help you plan the stay."
                action={
                  <Button variant="secondary" href={`/book/${property.slug}`}>
                    Request a stay
                  </Button>
                }
              />
            )}
          </section>

          <section className="border-line mt-10 border-t pt-6" aria-labelledby="reviews-heading">
            <SectionLabel>Guest stories</SectionLabel>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="reviews-heading" className="font-serif text-2xl">
                What guests say
              </h2>
              {reviewCount > 0 && reviewSummary && (
                <p className="text-muted text-sm">
                  <span className="text-ink tabular">{reviewSummary.averageRating.toFixed(1)}</span>{' '}
                  from {reviewCount} {reviewCount === 1 ? 'guest' : 'guests'}
                </p>
              )}
            </div>

            {reviews.length > 0 ? (
              <ul className="mt-6 space-y-6">
                {reviews.slice(0, 6).map((review) => {
                  const extended = review as Review & {
                    text?: string;
                    ratings?: { overall?: number };
                    guestId?: { firstName?: string; lastName?: string };
                    title?: string;
                  };
                  const rating = extended.rating ?? extended.ratings?.overall ?? 0;
                  const text = extended.comment ?? extended.text ?? '';
                  const guestName = extended.guestId
                    ? [extended.guestId.firstName, extended.guestId.lastName]
                        .filter(Boolean)
                        .join(' ')
                    : 'Guest';

                  return (
                    <li
                      key={getId(review)}
                      className="border-line border-t pt-5 first:border-t-0 first:pt-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-brand-soft text-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-sm">
                          {guestName.charAt(0)}
                        </span>
                        <div>
                          <p className="text-ink text-sm">{guestName}</p>
                          <StarRating rating={rating} />
                        </div>
                      </div>
                      {extended.title && (
                        <p className="text-ink mt-3 font-medium">{extended.title}</p>
                      )}
                      {text && (
                        <p className="text-muted mt-2 text-pretty text-sm leading-relaxed">
                          {text}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted mt-4 text-sm">
                No reviews yet — be the first to tell us how it felt.
              </p>
            )}
          </section>
        </div>

        {/* Sticky booking rail */}
        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-28">
            <div className="border-line bg-raised rounded-[4px] border p-1 shadow-[var(--shadow-soft)]">
              <SearchBar action={`/book/${property.slug}`} compact />
            </div>

            <div className="border-line rounded-[4px] border p-5">
              <h2 className="font-serif text-lg leading-snug">Good to know</h2>
              <dl className="text-muted mt-4 space-y-3 text-sm">
                {property.settings?.checkInTime && (
                  <div className="flex items-start gap-2.5">
                    <Clock aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                    <div>
                      <dt className="text-ink text-xs">Check-in</dt>
                      <dd>{property.settings.checkInTime}</dd>
                    </div>
                  </div>
                )}
                {property.settings?.checkOutTime && (
                  <div className="flex items-start gap-2.5">
                    <Clock aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                    <div>
                      <dt className="text-ink text-xs">Check-out</dt>
                      <dd>{property.settings.checkOutTime}</dd>
                    </div>
                  </div>
                )}
                {cancellationPolicy && (
                  <div className="border-line border-t pt-3">
                    <dt className="text-ink text-xs">Cancellation</dt>
                    <dd>{cancellationPolicy}</dd>
                  </div>
                )}
              </dl>

              {(property.contact?.phone || property.contact?.email) && (
                <div className="border-line mt-4 space-y-2 border-t pt-4 text-sm">
                  {property.contact?.phone && (
                    <a
                      href={`tel:${property.contact.phone.replace(/[^+\d]/g, '')}`}
                      className="text-muted hover:text-brand flex items-center gap-2"
                    >
                      <Phone aria-hidden className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {property.contact.phone}
                    </a>
                  )}
                  {property.contact?.email && (
                    <a
                      href={`mailto:${property.contact.email}`}
                      className="text-muted hover:text-brand flex items-center gap-2 break-all"
                    >
                      <Mail aria-hidden className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                      {property.contact.email}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
