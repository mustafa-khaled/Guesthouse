import { buttonClass } from '@/components/ui/button';
import { Photo } from '@/components/ui/photo';
import { Section } from '@/components/ui/section';
import { photography, spaTreatments } from '@/lib/content';

export function SpaSection() {
  return (
    <Section
      id="spa"
      tone="sage"
      folio="05"
      title="Rituals of stillness"
      description="Warm stone, eucalyptus air, and unhurried care. Every treatment is designed to slow the pace of the day."
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
          <ul className="border-line mt-3 border-t">
            {spaTreatments.map((treatment) => (
              <li key={treatment.name} className="border-line border-b py-6">
                <div className="flex items-baseline gap-4">
                  <h3 className="font-serif text-xl leading-tight md:text-2xl">{treatment.name}</h3>
                  <span aria-hidden className="border-line mb-1.5 flex-1 border-b border-dotted" />
                  <span className="text-muted tabular shrink-0 text-xs">{treatment.duration}</span>
                  <span className="tabular w-16 shrink-0 text-right font-serif text-xl">
                    {treatment.price}
                  </span>
                </div>
                <p className="text-muted mt-2 max-w-md text-sm leading-relaxed">
                  {treatment.description}
                </p>
                <p className="text-brand mt-3 text-[11px] uppercase tracking-[0.16em]">
                  {treatment.category}
                </p>
              </li>
            ))}
          </ul>

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
