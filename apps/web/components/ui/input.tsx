import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'focus-ring border-line bg-raised text-ink placeholder:text-muted/70 hover:border-line-strong focus:border-brand min-h-12 w-full rounded-[4px] border px-3.5 text-sm transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55',
        'aria-[invalid=true]:border-danger aria-[invalid=true]:focus:border-danger',
        '[color-scheme:light]',
        className,
      )}
      {...props}
    />
  );
}
