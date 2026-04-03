"use client";

import { motion } from "framer-motion";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const githubUrl =
  process.env.NEXT_PUBLIC_GITHUB_REPO_URL ?? "https://github.com";

export function Hero() {
  return (
    <section className="mx-auto max-w-4xl px-5 pb-16 pt-14">
      <motion.p
        className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-primary"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Open source
      </motion.p>
      <motion.h1
        className="mb-4 max-w-[20ch] text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        Build your developer portfolio in minutes
      </motion.h1>
      <motion.p
        className="mb-7 max-w-xl text-lg text-muted-foreground"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        Free, open-source portfolio platform. Create an account, add your projects, pick a
        template, and share your portfolio with the world.
      </motion.p>
      <motion.div
        className="flex flex-wrap gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
      >
        <a
          href={`${appUrl}/sign-up`}
          className="inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Get started
        </a>
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
        >
          View on GitHub
        </a>
      </motion.div>
      <motion.div
        className="mt-14 h-40 rounded-xl border border-dashed border-border/60 bg-muted/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        aria-hidden
      />
    </section>
  );
}
