"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const githubUrl =
  process.env.NEXT_PUBLIC_GITHUB_REPO_URL ?? "https://github.com";

export function TemplatesShowcase() {
  return (
    <section className="mx-auto max-w-4xl px-5 pb-12">
      <motion.div
        className="rounded-xl border border-border bg-gradient-to-br from-card to-muted/30 p-6"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
      >
        <h2 className="mb-2 text-xl font-semibold">Templates</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          The VS Code–inspired template ships first. More templates and contributions are
          welcome.
        </p>
        <Link href={githubUrl} className="text-sm font-semibold text-primary" target="_blank" rel="noreferrer">
          Contribute a template →
        </Link>
      </motion.div>
    </section>
  );
}
