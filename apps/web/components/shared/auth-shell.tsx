import { Photo } from '@/components/ui/photo';
import { Container } from '@/components/ui/container';
import { photography } from '@/lib/content';

export interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  image?: string;
  quote?: string;
  quoteBy?: string;
}

export function AuthShell({
  title,
  description,
  children,
  footer,
  image = photography.arrival,
  quote = 'The kind of place that recalibrates you. I slept deeper than I have in months.',
  quoteBy = 'Marcus T. · Horizon Suite',
}: AuthShellProps) {
  return (
    <div className="border-line border-b">
      <Container className="px-0 sm:px-0 lg:px-0">
        <div className="grid min-h-[72vh] md:grid-cols-12">
          <div className="order-2 flex items-center px-5 py-14 sm:px-8 md:order-1 md:col-span-6 md:px-10 lg:col-span-5 lg:px-14">
            <div className="w-full max-w-sm">
              <h1 className="text-title text-balance">{title}</h1>
              <p className="text-muted mt-3 text-pretty text-sm leading-relaxed">{description}</p>
              <div className="mt-8">{children}</div>
              {footer && <div className="border-line mt-8 border-t pt-5">{footer}</div>}
            </div>
          </div>

          <div className="relative order-1 hidden overflow-hidden md:order-2 md:col-span-6 md:block lg:col-span-7">
            <Photo
              src={image}
              alt="Morning light across linen in a Serene Stays suite"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 0vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-[rgb(34_46_37_/_0.3)]" />
            <figure className="absolute inset-x-10 bottom-10">
              <blockquote className="text-pretty font-serif text-2xl leading-snug text-white lg:text-3xl">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-xs text-white/75">{quoteBy}</figcaption>
            </figure>
          </div>
        </div>
      </Container>
    </div>
  );
}
