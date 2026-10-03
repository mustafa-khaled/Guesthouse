import Stripe from 'stripe';
import { env } from '../config/env';
import { BadRequestError } from '../common/errors/http.errors';

let client: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new BadRequestError('Payment processing is not configured');
  }

  if (!client) {
    client = new Stripe(env.STRIPE_SECRET_KEY);
  }

  return client;
}

export function resetStripeClient(): void {
  client = null;
}
