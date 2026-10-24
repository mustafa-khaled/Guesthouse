import { cn } from '@/lib/utils';

export default function Spinner({ className }: { className?: string }) {
  return (
    <div role="status" className="flex items-center justify-center p-4">
      <div
        aria-hidden
        className={cn(
          'border-brand/20 border-t-brand h-8 w-8 animate-spin rounded-full border-2',
          className,
        )}
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}
