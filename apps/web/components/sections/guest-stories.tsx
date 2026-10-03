import { Card } from '@/components/ui/card';
import { Section } from '@/components/ui/section';
import { testimonials } from '@/lib/content';

export function GuestStories() {
  return (
    <Section
      variant="divider"
      eyebrow="Guest stories"
      title="Moments that stay with you"
      description="Real experiences from guests who found calm, connection, and renewal with us."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((story) => (
          <Card key={story.name} className="flex h-full flex-col">
            <blockquote className="text-matcha-heading flex-1 font-serif text-lg leading-relaxed">
              &ldquo;{story.quote}&rdquo;
            </blockquote>
            <footer className="border-matcha-border mt-6 border-t pt-4">
              <p className="text-matcha-heading text-sm font-medium">{story.name}</p>
              <p className="text-matcha-body text-sm">{story.detail}</p>
            </footer>
          </Card>
        ))}
      </div>
    </Section>
  );
}
