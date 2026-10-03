'use client';

import { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

interface CreditCardFormProps {
  clientSecret: string;
  onReady: (paymentMethodId: string) => Promise<void>;
  onError: (message: string) => void;
}

export function CreditCardForm({ clientSecret, onReady, onError }: CreditCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);
    if (!card) {
      onError('Card field is not ready');
      return;
    }

    setIsSubmitting(true);

    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card },
    });

    if (result.error) {
      onError(result.error.message ?? 'Could not save this card');
      setIsSubmitting(false);
      return;
    }

    const paymentMethodId =
      typeof result.setupIntent.payment_method === 'string'
        ? result.setupIntent.payment_method
        : result.setupIntent.payment_method?.id;

    if (!paymentMethodId) {
      onError('Stripe did not return a payment method');
      setIsSubmitting(false);
      return;
    }

    try {
      await onReady(paymentMethodId);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Could not save this card');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded border border-[var(--matcha-border)] bg-white px-3 py-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#2B3A2E',
                fontFamily: 'Noto Sans, sans-serif',
                '::placeholder': { color: '#4A5547' },
              },
            },
          }}
        />
      </div>
      <Button type="submit" className="w-full" disabled={!stripe || isSubmitting}>
        {isSubmitting ? 'Saving card...' : 'Save card'}
      </Button>
    </form>
  );
}
