'use client';

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CreditCard } from 'lucide-react';
import { billingQueries } from '@/features/billing/queries';
import { billingMutations } from '@/features/billing/mutations';
import { CreditCardForm } from '@/features/billing/components/credit-card-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import Spinner from '@/components/Spinner';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/constants';
import { getId } from '@/lib/utils';
import type { SavedPaymentMethod } from '@/types';

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

export function BillingClient() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);

  const methodsQuery = useQuery(billingQueries.paymentMethods());
  const setupQuery = useQuery({
    ...billingQueries.setupIntent(),
    enabled: isAdding,
  });

  const saveMutation = useMutation({
    ...billingMutations.saveCard(),
    onSuccess: () => {
      toast.success('Card saved');
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not save card'),
  });

  const defaultMutation = useMutation({
    ...billingMutations.setDefault(),
    onSuccess: () => {
      toast.success('Default card updated');
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Update failed'),
  });

  const removeMutation = useMutation({
    ...billingMutations.remove(),
    onSuccess: () => {
      toast.success('Card removed');
      queryClient.invalidateQueries({ queryKey: ['billing'] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Remove failed'),
  });

  if (methodsQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const wallet = methodsQuery.data;
  const cards = wallet?.paymentMethods ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Saved cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cards.length === 0 ? (
            <EmptyState
              icon={<CreditCard />}
              title="No cards saved"
              description="Add a card once and checkout becomes a single quiet step."
            />
          ) : (
            <ul className="border-line divide-line divide-y border-y">
              {cards.map((card: SavedPaymentMethod) => {
                const id = getId(card);
                return (
                  <li key={id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="flex items-center gap-3">
                      <span className="border-line text-brand flex h-9 w-14 items-center justify-center rounded-[3px] border text-[10px] uppercase tracking-[0.1em]">
                        {card.brand}
                      </span>
                      <div>
                        <p className="text-ink tabular text-sm">•••• {card.last4}</p>
                        <p className="text-muted tabular mt-0.5 text-xs">
                          Expires {String(card.expMonth).padStart(2, '0')}/{card.expYear}
                          {card.isDefault ? ' · Default' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!card.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={defaultMutation.isPending}
                          onClick={() => defaultMutation.mutate(id)}
                        >
                          Set default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:bg-danger-tint"
                        disabled={removeMutation.isPending}
                        onClick={() => {
                          if (window.confirm('Remove this card?')) {
                            removeMutation.mutate(id);
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {wallet && !wallet.canAddPaymentMethod ? (
            <p className="text-muted text-sm">Remove a card before adding another one.</p>
          ) : (
            <Button disabled={isAdding} onClick={() => setIsAdding(true)}>
              Add card
            </Button>
          )}
        </CardContent>
      </Card>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add a card</CardTitle>
          </CardHeader>
          <CardContent>
            {!stripePromise ? (
              <p className="text-red-600">Card payments are not configured.</p>
            ) : setupQuery.isLoading ? (
              <Spinner />
            ) : setupQuery.data?.clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: setupQuery.data.clientSecret,
                  appearance: { variables: { colorPrimary: '#314535', borderRadius: '4px' } },
                }}
              >
                <CreditCardForm
                  clientSecret={setupQuery.data.clientSecret}
                  onReady={async (paymentMethodId) => {
                    await saveMutation.mutateAsync(paymentMethodId);
                  }}
                  onError={(message) => toast.error(message)}
                />
              </Elements>
            ) : (
              <p className="text-red-600">Could not start card setup.</p>
            )}
            <Button className="mt-4" variant="ghost" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
