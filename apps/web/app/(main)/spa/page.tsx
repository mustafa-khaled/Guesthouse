import type { Metadata } from 'next';
import { SpaMenu } from '@/components/sections/spa-menu';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { Photo } from '@/components/ui/photo';
import { photography } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Garden spa',
  description:
    'Warm stone, eucalyptus air, and unhurried care. The garden spa menu at Serene Stays — body rituals, garden treatments, and quiet hours.',
  alternates: { canonical: '/spa' },
};

const ritualDay = [
  {
    step: 'Arrive',
    detail:
      'Come fifteen minutes early. Tea is poured on the garden deck while your treatment room warms.',
  },
  {
    step: 'Unwind',
    detail:
      'Your therapist starts with breath and pressure, never a sales pitch. Tell us what to avoid and we adjust.',
  },
  {
    step: 'Settle',
    detail:
      'Afterwards, rest in the courtyard for as long as you like. No one hurries the room back.',
  },
];

export default function SpaPage() {
  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        folio="02"
        title="The garden spa"
        description="Warm stone, eucalyptus air, and unhurried care. Every treatment is designed to slow the pace of the day."
      />

      <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[4px]">
            <Photo
              src={photography.spa}
              alt="Warm spa stones, folded linen, and eucalyptus at the garden spa"
              fill
              sizes="(min-width: 768px) 38vw, 100vw"
              className="object-cover"
            />
          </div>

          <dl className="border-line mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 text-sm">
            <div>
              <dt className="text-muted text-xs uppercase tracking-[0.14em]">Hours</dt>
              <dd className="mt-1">Daily · 7am — 9pm</dd>
            </div>
            <div>
              <dt className="text-muted text-xs uppercase tracking-[0.14em]">Location</dt>
              <dd className="mt-1">Garden level</dd>
            </div>
          </dl>
        </div>

        <div className="md:col-span-7">
          <h2 className="text-brand text-xs uppercase tracking-[0.16em]">The menu</h2>
          <SpaMenu className="mt-3" />

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href="/search">Reserve a ritual</Button>
            <p className="text-muted text-xs">Treatments can be added to any stay.</p>
          </div>
        </div>
      </div>

      <section
        aria-labelledby="ritual-day"
        className="border-line mt-20 border-t pt-10 md:mt-24 md:pt-12"
      >
        <h2 id="ritual-day" className="text-heading">
          A ritual day
        </h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
          {ritualDay.map((item, index) => (
            <li key={item.step}>
              <p aria-hidden className="text-brand/35 tabular font-serif text-3xl leading-none">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-3 font-serif text-xl">{item.step}</h3>
              <p className="text-muted mt-2 text-sm leading-relaxed">{item.detail}</p>
            </li>
          ))}
        </ol>
      </section>
    </Container>
  );
}
