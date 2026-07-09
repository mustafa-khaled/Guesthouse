import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import { experiencePaths } from '@/lib/content';

export function ExperiencePaths() {
  return (
    <Section
      id="experiences"
      variant="divider"
      eyebrow="Experience paths"
      title="What are you seeking?"
      description="Choose your intention — we'll guide you to the suites, rituals, and packages that fit your escape."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {experiencePaths.map((path) => (
          <Card key={path.title} className="flex h-full flex-col">
            <h3 className="text-matcha-heading font-serif text-2xl font-medium">{path.title}</h3>
            <p className="text-matcha-body mt-3 flex-1 leading-relaxed">{path.description}</p>
            <Button variant="ghost" href={path.href} className="mt-6 self-start">
              Explore →
            </Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}
