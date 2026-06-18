import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50">{children}</main>
      <Footer />
    </>
  );
}
