'use client';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultAdults?: number;
  defaultChildren?: number;
  action?: string;
  /** Stack the fields — for narrow rails and mobile sheets. */
  compact?: boolean;
}

export function SearchBar({
  defaultCheckIn = '',
  defaultCheckOut = '',
  defaultAdults = 2,
  defaultChildren = 0,
  action = '/search',
  compact = false,
}: SearchBarProps) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    for (const [key, value] of fd.entries()) {
      if (value) params.set(key, String(value));
    }
    router.push(`${action}?${params.toString()}`);
  }

  return (
    <Card className="p-5 md:p-6">
      <form
        onSubmit={handleSubmit}
        className={cn(
          'grid gap-4',
          compact
            ? 'grid-cols-1'
            : 'sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.65fr_0.65fr_auto] lg:items-end',
        )}
      >
        <div>
          <Label htmlFor="checkIn">Check-in</Label>
          <Input id="checkIn" name="checkIn" type="date" defaultValue={defaultCheckIn} required />
        </div>
        <div>
          <Label htmlFor="checkOut">Check-out</Label>
          <Input
            id="checkOut"
            name="checkOut"
            type="date"
            defaultValue={defaultCheckOut}
            required
          />
        </div>
        <div>
          <Label htmlFor="adults">Adults</Label>
          <Input id="adults" name="adults" type="number" min={1} defaultValue={defaultAdults} />
        </div>
        <div>
          <Label htmlFor="children">Children</Label>
          <Input
            id="children"
            name="children"
            type="number"
            min={0}
            defaultValue={defaultChildren}
          />
        </div>
        <div className={cn(compact ? '' : 'flex items-end')}>
          <Button type="submit" className="w-full">
            <Search aria-hidden className="h-4 w-4" strokeWidth={1.5} />
            Search
          </Button>
        </div>
      </form>
      <p className="text-muted mt-3 text-xs">Best rates when you book directly with us.</p>
    </Card>
  );
}
