import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/container';

type SectionTone = 'surface' | 'sage';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  tone?: SectionTone;
  divider?: boolean;
  folio?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  aside?: React.ReactNode;
  containerClassName?: string;
}

export function Section({
  id,
  tone = 'surface',
  divider = false,
  folio,
  eyebrow,
  title,
  description,
  aside,
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  const hasHeader = Boolean(folio || eyebrow || title || description || aside);

  return (
    <section
      id={id}
      className={cn(
        'py-20 md:py-28',
        tone === 'sage' && 'bg-brand-soft',
        divider && 'border-line border-b',
        className,
      )}
      {...props}
    >
      <Container className={containerClassName}>
        {hasHeader && (
          <header className="border-line border-t pt-6">
            <div className="grid gap-6 md:grid-cols-12 md:gap-8">
              <div className="md:col-span-2">
                {folio && (
                  <p
                    aria-hidden
                    className="text-brand/35 tabular font-serif text-4xl leading-none md:text-5xl"
                  >
                    {folio}
                  </p>
                )}
                {eyebrow && (
                  <p className="text-brand mt-3 text-xs font-medium uppercase tracking-[0.18em]">
                    {eyebrow}
                  </p>
                )}
              </div>

              <div className={cn('md:col-span-6', !folio && !eyebrow && 'md:col-start-1')}>
                {title && <h2 className="text-title text-balance">{title}</h2>}
              </div>

              <div className={cn('md:col-span-4 md:pt-2', !folio && !eyebrow && 'md:col-start-8')}>
                {description && (
                  <p className="text-muted text-pretty text-base leading-relaxed md:text-[17px]">
                    {description}
                  </p>
                )}
                {aside}
              </div>
            </div>
          </header>
        )}

        <div className={cn(hasHeader && 'mt-12 md:mt-16')}>{children}</div>
      </Container>
    </section>
  );
}
