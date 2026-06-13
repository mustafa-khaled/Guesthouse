'use client'

import { useState } from 'react'
import { clientFetch } from '@/lib/api'
import { useAlert } from '@/hooks/useAlert'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const { showAlert } = useAlert()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await clientFetch('/users/forgetPassword', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setSent(true)
      showAlert('success', 'Token sent to email')
    } catch (err) {
      showAlert(
        'error',
        err instanceof Error ? err.message : 'Failed to send reset email',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Check your email
        </h2>
        <p className="text-gray-600">
          A password reset link has been sent to {email}.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        Forgot your password?
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  )
}
