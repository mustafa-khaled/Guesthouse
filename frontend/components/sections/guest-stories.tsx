import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { testimonials } from "@/lib/content";

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
            <blockquote className="flex-1 font-serif text-lg leading-relaxed text-matcha-heading">
              &ldquo;{story.quote}&rdquo;
            </blockquote>
            <footer className="mt-6 border-t border-matcha-border pt-4">
              <p className="text-sm font-medium text-matcha-heading">{story.name}</p>
              <p className="text-sm text-matcha-body">{story.detail}</p>
            </footer>
          </Card>
        ))}
      </div>
    </Section>
  );
}
