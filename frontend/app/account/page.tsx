import type { Metadata } from 'next'
import ProfileForm from '@/components/ProfileForm'
import PasswordForm from '@/components/PasswordForm'

export const metadata: Metadata = {
  title: 'Your account',
}

export default function AccountPage() {
  return (
    <div className="py-16 px-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <nav className="lg:col-span-1">
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="block px-4 py-2 bg-green-50 text-green-700 rounded-md font-medium"
              >
                Settings
              </a>
            </li>
            <li>
              <a
                href="/my-tours"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
              >
                My bookings
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
              >
                My reviews
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
              >
                Billing
              </a>
            </li>
          </ul>
        </nav>

        <div className="lg:col-span-3 space-y-12">
          <div className="bg-white p-8 rounded-lg shadow">
            <ProfileForm />
          </div>

          <hr />

          <div className="bg-white p-8 rounded-lg shadow">
            <PasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}
