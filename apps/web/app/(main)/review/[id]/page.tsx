'use client';

import { use, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { reviewMutations } from '@/mutations/bookings.mutations';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '@/components/StarRating';

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookingId } = use(params);
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  const createMutation = useMutation({
    ...reviewMutations.create(),
    onSuccess: () => {
      toast.success('Thank you for your review');
      router.push('/account/reviews');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to submit review'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      bookingId,
      ratings: { overall: rating },
      title: title || undefined,
      text: text || undefined,
    });
  }

  return (
    <Container className="max-w-xl py-12 md:py-16">
      <PageHeader
        folio="—"
        title="Share your experience"
        description="A few honest lines help the next guest know what to expect — and help us keep improving."
      />

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <fieldset>
          <legend className="text-ink mb-2 block text-sm font-medium">Overall rating</legend>
          <StarRating rating={rating} onChange={setRating} interactive />
          <p className="text-muted mt-2 text-xs" aria-live="polite">
            {rating} of 5
          </p>
        </fieldset>

        <div>
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarise your stay"
          />
        </div>

        <div>
          <Label htmlFor="text">Your review</Label>
          <Textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tell us about your stay…"
            rows={6}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Submitting…' : 'Submit review'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/account/bookings')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  );
}
