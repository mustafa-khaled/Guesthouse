import { cn } from '@/lib/utils'
import { Container } from '@/components/ui/container'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  variant?: 'default' | 'divider' | 'section'
  eyebrow?: string
  title?: string
  description?: string
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
        variant === 'divider' && 'border-b border-matcha-border',
        variant === 'section' && 'bg-matcha-section',
        className,
      )}
      {...props}
    >
      <Container>
        {eyebrow && (
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-matcha-brand">
            {eyebrow}
          </p>
        )}
        {title && (
          <h2 className="font-serif text-3xl font-medium text-matcha-heading md:text-4xl">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-matcha-body md:text-lg">
            {description}
          </p>
        )}
        {(title || description) && <div className="mt-10" />}
        {children}
      </Container>
    </section>
  )
}
