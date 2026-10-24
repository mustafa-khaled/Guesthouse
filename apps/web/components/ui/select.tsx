import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          'focus-ring border-line bg-raised text-ink hover:border-line-strong focus:border-brand min-h-12 w-full cursor-pointer appearance-none rounded-[4px] border px-3.5 pr-10 text-sm transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-55',
          'aria-[invalid=true]:border-danger',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="text-muted pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
        strokeWidth={1.5}
      />
    </div>
  );
}
