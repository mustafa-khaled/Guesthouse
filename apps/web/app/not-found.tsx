import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <h2 className="mb-4 text-4xl font-bold text-gray-800">Page not found</h2>
      <p className="mb-8 text-gray-500">The page you are looking for does not exist.</p>
      <Link href="/" className="rounded-full bg-green-600 px-6 py-3 text-white hover:bg-green-700">
        Back to home
      </Link>
    </div>
  );
}
