export function HowItWorks() {
  const steps = [
    "Create an account and verify your email.",
    "Complete your profile and add content.",
    "Choose a template (e.g. VS Code).",
    "Share your public URL with employers and friends.",
  ];
  return (
    <section id="how" className="mx-auto max-w-4xl px-5 py-12">
      <h2 className="mb-6 text-2xl font-semibold">How it works</h2>
      <ol className="list-decimal space-y-3 pl-5 text-muted-foreground">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </section>
  );
}
