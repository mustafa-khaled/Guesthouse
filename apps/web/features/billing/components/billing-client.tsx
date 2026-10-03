'use client';

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { billingQueries } from '@/features/billing/queries';
import { billingMutations } from '@/features/billing/mutations';
import { CreditCardForm } from '@/features/billing/components/credit-card-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            <p className="text-[var(--matcha-body)]">No cards saved yet.</p>
          ) : (
            <ul className="space-y-3">
              {cards.map((card: SavedPaymentMethod) => {
                const id = getId(card);
                return (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded border border-[var(--matcha-border)] bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-medium capitalize text-[var(--matcha-heading)]">
                        {card.brand} ending in {card.last4}
                      </p>
                      <p className="text-sm text-[var(--matcha-body)]">
                        Expires {String(card.expMonth).padStart(2, '0')}/{card.expYear}
                        {card.isDefault ? ' · Default' : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!card.isDefault && (
                        <Button
                          variant="outline"
                          disabled={defaultMutation.isPending}
                          onClick={() => defaultMutation.mutate(id)}
                        >
                          Set default
                        </Button>
                      )}
                      <Button
                        variant="outline"
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
            <p className="text-sm text-[var(--matcha-body)]">
              Remove a card before adding another one.
            </p>
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
