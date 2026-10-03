import { Card } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import { trustItems } from '@/lib/content';

export function TrustStrip() {
  return (
    <Section variant="divider" className="py-12 md:py-16">
      <div className="grid gap-6 md:grid-cols-3">
        {trustItems.map((item) => (
          <Card key={item.title} tint className="text-center md:text-left">
            <h3 className="text-matcha-heading font-serif text-lg font-medium">{item.title}</h3>
            <p className="text-matcha-body mt-2 text-sm leading-relaxed">{item.description}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
