import type { Metadata } from 'next'
import Link from 'next/link'
import ProfileForm from '@/components/ProfileForm'
import PasswordForm from '@/components/PasswordForm'

export const metadata: Metadata = {
  title: 'Account settings',
}

export default function AccountSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/account"
        className="mb-6 inline-block text-sm text-green-700 hover:underline"
      >
        ← Back to account
      </Link>

      <h1 className="mb-8 text-2xl font-bold">Account settings</h1>

      <div className="space-y-12">
        <div className="rounded-lg bg-white p-8 shadow">
          <ProfileForm />
        </div>

        <hr />

        <div className="rounded-lg bg-white p-8 shadow">
          <PasswordForm />
        </div>
      </div>
    </div>
  )
}
