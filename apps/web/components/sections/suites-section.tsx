import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Photo } from '@/components/ui/photo';
import { Section } from '@/components/ui/section';
import { buttonClass } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { photography, site, suites } from '@/lib/content';
import type { Property } from '@/types';

interface StayTileProps {
  name: string;
  description: string;
  detail: string;
  image: string;
  href: string;
  imageClassName?: string;
  sizes: string;
}

function StayTile({
  name,
  description,
  detail,
  image,
  href,
  imageClassName,
  sizes,
}: StayTileProps) {
  return (
    <Link href={href} className="focus-ring group block">
      <div
        className={`bg-brand-soft relative overflow-hidden rounded-[4px] ${imageClassName ?? 'aspect-[16/10]'}`}
      >
        <Photo
          src={image}
          alt={`${name} at ${site.name}`}
          fill
          sizes={sizes}
          className="ease-soft object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="border-line mt-4 border-t pt-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-2xl leading-tight">{name}</h3>
          <ArrowUpRight
            aria-hidden
            className="text-brand mt-1 h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        </div>
        <p className="text-muted mt-2 text-sm leading-relaxed">{description}</p>
        <p className="text-brand mt-3 text-xs uppercase tracking-[0.14em]">{detail}</p>
      </div>
    </Link>
  );
}

export function SuitesSection({ properties = [] }: { properties?: Property[] }) {
  const liveStays = properties.slice(0, 3).map((property, index) => ({
    name: property.name,
    description:
      property.description?.split('. ').slice(0, 2).join('. ') ??
      'A quiet stay shaped by light and garden air.',
    detail:
      [
        property.address?.city,
        property.address?.country,
        property.starRating ? `${property.starRating}-star` : null,
      ]
        .filter(Boolean)
        .join(' · ') || 'Serene Stays',
    image:
      property.images?.find((image) => image.isPrimary)?.url ||
      property.images?.[0]?.url ||
      photography.suites[index % photography.suites.length],
    href: `/properties/${property.slug}`,
  }));

  const fallbackStays = suites.map((suite) => ({
    name: suite.name,
    description: suite.description,
    detail: suite.detail,
    image: suite.image,
    href: '/search',
  }));

  const stays = liveStays.length > 0 ? liveStays : fallbackStays;

  return (
    <Section
      id="suites"
      folio="03"
      title="Rooms that hold the light"
      description="Each stay is a quiet composition of light, texture, and unhurried comfort — closer to a home than a hotel."
      aside={
        <a
          href="/search"
          className="focus-ring text-brand hover:text-brand-deep mt-4 inline-flex text-sm underline-offset-4 hover:underline"
        >
          View all stays →
        </a>
      }
    >
      <div className="grid gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-7">
          {stays[0] && (
            <StayTile
              {...stays[0]}
              imageClassName="aspect-[4/3] md:aspect-[4/4.6]"
              sizes="(min-width: 768px) 56vw, 100vw"
            />
          )}
        </div>

        <div className="flex flex-col gap-10 md:col-span-5">
          {stays.slice(1, 3).map((stay) => (
            <StayTile
              key={stay.name}
              {...stay}
              imageClassName="aspect-[16/10]"
              sizes="(min-width: 768px) 38vw, 100vw"
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

export function ConciergeCta() {
  return (
    <section className="bg-brand text-surface-raised">
      <Container className="py-20 md:py-24">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <p aria-hidden className="text-surface-raised/25 font-serif text-5xl leading-none">
              07
            </p>
            <h2 className="text-surface-raised mt-4 max-w-xl font-serif text-4xl leading-[1.05] md:text-5xl">
              Not sure yet? Let us plan your stay.
            </h2>
            <p className="text-surface-raised/70 mt-5 max-w-lg text-pretty text-base leading-relaxed">
              Tell us what you are celebrating. Our concierge will suggest the right suite, the
              rituals worth keeping, and a pace that suits you.
            </p>
            <a
              href={`mailto:${site.email}`}
              className={buttonClass({
                variant: 'secondary',
                className:
                  'border-surface-raised/30 text-surface-raised hover:bg-surface-raised hover:text-brand mt-8',
              })}
            >
              Speak with concierge
            </a>
          </div>

          <div className="border-surface-raised/20 self-end border-t pt-6 md:col-span-4 md:col-start-9">
            <p className="text-surface-raised/60 text-xs uppercase tracking-[0.16em]">
              Direct lines
            </p>
            <p className="mt-3 text-sm">
              <a href={`tel:${site.phone.replace(/[^+\d]/g, '')}`} className="hover:underline">
                {site.phone}
              </a>
            </p>
            <p className="mt-1 text-sm">
              <a href={`mailto:${site.email}`} className="hover:underline">
                {site.email}
              </a>
            </p>
            <p className="text-surface-raised/50 mt-4 text-xs">Replies within one business day.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
