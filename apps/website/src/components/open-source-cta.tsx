"use client";

import { motion } from "framer-motion";

const githubUrl =
  process.env.NEXT_PUBLIC_GITHUB_REPO_URL ?? "https://github.com";

export function OpenSourceCta() {
  return (
    <section className="border-t border-border px-5 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="mb-2 text-xl font-semibold">DevPort is free and open source</h2>
        <p className="mb-6 text-muted-foreground">Star the repo and help grow the template ecosystem.</p>
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-lg border border-border px-4 py-2 text-sm font-semibold"
        >
          GitHub
        </a>
      </motion.div>
    </section>
  );
}
