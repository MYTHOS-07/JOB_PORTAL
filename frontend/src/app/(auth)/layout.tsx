import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { DocumentSmoothScroll } from "@/components/motion/SmoothScroll";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <DocumentSmoothScroll />
      <Suspense fallback={<div className="h-14 border-b border-line bg-card" />}>
        <Navbar />
      </Suspense>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">{children}</main>
      <Footer />
    </div>
  );
}
