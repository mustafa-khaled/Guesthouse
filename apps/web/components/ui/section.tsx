import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/container';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  variant?: 'default' | 'divider' | 'section';
  eyebrow?: string;
  title?: string;
  description?: string;
}

export function Section({
  id,
  variant = 'default',
  eyebrow,
  title,
  description,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-16 md:py-24',
        variant === 'divider' && 'border-matcha-border border-b',
        variant === 'section' && 'bg-matcha-section',
        className,
      )}
      {...props}
    >
      <Container>
        {eyebrow && (
          <p className="text-matcha-brand mb-4 text-xs font-medium uppercase tracking-[0.2em]">
            {eyebrow}
          </p>
        )}
        {title && (
          <h2 className="text-matcha-heading font-serif text-3xl font-medium md:text-4xl">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-matcha-body mt-4 max-w-2xl text-base leading-relaxed md:text-lg">
            {description}
          </p>
        )}
        {(title || description) && <div className="mt-10" />}
        {children}
      </Container>
    </section>
  );
}
