'use client'

import { useAuth } from '@/hooks/useAuth'
import { useAlert } from '@/hooks/useAlert'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/constants'
import { clientFetch } from '@/lib/api'

const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null

interface BookTourButtonProps {
  tourId: string
}

export default function BookTourButton({ tourId }: BookTourButtonProps) {
  const { user } = useAuth()
  const { showAlert } = useAlert()
  const router = useRouter()

  const handleBook = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const data = await clientFetch<{ session: { id: string } }>(
        `/stripe/checkout-session/${tourId}`,
      )

      const stripe = await stripePromise
      if (stripe && data.session) {
        await stripe.redirectToCheckout({ sessionId: data.session.id })
      }
    } catch (err) {
      showAlert(
        'error',
        err instanceof Error ? err.message : 'Booking failed',
      )
    }
  }

  if (!user) {
    return (
      <button
        onClick={() => router.push('/login')}
        className="px-8 py-3 bg-white text-green-600 rounded-full font-semibold hover:bg-gray-100"
      >
        Log in to book tour
      </button>
    )
  }

  return (
    <button
      onClick={handleBook}
      className="px-8 py-3 bg-white text-green-600 rounded-full font-semibold hover:bg-gray-100"
    >
      Book tour now!
    </button>
  )
}
