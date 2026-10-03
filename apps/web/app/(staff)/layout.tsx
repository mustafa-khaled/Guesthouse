import Link from 'next/link';
import { StaffNav } from './staff-nav';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <Link href="/staff/front-desk" className="text-lg font-bold text-green-700">
            Staff Portal
          </Link>
        </div>
        <StaffNav />
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
  );
}
