import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Suspense } from "react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Suspense fallback={<div className="h-14 border-b border-line bg-[#fffcf7]" />}>
        <Navbar />
      </Suspense>
      <div className="flex-1 py-24 text-center">
        <p className="text-sm font-medium text-stone-400">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-stone-500">The page you are looking for does not exist.</p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-stone-900 underline">
          Back home
        </Link>
      </div>
      <Footer />
    </div>
  );
}
