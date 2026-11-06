"use client";

import { Link } from "next-view-transitions";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="mx-auto max-w-3xl py-10 text-center sm:py-16">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs font-semibold uppercase tracking-[0.22em] text-accent"
      >
        Your career starts here
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.5 }}
        className="mt-4 text-4xl font-semibold tracking-tight text-ink sm:text-6xl"
      >
        Find the right job.
        <br />
        Build your future.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18 }}
        className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted"
      >
        Discover roles and companies across Nepal through Elevate Workforce.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        className="mt-8 flex justify-center gap-3"
      >
        <Link
          href="/jobs"
          className="rounded-full bg-zinc-800 px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-zinc-700"
        >
          Explore jobs
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-line bg-card px-6 py-3 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:border-accent"
        >
          Find talent
        </Link>
      </motion.div>
    </section>
  );
}
