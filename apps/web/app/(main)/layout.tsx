import { Footer } from '@/components/sections/footer';
import { Navbar } from '@/components/sections/navbar';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main" className="bg-surface flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
