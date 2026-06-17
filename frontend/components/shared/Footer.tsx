export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-900 py-10 text-gray-300">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-white">Guesthouse</p>
            <p className="mt-2 text-sm">
              Hotel booking and property management platform.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Guest</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <a href="/" className="hover:text-white">
                  Browse properties
                </a>
              </li>
              <li>
                <a href="/account/bookings" className="hover:text-white">
                  My bookings
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">Staff</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <a href="/staff/front-desk" className="hover:text-white">
                  Front desk
                </a>
              </li>
              <li>
                <a href="/staff/housekeeping" className="hover:text-white">
                  Housekeeping
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Guesthouse. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
