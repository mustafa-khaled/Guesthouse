'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button, buttonClass } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Photo } from '@/components/ui/photo';
import { Select } from '@/components/ui/select';
import { photography, site, spaTreatments, stats } from '@/lib/content';
import { cn } from '@/lib/utils';

const tabs = ['Stay', 'Spa', 'Packages'] as const;
type BookingTab = (typeof tabs)[number];

export function Hero() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BookingTab>('Stay');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function handleStaySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      adults: guests,
      children: '0',
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section id="book" className="border-line overflow-hidden border-b">
      <Container>
        <div className="grid items-center gap-10 pt-10 md:grid-cols-12 md:gap-8 md:pt-14 lg:pt-16">
          <div className="md:col-span-6 lg:col-span-5">
            <p className="hero-rise text-brand/40 tabular font-serif text-2xl leading-none">01</p>
            <h1 className="hero-rise hero-rise-delay-1 text-display mt-5 max-w-[11ch] text-balance">
              {site.tagline}
            </h1>
            <p className="hero-rise hero-rise-delay-2 text-muted mt-6 max-w-md text-pretty text-base leading-relaxed md:text-lg">
              A garden retreat for rest and renewal. Suites, spa rituals, and unhurried days in a
              warm sanctuary by the water.
            </p>

            <div className="hero-rise hero-rise-delay-3 mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button href="#book-panel">Check availability</Button>
              <a
                href="#suites"
                className="focus-ring text-brand hover:text-brand-deep group inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
              >
                Explore the suites
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                />
              </a>
            </div>
          </div>

          <div className="hero-media relative md:col-span-6 lg:col-span-7">
            <div className="bg-brand-soft relative aspect-[4/5] overflow-hidden rounded-[4px] sm:aspect-[16/12] md:aspect-[5/5.4] lg:aspect-[4/4.6]">
              <Photo
                src={photography.hero}
                alt="Sunlight falling across the garden pool at Serene Stays"
                fill
                priority
                sizes="(min-width: 1024px) 56vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(112deg,rgba(255,255,255,0.34),transparent_44%)] mix-blend-soft-light"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[rgb(34_46_37_/_0.42)] to-transparent"
              />
              <p className="absolute bottom-5 left-5 text-xs font-medium uppercase tracking-[0.18em] text-white/90">
                Arrival · {site.location}
              </p>
            </div>
          </div>
        </div>

        <div
          id="book-panel"
          className="hero-rise hero-rise-delay-4 border-line bg-raised mt-10 scroll-mt-28 rounded-[4px] border shadow-[var(--shadow-soft)] md:mt-14"
        >
          <div
            className="border-line flex overflow-x-auto border-b px-4 md:px-6"
            role="tablist"
            aria-label="Booking type"
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`booking-panel-${tab.toLowerCase()}`}
                id={`booking-tab-${tab.toLowerCase()}`}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'focus-ring -mb-px min-h-12 shrink-0 border-b-2 px-4 text-sm transition-colors duration-200 md:px-5',
                  activeTab === tab
                    ? 'border-brand text-ink font-medium'
                    : 'text-muted hover:text-ink border-transparent',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Stay' && (
            <form
              id="booking-panel-stay"
              role="tabpanel"
              aria-labelledby="booking-tab-stay"
              onSubmit={handleStaySubmit}
              className="p-4 md:p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.8fr_auto] lg:items-end">
                <div>
                  <Label htmlFor="hero-check-in">Check-in</Label>
                  <Input
                    id="hero-check-in"
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(event) => setCheckIn(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hero-check-out">Check-out</Label>
                  <Input
                    id="hero-check-out"
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(event) => setCheckOut(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hero-guests">Guests</Label>
                  <Select
                    id="hero-guests"
                    value={guests}
                    onChange={(event) => setGuests(event.target.value)}
                  >
                    <option value="1">1 guest</option>
                    <option value="2">2 guests</option>
                    <option value="3">3 guests</option>
                    <option value="4">4 guests</option>
                  </Select>
                </div>
                <Button type="submit" className="w-full lg:w-auto">
                  Check availability
                </Button>
              </div>
              <p className="text-muted mt-3 text-xs">
                Flexible cancellation until 48 hours before arrival.
              </p>
            </form>
          )}

          {activeTab === 'Spa' && (
            <div
              id="booking-panel-spa"
              role="tabpanel"
              aria-labelledby="booking-tab-spa"
              className="p-4 md:p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_0.8fr_auto] lg:items-end">
                <div>
                  <Label htmlFor="hero-treatment">Treatment</Label>
                  <Select id="hero-treatment" defaultValue={spaTreatments[0].name}>
                    {spaTreatments.map((treatment) => (
                      <option key={treatment.name} value={treatment.name}>
                        {treatment.name} · {treatment.duration}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hero-time">Preferred time</Label>
                  <Select id="hero-time" defaultValue="Morning">
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                  </Select>
                </div>
                <a href="#spa" className={buttonClass({ className: 'w-full lg:w-auto' })}>
                  Explore spa rituals
                </a>
              </div>
              <p className="text-muted mt-3 text-xs">
                Add a ritual to an existing stay, or reserve it on its own.
              </p>
            </div>
          )}

          {activeTab === 'Packages' && (
            <div
              id="booking-panel-packages"
              role="tabpanel"
              aria-labelledby="booking-tab-packages"
              className="p-4 md:p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <Label htmlFor="hero-package">Wellness package</Label>
                  <Select id="hero-package" defaultValue="Signature">
                    <option value="Essential">Essential · 3 nights</option>
                    <option value="Signature">Signature · 5 nights</option>
                    <option value="Transform">Transform · 7 nights</option>
                  </Select>
                </div>
                <a href="#packages" className={buttonClass({ className: 'w-full lg:w-auto' })}>
                  Compare packages
                </a>
              </div>
              <p className="text-muted mt-3 text-xs">
                All packages include accommodation, treatments, and concierge planning.
              </p>
            </div>
          )}
        </div>
      </Container>

      <div className="border-line mt-12 border-t md:mt-16">
        <Container className="px-0 sm:px-0 lg:px-0">
          <dl className="bg-line grid grid-cols-2 gap-px md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-surface px-5 py-6 md:px-8">
                <dt className="text-muted text-xs tracking-wide">{stat.label}</dt>
                <dd className="text-ink tabular mt-1 font-serif text-2xl leading-none md:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </div>
    </section>
  );
}
