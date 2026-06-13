'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAlert } from '@/hooks/useAlert'
import { clientFetch } from '@/lib/api'
import type { AuthResponse, ApiError } from '@/types'

export default function ProfileForm() {
  const { user, refreshUser } = useAuth()
  const { showAlert } = useAlert()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('email', email)

      const photoInput = document.getElementById('photo') as HTMLInputElement
      if (photoInput?.files?.[0]) {
        formData.append('photo', photoInput.files[0])
      }

      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        body: formData,
      })

      const data = await res.json()

      if (data.status === 'success') {
        showAlert('success', 'Profile updated successfully')
        await refreshUser()
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
        Your account settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

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
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex items-center gap-4">
          {user?.photo && (
            <img
              src={user.photo}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div>
            <label
              htmlFor="photo"
              className="px-4 py-2 text-sm border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
            >
              Choose new photo
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save settings'}
        </button>
      </form>
    </div>
  )
}
