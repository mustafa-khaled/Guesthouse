import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import { spaTreatments } from '@/lib/content';

export function SpaSection() {
  return (
    <Section
      id="spa"
      variant="section"
      eyebrow="Garden spa"
      title="Rituals of stillness"
      description="Warm stone, eucalyptus air, and unhurried care — every treatment is designed to restore."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {spaTreatments.map((treatment) => (
          <Card key={treatment.name} className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="border-matcha-border bg-matcha-white text-matcha-brand rounded-[4px] border px-3 py-1 text-xs font-medium">
                {treatment.duration}
              </span>
              <span className="text-matcha-heading text-sm font-medium">{treatment.price}</span>
            </div>
            <h3 className="text-matcha-heading font-serif text-xl font-medium">{treatment.name}</h3>
            <p className="text-matcha-body mt-3 flex-1 text-sm leading-relaxed">
              {treatment.description}
            </p>
            <Button variant="ghost" href="#book" className="mt-6 self-start">
              Reserve →
            </Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}
