'use client'

import { useState } from 'react'
import { useAlert } from '@/hooks/useAlert'
import { clientFetch } from '@/lib/api'
import type { AuthResponse, ApiError } from '@/types'

export default function PasswordForm() {
  const { showAlert } = useAlert()
  const [passwordCurrent, setPasswordCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passwordCurrent,
          password,
          passwordConfirm,
        }),
      })

      const data = await res.json()

      if (data.status === 'success') {
        showAlert('success', 'Password updated successfully')
        setPasswordCurrent('')
        setPassword('')
        setPasswordConfirm('')
      } else {
        showAlert('error', (data as ApiError).message || 'Update failed')
      }
    } catch (err) {
      showAlert(
        'error',
        err instanceof Error ? err.message : 'Update failed',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Password change
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="password-current"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Current password
          </label>
          <input
            id="password-current"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            value={passwordCurrent}
            onChange={(e) => setPasswordCurrent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label
            htmlFor="password-confirm"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm new password
          </label>
          <input
            id="password-confirm"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Updating...' : 'Save password'}
        </button>
      </form>
    </div>
  )
}
