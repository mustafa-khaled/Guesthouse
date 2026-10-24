import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'focus-ring ease-soft inline-flex items-center justify-center gap-2 rounded-[4px] text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-200 disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-surface-raised hover:bg-brand-deep',
        default: 'bg-brand text-surface-raised hover:bg-brand-deep',
        secondary: 'border-line text-ink hover:border-brand hover:text-brand border bg-transparent',
        outline: 'border-line text-ink hover:border-brand hover:text-brand border bg-transparent',
        ghost: 'text-brand hover:bg-brand-soft/60',
        destructive: 'bg-danger text-surface-raised hover:bg-danger/90',
        link: 'text-brand hover:text-brand-deep h-auto min-h-0 rounded-none px-0 py-0 underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-12 px-6',
        sm: 'min-h-10 px-4 text-xs',
        lg: 'min-h-14 px-8 text-base',
        icon: 'h-12 w-12 shrink-0 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

export function buttonClass(
  options?: VariantProps<typeof buttonVariants> & { className?: string },
) {
  const { className, ...variants } = options ?? {};
  return cn(buttonVariants(variants), className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  href?: string;
}

export function Button({ className, variant, size, href, type, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    const { disabled, ...anchorProps } = props;
    void disabled;
    return (
      <Link
        href={href}
        className={classes}
        {...(anchorProps as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>)}
      />
    );
  }

  return <button type={type ?? 'button'} className={classes} {...props} />;
}
