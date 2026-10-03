'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { stats, site } from '@/lib/content';
import { cn } from '@/lib/utils';

const bookingTabs = ['Stay', 'Spa', 'Packages'] as const;
type BookingTab = (typeof bookingTabs)[number];

export function Hero() {
  const [activeTab, setActiveTab] = useState<BookingTab>('Stay');

  return (
    <section id="book" className="border-matcha-border border-b py-16 md:py-24">
      <Container className="flex flex-col items-center text-center">
        <p className="text-matcha-brand mb-4 text-xs font-medium uppercase tracking-[0.2em]">
          Luxury retreat & wellness sanctuary
        </p>
        <h1 className="text-matcha-heading max-w-3xl font-serif text-4xl font-medium leading-tight md:text-5xl lg:text-6xl">
          {site.tagline}
        </h1>
        <p className="text-matcha-body mt-6 max-w-2xl text-base leading-relaxed md:text-lg">
          Arrive as you are. Leave renewed. Discover suites, garden spa rituals, and curated
          wellness packages in a warm sanctuary designed for{' '}
          <span className="text-matcha-heading font-medium">rest and renewal</span>.
        </p>

        <div className="mt-12 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} tint className="px-4 py-5 text-center md:px-5">
              <p className="text-matcha-brand font-serif text-2xl font-medium md:text-3xl">
                {stat.value}
              </p>
              <p className="text-matcha-body mt-1 text-xs md:text-sm">{stat.label}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-10 w-full max-w-3xl text-left">
          <div
            className="mb-6 flex flex-wrap justify-center gap-2"
            role="tablist"
            aria-label="Booking type"
          >
            {bookingTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={cn(
                  'min-h-12 rounded-[4px] px-5 text-sm font-medium transition-colors',
                  activeTab === tab
                    ? 'bg-matcha-brand text-matcha-white'
                    : 'border-matcha-border bg-matcha-white text-matcha-body hover:border-matcha-brand hover:text-matcha-brand border',
                )}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div role="tabpanel" className="space-y-4">
            {activeTab === 'Stay' && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-matcha-heading mb-2 block text-sm font-medium">
                      Check-in
                    </span>
                    <input
                      type="date"
                      className="border-matcha-border bg-matcha-white text-matcha-body min-h-12 w-full rounded-[4px] border px-4 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="text-matcha-heading mb-2 block text-sm font-medium">
                      Guests
                    </span>
                    <select className="border-matcha-border bg-matcha-white text-matcha-body min-h-12 w-full rounded-[4px] border px-4 text-sm">
                      <option>1 guest</option>
                      <option>2 guests</option>
                      <option>3 guests</option>
                      <option>4+ guests</option>
                    </select>
                  </label>
                </div>
                <p className="text-matcha-body text-sm">
                  Flexible cancellation until 48 hours before arrival.
                </p>
                <Button className="w-full md:w-auto">Check availability</Button>
              </>
            )}

            {activeTab === 'Spa' && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-matcha-heading mb-2 block text-sm font-medium">
                      Treatment
                    </span>
                    <select className="border-matcha-border bg-matcha-white text-matcha-body min-h-12 w-full rounded-[4px] border px-4 text-sm">
                      <option>Garden Stone Massage</option>
                      <option>Eucalyptus Renewal</option>
                      <option>Sunrise Yoga & Tea</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-matcha-heading mb-2 block text-sm font-medium">
                      Preferred time
                    </span>
                    <select className="border-matcha-border bg-matcha-white text-matcha-body min-h-12 w-full rounded-[4px] border px-4 text-sm">
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                    </select>
                  </label>
                </div>
                <p className="text-matcha-body text-sm">
                  Reserve your ritual — add to an existing stay or book standalone.
                </p>
                <Button className="w-full md:w-auto">Reserve your ritual</Button>
              </>
            )}

            {activeTab === 'Packages' && (
              <>
                <label className="block">
                  <span className="text-matcha-heading mb-2 block text-sm font-medium">
                    Wellness package
                  </span>
                  <select className="border-matcha-border bg-matcha-white text-matcha-body min-h-12 w-full rounded-[4px] border px-4 text-sm">
                    <option>Essential — 3 nights</option>
                    <option>Signature — 5 nights (recommended)</option>
                    <option>Transform — 7 nights</option>
                  </select>
                </label>
                <p className="text-matcha-body text-sm">
                  All packages include accommodations, treatments, and concierge planning.
                </p>
                <Button className="w-full md:w-auto">Explore packages</Button>
              </>
            )}
          </div>
        </Card>
      </Container>
    </section>
  );
}
