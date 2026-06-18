"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { stats, site } from "@/lib/content";
import { cn } from "@/lib/utils";

const bookingTabs = ["Stay", "Spa", "Packages"] as const;
type BookingTab = (typeof bookingTabs)[number];

export function Hero() {
  const [activeTab, setActiveTab] = useState<BookingTab>("Stay");

  return (
    <section id="book" className="border-b border-matcha-border py-16 md:py-24">
      <Container className="flex flex-col items-center text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-matcha-brand">
          Luxury retreat & wellness sanctuary
        </p>
        <h1 className="max-w-3xl font-serif text-4xl font-medium leading-tight text-matcha-heading md:text-5xl lg:text-6xl">
          {site.tagline}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-matcha-body md:text-lg">
          Arrive as you are. Leave renewed. Discover suites, garden spa rituals, and
          curated wellness packages in a warm sanctuary designed for{" "}
          <span className="font-medium text-matcha-heading">rest and renewal</span>.
        </p>

        <div className="mt-12 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} tint className="px-4 py-5 text-center md:px-5">
              <p className="font-serif text-2xl font-medium text-matcha-brand md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-matcha-body md:text-sm">{stat.label}</p>
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
                  "min-h-12 rounded-[4px] px-5 text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "bg-matcha-brand text-matcha-white"
                    : "border border-matcha-border bg-matcha-white text-matcha-body hover:border-matcha-brand hover:text-matcha-brand",
                )}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div role="tabpanel" className="space-y-4">
            {activeTab === "Stay" && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-matcha-heading">
                      Check-in
                    </span>
                    <input
                      type="date"
                      className="min-h-12 w-full rounded-[4px] border border-matcha-border bg-matcha-white px-4 text-sm text-matcha-body"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-matcha-heading">
                      Guests
                    </span>
                    <select className="min-h-12 w-full rounded-[4px] border border-matcha-border bg-matcha-white px-4 text-sm text-matcha-body">
                      <option>1 guest</option>
                      <option>2 guests</option>
                      <option>3 guests</option>
                      <option>4+ guests</option>
                    </select>
                  </label>
                </div>
                <p className="text-sm text-matcha-body">
                  Flexible cancellation until 48 hours before arrival.
                </p>
                <Button className="w-full md:w-auto">Check availability</Button>
              </>
            )}

            {activeTab === "Spa" && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-matcha-heading">
                      Treatment
                    </span>
                    <select className="min-h-12 w-full rounded-[4px] border border-matcha-border bg-matcha-white px-4 text-sm text-matcha-body">
                      <option>Garden Stone Massage</option>
                      <option>Eucalyptus Renewal</option>
                      <option>Sunrise Yoga & Tea</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-matcha-heading">
                      Preferred time
                    </span>
                    <select className="min-h-12 w-full rounded-[4px] border border-matcha-border bg-matcha-white px-4 text-sm text-matcha-body">
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                    </select>
                  </label>
                </div>
                <p className="text-sm text-matcha-body">
                  Reserve your ritual — add to an existing stay or book standalone.
                </p>
                <Button className="w-full md:w-auto">Reserve your ritual</Button>
              </>
            )}

            {activeTab === "Packages" && (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-matcha-heading">
                    Wellness package
                  </span>
                  <select className="min-h-12 w-full rounded-[4px] border border-matcha-border bg-matcha-white px-4 text-sm text-matcha-body">
                    <option>Essential — 3 nights</option>
                    <option>Signature — 5 nights (recommended)</option>
                    <option>Transform — 7 nights</option>
                  </select>
                </label>
                <p className="text-sm text-matcha-body">
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
