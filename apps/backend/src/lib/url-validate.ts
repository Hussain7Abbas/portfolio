/** Only allow http/https absolute URLs, blocking `javascript:` and other schemes. */
export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

/** Shared check for entities with an optional `image` and a link field named `url`. */
export function findInvalidImageUrlField(fields: {
  image?: string | null;
  url?: string | null;
}): "image" | "url" | null {
  if (fields.image && !isValidHttpUrl(fields.image)) return "image";
  if (fields.url && !isValidHttpUrl(fields.url)) return "url";
  return null;
}
