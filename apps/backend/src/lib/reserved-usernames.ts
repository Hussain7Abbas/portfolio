const RESERVED = new Set([
  "admin",
  "dashboard",
  "api",
  "auth",
  "settings",
  "onboarding",
  "about",
  "contact",
  "help",
  "support",
  "blog",
  "docs",
  "terms",
  "privacy",
  "sitemap",
  "robots",
  "www",
  "mail",
  "ftp",
  "localhost",
  "devport",
]);

export function isReservedUsername(username: string): boolean {
  return RESERVED.has(username.toLowerCase());
}

export function isValidUsernameFormat(username: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/.test(username);
}
