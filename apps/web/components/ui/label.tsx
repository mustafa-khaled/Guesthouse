import { cn } from '@/lib/utils';

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('text-ink mb-2 block text-sm font-medium leading-none', className)}
      {...props}
    />
  );
}
