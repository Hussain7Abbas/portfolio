export type TemplateMeta = {
  slug: string;
  name: string;
  description: string;
};

export const TEMPLATES: readonly TemplateMeta[] = [
  {
    slug: "vscode",
    name: "VS Code",
    description: "A developer portfolio styled like the Visual Studio Code editor.",
  },
];

export const TEMPLATE_SLUGS: readonly string[] = TEMPLATES.map((t) => t.slug);

export const DEFAULT_TEMPLATE_SLUG = "vscode";

export function isValidTemplateSlug(slug: string): boolean {
  return TEMPLATE_SLUGS.includes(slug);
}

export function getTemplateMeta(slug: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}
