"use client";

import { motion } from "framer-motion";

const items = [
  "Multiple templates (community-contributed)",
  "Projects, certificates, and events with ordering",
  "GitHub integration for repos",
  "SEO fields and public portfolio rendering",
  "Contact messages delivered to your inbox",
  "Free forever, open source",
];

export function Features() {
  return (
    <section id="features" className="border-y border-border bg-card/40 py-12">
      <div className="mx-auto max-w-4xl px-5">
        <h2 className="mb-6 text-2xl font-semibold">Features</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((text, i) => (
            <motion.li
              key={text}
              className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-card-foreground"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-32px" }}
              transition={{ delay: 0.04 * i, duration: 0.35 }}
            >
              {text}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
