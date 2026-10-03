'use client';

import { use, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { reviewMutations } from '@/mutations/bookings.mutations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
      toast.success('Thank you for your review!');
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
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Share your experience</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Overall rating</Label>
              <div className="mt-2">
                <StarRating rating={rating} onChange={setRating} interactive />
              </div>
            </div>
            <div>
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your stay"
              />
            </div>
            <div>
              <Label htmlFor="text">Your review</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tell us about your stay..."
                rows={5}
              />
            </div>
            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? 'Submitting...' : 'Submit review'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
