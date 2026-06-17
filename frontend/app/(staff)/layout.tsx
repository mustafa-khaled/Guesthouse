import Link from 'next/link'

const navItems = [
  { href: '/staff/front-desk', label: 'Front Desk' },
  { href: '/staff/bookings', label: 'Bookings' },
  { href: '/staff/guests', label: 'Guests' },
  { href: '/staff/housekeeping', label: 'Housekeeping' },
]

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <Link href="/staff/front-desk" className="text-lg font-bold text-green-700">
            Staff Portal
          </Link>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-3">
          <Link
            href="/"
            className="block rounded-md px-3 py-2 text-sm text-gray-500 hover:text-green-700"
          >
            Back to site
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
