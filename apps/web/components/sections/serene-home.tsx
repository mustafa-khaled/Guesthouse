'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  BedDouble,
  CalendarDays,
  ChevronDown,
  Coffee,
  Heart,
  MapPin,
  Menu,
  Search,
  Users,
  Waves,
  Wifi,
  X,
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from '@/components/ui/carousel';
import { BrandMark } from '@/components/shared/nav/brand-mark';
import { useAuth } from '@/hooks/useAuth';
import { site, photography } from '@/lib/content';
import type { Property } from '@/types';

interface SereneHomeProps {
  initialProperties?: Property[];
}

const heroSlides = [
  {
    image:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2200&q=85',
    title: (
      <>
        Explore your place
        <br className="hidden sm:block" /> to stay
      </>
    ),
    caption: 'A garden sanctuary for rest, renewal, and unhurried days by the water.',
    note: 'Suites, restorative rituals, and warm hospitality shaped by light.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=2200&q=85',
    title: (
      <>
        Find a stay
        <br className="hidden sm:block" /> worth remembering
      </>
    ),
    caption: 'Wake up somewhere new, with a sanctuary that feels made just for you.',
    note: 'Discover your own quiet cadence in nature.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2200&q=85',
    title: (
      <>
        A little further
        <br className="hidden sm:block" /> from ordinary
      </>
    ),
    caption: 'Discover quiet hideaways and breathtaking horizons around the world.',
    note: 'Your next chapter of renewal begins here.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=2200&q=85',
    title: (
      <>
        Make room
        <br className="hidden sm:block" /> for the weekend
      </>
    ),
    caption: 'From coastal villas to alpine lodges, find a quiet place to slow down.',
    note: 'Curated comforts designed for unhurried living.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=85',
    title: (
      <>
        Go where
        <br className="hidden sm:block" /> you feel alive
      </>
    ),
    caption: 'Explore stays that bring you closer to still waters and open sky.',
    note: 'The stillness you have been seeking is waiting.',
  },
];

const fallbackSeedStays = [
  {
    name: 'Seaside Resort & Spa',
    place: 'Miami Beach, USA',
    price: '$ 450',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85',
    rating: '4.95',
    slug: 'seaside-resort-spa',
    bedrooms: 'Ocean Suite',
    size: '55m² · Spa Access',
  },
  {
    name: 'Mountain Lodge Inn',
    place: 'Aspen, USA',
    price: '$ 380',
    image:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=85',
    rating: '4.92',
    slug: 'mountain-lodge-inn',
    bedrooms: 'Alpine Loft',
    size: '48m² · Fireplace',
  },
  {
    name: 'Villa Kemah Tinggi',
    place: 'Ubud, Indonesia',
    price: '$ 990',
    image:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=85',
    rating: '4.98',
    slug: 'villa-kemah-tinggi',
    bedrooms: '2 bedrooms',
    size: '214m² · Private Pool',
  },
  {
    name: 'Villa Kuta Premiere',
    place: 'Canggu, Indonesia',
    price: '$ 920',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85',
    rating: '4.93',
    slug: 'villa-kuta-premiere',
    bedrooms: '3 bedrooms',
    size: '280m² · Ocean View',
  },
  {
    name: 'Urban Boutique Sanctuary',
    place: 'New York, USA',
    price: '$ 510',
    image:
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85',
    rating: '4.89',
    slug: 'urban-boutique-sanctuary',
    bedrooms: 'Penthouse Suite',
    size: '72m² · Terrace',
  },
];

const propertyTypes = [
  {
    name: 'Resorts & Spas',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=85',
    query: 'Resort',
  },
  {
    name: 'Private Villas',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=700&q=85',
    query: 'Villa',
  },
  {
    name: 'Mountain Lodges',
    image:
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=700&q=85',
    query: 'Lodge',
  },
  {
    name: 'Boutique Hotels',
    image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=700&q=85',
    query: 'Hotel',
  },
  {
    name: 'Historic Cottages',
    image:
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=700&q=85',
    query: 'Cottage',
  },
];

const trendingDestinations = [
  {
    name: 'Miami Beach',
    query: 'Miami Beach',
    image:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=85',
  },
  {
    name: 'Aspen Rockies',
    query: 'Aspen',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=85',
  },
  {
    name: 'Bali Sanctuary',
    query: 'Bali',
    image:
      'https://images.unsplash.com/photo-1565008576549-57569a49371d?auto=format&fit=crop&w=600&q=85',
  },
  {
    name: 'Amalfi Coast',
    query: 'Amalfi',
    image:
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=600&q=85',
  },
  {
    name: 'Kyoto Gardens',
    query: 'Kyoto',
    image:
      'https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=600&q=85',
  },
];

function SectionTitle({ children, eyebrow }: { children: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#ad8965]">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-semibold tracking-tight text-[#242321] sm:text-3xl">
          {children}
        </h2>
      </div>
    </div>
  );
}

function CarouselDots({ count, className = '' }: { count: number; className?: string }) {
  const { api } = useCarousel();
  const [activeIndex, setActiveIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(count);

  useEffect(() => {
    if (!api) return;

    const sync = () => {
      const snaps = api.scrollSnapList().length;
      setSnapCount(snaps);
      setActiveIndex(Math.round((api.selectedScrollSnap() / Math.max(1, snaps - 1)) * (count - 1)));
    };

    sync();
    api.on('select', sync);
    api.on('reInit', sync);
    return () => {
      api.off('select', sync);
      api.off('reInit', sync);
    };
  }, [api, count]);

  return (
    <div
      className={`carousel-bullets ${className}`}
      role="group"
      aria-label="Choose carousel slide"
    >
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          className={`carousel-bullet ${index === activeIndex ? 'is-active' : ''}`}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === activeIndex ? 'true' : undefined}
          onClick={() =>
            api?.scrollTo(Math.round((index / Math.max(1, count - 1)) * (snapCount - 1)))
          }
        />
      ))}
    </div>
  );
}

export function SereneHome({ initialProperties = [] }: SereneHomeProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [destination, setDestination] = useState('Miami Beach, Florida');
  const [guests, setGuests] = useState(2);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Dates defaults: tomorrow and +3 nights
  const defaultDates = useMemo(() => {
    const today = new Date();
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() + 1);
    const checkOutDate = new Date(today);
    checkOutDate.setDate(today.getDate() + 4);
    return {
      checkIn: checkInDate.toISOString().slice(0, 10),
      checkOut: checkOutDate.toISOString().slice(0, 10),
    };
  }, []);

  const [checkIn, setCheckIn] = useState(defaultDates.checkIn);
  const [checkOut, setCheckOut] = useState(defaultDates.checkOut);

  // Combine dynamic properties with seed items so the carousel is richly populated
  const displayStays = useMemo(() => {
    const fromApi = initialProperties.map((prop, idx) => ({
      name: prop.name,
      place:
        [prop.address?.city, prop.address?.country].filter(Boolean).join(', ') ||
        'Sanctuary collection',
      price: `$ ${prop.settings?.taxRate ? 350 + (idx % 4) * 150 : 450}`,
      image:
        prop.images?.find((img) => img.isPrimary)?.url ||
        prop.images?.[0]?.url ||
        photography.suites[idx % photography.suites.length],
      rating: prop.starRating ? prop.starRating.toFixed(2) : '4.95',
      slug: prop.slug,
      bedrooms: prop.amenities?.[0] || 'Signature Suite',
      size: prop.amenities?.[1] || 'High-speed Wi-Fi',
    }));

    if (fromApi.length >= 5) {
      return fromApi;
    }

    // Merge API properties with fallback seed stays to ensure 5+ items
    const merged = [...fromApi];
    for (const seed of fallbackSeedStays) {
      if (!merged.some((m) => m.slug === seed.slug)) {
        merged.push(seed);
      }
    }
    return merged.slice(0, 8);
  }, [initialProperties]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams({
      q: destination,
      checkIn,
      checkOut,
      adults: String(guests),
      children: '0',
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[var(--surface,#f4f1eb)] text-[#242321]">
      {/* SVG ClipPath Definitions */}
      <svg aria-hidden="true" focusable="false" className="header-shape-defs">
        <defs>
          <clipPath id="header-nav-clip" clipPathUnits="objectBoundingBox">
            <path d="M .075 0 C .12 0 .135 .14 .16 .42 C .19 .78 .21 1 .29 1 H .71 C .79 1 .81 .78 .84 .42 C .865 .14 .88 0 .925 0 H .075 Z" />
          </clipPath>
          <clipPath id="hero-carousel-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0 0 H 1 V .93 C 1 .97 .985 1 .94 1 H .06 C .015 1 0 .97 0 .93 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Hero Section */}
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(15,18,18,0.58), rgba(19,19,17,0.3) 58%, rgba(10,12,12,0.45)), linear-gradient(0deg, rgba(7,9,8,0.36), transparent 45%), url(${heroSlides[heroIndex].image})`,
        }}
      >
        {/* Site Header */}
        <header className="site-header">
          <Link href="/" className="brand" aria-label={`${site.name} home`}>
            <BrandMark className="h-7 w-7 text-white" />
            <span>
              {site.name}
              <span>.sanctuary</span>
            </span>
          </Link>

          {/* Curved Notch Nav Links */}
          <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
            <Link href="/properties">Stays</Link>
            <Link href="/experiences">Experiences</Link>
            <Link href="/packages">Wellness</Link>
            <Link href="/spa">Spa</Link>
            {user ? <Link href="/account">Account</Link> : <Link href="/login">Sign in</Link>}
          </nav>

          <Link href="/search" className="app-link">
            Check availability <ArrowDown size={14} />
          </Link>

          <button
            type="button"
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Hero Content */}
        <div className="hero-content">
          <p className="hero-kicker">Find your next stillness</p>
          <h1>{heroSlides[heroIndex].title}</h1>

          {/* Dynamic Search Bar */}
          <form className="search-bar" onSubmit={handleSearchSubmit}>
            <label className="search-field destination-field">
              <Search size={18} className="text-[#caa37a]" />
              <input
                aria-label="Destination or sanctuary name"
                placeholder="Where would you like to rest?"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
              />
            </label>

            <label className="search-field date-field">
              <CalendarDays size={17} className="text-[#caa37a]" />
              <input
                type="date"
                aria-label="Check-in date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
              <span className="field-divider" />
              <input
                type="date"
                aria-label="Check-out date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </label>

            <label className="search-field guest-field">
              <Users size={17} className="text-[#caa37a]" />
              <span>{guests} Guests</span>
              <button
                type="button"
                aria-label="Change guests count"
                onClick={() => setGuests(guests >= 8 ? 1 : guests + 1)}
                title="Click to change guest count"
              >
                <ChevronDown size={15} />
              </button>
            </label>

            <button type="submit" className="checkout-btn">
              Search stays
            </button>
          </form>

          {/* Floating Caption Card */}
          <div className="hero-caption">
            <span className="caption-line" />
            <div>
              <h2>{heroSlides[heroIndex].caption}</h2>
              <p>{heroSlides[heroIndex].note}</p>
            </div>
          </div>
        </div>

        {/* Hero Dots with Curved Cutout */}
        <div className="hero-dots" role="group" aria-label="Choose featured stay slide">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              className={`carousel-bullet ${index === heroIndex ? 'is-active' : ''}`}
              aria-label={`Show featured stay ${index + 1}`}
              aria-current={index === heroIndex ? 'true' : undefined}
              onClick={() => setHeroIndex(index)}
            />
          ))}
        </div>
      </section>

      {/* Stays Carousel Section */}
      <section className="stays-section" id="stays">
        <div className="content-wrap">
          <div className="center-title">
            <p className="section-eyebrow">Handpicked for you</p>
            <SectionTitle>Sanctuaries in our collection</SectionTitle>
          </div>

          <div className="carousel-shell">
            <Carousel opts={{ align: 'center', loop: true }}>
              <CarouselContent className="-ms-3 items-center py-4">
                {displayStays.map((stay, index) => {
                  const isFav = !!favorites[stay.slug];
                  return (
                    <CarouselItem
                      key={stay.slug}
                      className="basis-[82%] ps-3 sm:basis-[48%] md:basis-[33%] lg:basis-[25%]"
                    >
                      <article className={`stay-card ${index % 2 === 0 ? 'stay-card--short' : ''}`}>
                        <div
                          className="stay-photo"
                          style={{ backgroundImage: `url(${stay.image})` }}
                        >
                          <span className="rating">✦ {stay.rating}</span>
                          <button
                            type="button"
                            className={`favorite ${isFav ? 'is-active' : ''}`}
                            aria-label={`Save ${stay.name}`}
                            onClick={() => toggleFavorite(stay.slug)}
                          >
                            <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                        <div className="mt-3 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[#282725]">
                              <Link
                                href={`/properties/${stay.slug}`}
                                className="transition-colors hover:text-[#ad8965]"
                              >
                                {stay.name}
                              </Link>
                            </h3>
                            <p className="mt-1 truncate text-xs text-neutral-500">{stay.place}</p>
                            <p className="mt-2 flex items-center gap-3 text-[11px] text-neutral-400">
                              <span className="flex items-center gap-1">
                                <BedDouble size={13} />
                                {stay.bedrooms}
                              </span>
                              <span className="flex items-center gap-1">
                                <Wifi size={13} />
                                {stay.size}
                              </span>
                            </p>
                          </div>
                          <span className="whitespace-nowrap text-sm font-semibold text-[#ae875e]">
                            {stay.price}
                            <small className="block text-right text-[10px] font-normal text-neutral-400">
                              per night
                            </small>
                          </span>
                        </div>
                      </article>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious
                aria-label="Previous stays"
                className="carousel-arrow carousel-prev"
              />
              <CarouselNext aria-label="Next stays" className="carousel-arrow carousel-next" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits" id="benefits">
        <div className="benefit-grid">
          <article>
            <span className="benefit-icon">
              <MapPin />
            </span>
            <h3>Curated Sanctuaries</h3>
            <p>
              From oceanfront villas to alpine mountain retreats, each stay is handpicked for calm,
              texture, and natural light.
            </p>
          </article>
          <article>
            <span className="benefit-icon">
              <Waves />
            </span>
            <h3>Restorative Wellness</h3>
            <p>
              Thermal baths, botanical spa therapies, and mindful rituals crafted to recalibrate
              your rhythm.
            </p>
          </article>
          <article>
            <span className="benefit-icon">
              <Coffee />
            </span>
            <h3>Direct Reserve Privileges</h3>
            <p>
              Guaranteed best rates, flexible concierge check-in, and complimentary morning tea
              ceremony.
            </p>
          </article>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="property-section" id="property-types">
        <div className="content-wrap">
          <div className="property-intro">
            <div>
              <p className="section-eyebrow">Find your kind of getaway</p>
              <h2>Browse by property type</h2>
              <p className="intro-copy">
                Easily filter your escape by the architecture and rhythm that suits you. From
                secluded villas with private thermal pools to full-service resorts and alpine
                lodges, select the environment that brings you stillness.
              </p>
            </div>
            <span className="year-mark">EST. 2018</span>
          </div>

          <div className="carousel-shell property-shell">
            <Carousel opts={{ align: 'center', loop: true }}>
              <CarouselContent className="-ms-3 items-stretch py-3">
                {propertyTypes.map((type) => (
                  <CarouselItem
                    key={type.name}
                    className="basis-[68%] ps-3 sm:basis-[42%] md:basis-[30%] lg:basis-[22%]"
                  >
                    <Link
                      href={`/search?q=${encodeURIComponent(type.query)}`}
                      className="group block"
                    >
                      <article className="property-card">
                        <h3>{type.name}</h3>
                        <div
                          className="property-photo"
                          style={{ backgroundImage: `url(${type.image})` }}
                        />
                        <p className="mt-3 text-xs text-neutral-500">
                          Explore {type.name.toLowerCase()} in our collection
                        </p>
                      </article>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious
                aria-label="Previous property types"
                className="carousel-arrow carousel-prev"
              />
              <CarouselNext
                aria-label="Next property types"
                className="carousel-arrow carousel-next"
              />
              <CarouselDots count={propertyTypes.length} className="property-carousel-bullets" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Newsletter & Trending Destinations Section */}
      <section className="newsletter" id="destinations">
        <div className="newsletter-inner">
          <div className="newsletter-copy">
            <p className="section-eyebrow">A little inspiration, now and then</p>
            <h2>Stay in the know</h2>
            <p>
              Receive seasonal wellness journals, private sanctuary previews, and member-exclusive
              reservation privileges from Serene Stays.
            </p>
            <form
              className="subscribe-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (email.includes('@')) setSubscribed(true);
              }}
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Your email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button type="submit">{subscribed ? 'You’re in' : 'Subscribe'}</button>
            </form>
            <small>
              {subscribed
                ? 'Thanks for subscribing. Watch your inbox for seasonal inspiration.'
                : 'You can opt out anytime. We treat your inbox with mindful care.'}
            </small>
          </div>

          <div className="trending">
            <div className="trending-heading">
              <p className="section-eyebrow">Your next story</p>
              <h2>Trending destinations</h2>
              <p>Most sought-after escapes across our collection</p>
            </div>
            <div className="destination-grid">
              {trendingDestinations.map((destination, index) => (
                <Link
                  key={destination.name}
                  href={`/search?q=${encodeURIComponent(destination.query)}`}
                  className={`destination-tile destination-${index}`}
                  style={{
                    backgroundImage: `linear-gradient(0deg, rgba(13,13,13,0.52), rgba(13,13,13,0.14)), url(${destination.image})`,
                  }}
                >
                  <span>{destination.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="footer">
        <div className="footer-top">
          <Link className="brand" href="#top">
            <BrandMark className="h-6 w-6 text-white" />
            <span>
              {site.name}
              <span>.sanctuary</span>
            </span>
          </Link>
          <div className="footer-cta">
            <span>Ready to reserve your sanctuary?</span>
            <Link href="/search" className="checkout-btn">
              Check availability
            </Link>
          </div>
        </div>

        <div className="footer-rule" />

        <div className="footer-links">
          <form
            className="footer-newsletter"
            onSubmit={(event) => {
              event.preventDefault();
              setSubscribed(true);
            }}
          >
            <label htmlFor="footer-email">
              Subscribe to our
              <br />
              wellness newsletter
            </label>
            <div>
              <input
                id="footer-email"
                type="email"
                placeholder="Email address"
                aria-label="Email address"
              />
              <button type="submit" aria-label="Subscribe">
                ›
              </button>
            </div>
          </form>

          <div>
            <h3>Sanctuaries</h3>
            <Link href="/properties">All Stays</Link>
            <Link href="/properties/seaside-resort-spa">Coastal Resort</Link>
            <Link href="/properties/mountain-lodge-inn">Mountain Lodge</Link>
            <Link href="/search?q=Villa">Private Villas</Link>
          </div>

          <div>
            <h3>Experience</h3>
            <Link href="/spa">Spa Rituals</Link>
            <Link href="/packages">Wellness Packages</Link>
            <Link href="/experiences">Experience Paths</Link>
            <Link href="/#benefits">Guest Privileges</Link>
          </div>

          <div>
            <h3>Concierge</h3>
            <Link href="/terms">Terms &amp; Policies</Link>
            <Link href="/privacy">Privacy Notice</Link>
            <Link href="/account/bookings">My Bookings</Link>
            <a href={`mailto:${site.email}`}>Contact Concierge</a>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </div>
          <div className="socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              ◎
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              ♥
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              f
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
