import { Container } from '@/components/ui/container';
import { trustItems } from '@/lib/content';
import { cn } from '@/lib/utils';

export function TrustStrip() {
  return (
    <section className="border-line border-y">
      <Container className="px-0 sm:px-0 lg:px-0">
        <dl className="grid md:grid-cols-3">
          {trustItems.map((item, index) => (
            <div
              key={item.title}
              className={cn(
                'px-5 py-10 sm:px-8 md:px-8',
                index > 0 && 'border-line border-t md:border-l md:border-t-0',
              )}
            >
              <dt className="font-serif text-xl leading-snug">{item.title}</dt>
              <dd className="text-muted mt-2 max-w-sm text-sm leading-relaxed">
                {item.description}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
