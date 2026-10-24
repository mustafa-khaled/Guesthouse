import { cn } from '@/lib/utils';

const variants = {
  default: 'border-line bg-raised text-ink',
  neutral: 'border-line bg-raised text-ink',
  success: 'border-success/20 bg-success-tint text-success',
  warning: 'border-warning/20 bg-warning-tint text-warning',
  danger: 'border-danger/20 bg-danger-tint text-danger',
  info: 'border-info/20 bg-info-tint text-info',
  brand: 'border-brand/15 bg-brand-soft text-brand',
} as const;

export type BadgeVariant = keyof typeof variants;

export function Badge({
  className,
  variant = 'default',
  dot = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[3px] border px-2 py-0.5 text-[11px] font-medium leading-5 tracking-[0.01em]',
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}
