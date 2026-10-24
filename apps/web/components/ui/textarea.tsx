import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'focus-ring border-line bg-raised text-ink placeholder:text-muted/70 hover:border-line-strong focus:border-brand min-h-28 w-full rounded-[4px] border px-3.5 py-3 text-sm transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55',
        'aria-[invalid=true]:border-danger',
        className,
      )}
      {...props}
    />
  );
}
