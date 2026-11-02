import Link from 'next/link';
import { SpaMenu } from '@/components/sections/spa-menu';
import { buttonClass } from '@/components/ui/button';
import { Photo } from '@/components/ui/photo';
import { Section } from '@/components/ui/section';
import { photography } from '@/lib/content';

export function SpaSection() {
  return (
    <Section
      id="spa"
      tone="sage"
      folio="05"
      title="Rituals of stillness"
      description="Warm stone, eucalyptus air, and unhurried care. Every treatment is designed to slow the pace of the day."
      aside={
        <Link
          href="/spa"
          className="focus-ring text-brand hover:text-brand-deep mt-4 inline-flex text-sm underline-offset-4 hover:underline"
        >
          View the full menu →
        </Link>
      }
    >
      <div className="grid gap-10 md:grid-cols-12 md:gap-12">
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
          <p className="text-muted mt-4 text-xs">Open daily · 7am — 9pm · Garden level</p>
        </div>

        <div className="md:col-span-7">
          <p className="text-brand text-xs uppercase tracking-[0.16em]">The menu</p>
          <SpaMenu limit={2} className="mt-3" />

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href="#book-panel" className={buttonClass({ variant: 'secondary' })}>
              Reserve a ritual
            </a>
            <p className="text-muted text-xs">Treatments can be added to any stay.</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
