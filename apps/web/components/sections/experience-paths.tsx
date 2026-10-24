import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Photo } from '@/components/ui/photo';
import { Section } from '@/components/ui/section';
import { experiencePaths } from '@/lib/content';
import { cn } from '@/lib/utils';

export function ExperiencePaths() {
  return (
    <Section
      id="experiences"
      folio="02"
      title="What are you seeking?"
      description="Choose an intention, and we will guide you to the suites, rituals, and packages that fit your escape."
    >
      <div className="grid gap-14 md:grid-cols-12 md:gap-8">
        {experiencePaths.map((path, index) => (
          <article
            key={path.title}
            className={cn('group', index === 0 ? 'md:col-span-7' : 'md:col-span-5 md:mt-24')}
          >
            <Link href={path.href} className="focus-ring block">
              <div className="bg-brand-soft relative aspect-[4/3] overflow-hidden rounded-[4px]">
                <Photo
                  src={path.image}
                  alt="A quiet moment at Serene Stays"
                  fill
                  sizes={
                    index === 0
                      ? '(min-width: 768px) 58vw, 100vw'
                      : '(min-width: 768px) 42vw, 100vw'
                  }
                  className="ease-soft object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>

              <div className="border-line mt-5 flex items-start justify-between gap-4 border-t pt-4">
                <div>
                  <p className="text-muted text-xs tracking-wide">Path {path.index}</p>
                  <h3 className="mt-1 font-serif text-2xl md:text-3xl">{path.title}</h3>
                </div>
                <ArrowUpRight
                  aria-hidden
                  className="text-brand mt-1 h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={1.5}
                />
              </div>

              <p className="text-muted mt-3 max-w-md text-sm leading-relaxed">{path.description}</p>
              <p className="text-brand mt-4 text-xs uppercase tracking-[0.16em]">{path.meta}</p>
            </Link>
          </article>
        ))}
      </div>
    </Section>
  );
}
