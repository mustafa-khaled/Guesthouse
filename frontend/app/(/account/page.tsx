import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Your account',
}

const accountLinks = [
  {
    href: '/account/profile',
    title: 'Guest profile',
    description: 'Travel preferences, contact details, and personal info',
  },
  {
    href: '/account/bookings',
    title: 'My bookings',
    description: 'View and manage your reservations',
  },
  {
    href: '/account/reviews',
    title: 'My reviews',
    description: 'Reviews you have written for past stays',
  },
  {
    href: '/account/settings',
    title: 'Account settings',
    description: 'Update your profile and change your password',
  },
]

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Your account</h1>
      <p className="mb-8 text-gray-600">
        Manage your profile, bookings, and account settings.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {accountLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{link.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{link.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
