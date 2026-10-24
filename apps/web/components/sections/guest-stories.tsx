import { Section } from '@/components/ui/section';
import { testimonials } from '@/lib/content';

function initials(name: string) {
  return name
    .replace(/&/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function GuestStories() {
  const [lead, ...rest] = testimonials;

  return (
    <Section
      id="stories"
      folio="06"
      title="Moments that stay with you"
      description="Real experiences from guests who found calm, connection, and a little more room to breathe."
    >
      <div className="grid gap-12 md:grid-cols-12 md:gap-10">
        <figure className="md:col-span-7">
          <blockquote className="text-pretty font-serif text-3xl leading-[1.25] md:text-4xl">
            &ldquo;{lead.quote}&rdquo;
          </blockquote>
          <figcaption className="border-line mt-8 flex items-center gap-3 border-t pt-5">
            <span className="bg-brand-soft text-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-sm">
              {initials(lead.name)}
            </span>
            <span>
              <cite className="text-ink block text-sm not-italic">{lead.name}</cite>
              <span className="text-muted block text-xs">{lead.detail}</span>
            </span>
          </figcaption>
        </figure>

        <div className="border-line space-y-8 md:col-span-5 md:border-l md:pl-10">
          {rest.map((story) => (
            <figure key={story.name} className="border-line border-t pt-6">
              <blockquote className="text-pretty text-base leading-relaxed">
                &ldquo;{story.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4">
                <cite className="text-ink block text-sm not-italic">{story.name}</cite>
                <span className="text-muted block text-xs">{story.detail}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  );
}
