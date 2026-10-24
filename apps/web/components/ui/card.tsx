import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva('rounded-[4px] border', {
  variants: {
    tone: {
      paper: 'border-line bg-raised',
      tint: 'border-line bg-brand-soft/60',
      sage: 'border-line bg-brand-soft',
      plain: 'border-line bg-transparent',
    },
    elevation: {
      none: '',
      soft: 'shadow-[var(--shadow-soft)]',
    },
  },
  defaultVariants: { tone: 'paper', elevation: 'soft' },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  /** Legacy prop kept for older screens. */
  tint?: boolean;
}

export function Card({ className, tone, elevation, tint, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ tone: tint ? 'tint' : tone, elevation }), className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-2 p-6 pb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-ink font-serif text-xl leading-snug', className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-muted text-sm leading-relaxed', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center gap-3 p-6 pt-0', className)} {...props} />;
}
