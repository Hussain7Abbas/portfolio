import type { ComponentType, ReactNode } from "react";
import { isValidTemplateSlug } from "@devport/templates";
import { VscodeShell } from "./vscode/vscode-shell";

export type TemplateSubPage =
  | "home"
  | "about"
  | "projects"
  | "certificates"
  | "contact"
  | "github"
  | "settings";

export type TemplateShellProps = {
  base: string;
  titlebarTitle: string;
  children: ReactNode;
};

type TemplateDefinition = {
  slug: string;
  shell?: ComponentType<TemplateShellProps>;
  pages: ReadonlySet<TemplateSubPage>;
};

const ALL_PAGES: TemplateSubPage[] = [
  "home",
  "about",
  "projects",
  "certificates",
  "contact",
  "github",
  "settings",
];

const registry: Record<string, TemplateDefinition> = {
  vscode: {
    slug: "vscode",
    shell: VscodeShell,
    pages: new Set(ALL_PAGES),
  },
};

export function isKnownTemplateSlug(slug: string): slug is keyof typeof registry {
  return isValidTemplateSlug(slug) && slug in registry;
}

export function getTemplateDefinition(slug: string): TemplateDefinition | undefined {
  return registry[slug];
}

export function templateSupportsPage(slug: string, page: TemplateSubPage): boolean {
  return registry[slug]?.pages.has(page) ?? false;
}
