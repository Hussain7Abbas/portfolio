export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      ...init?.headers,
    },
  });
}

/** Extracts a human-readable message from an error response body, falling back gracefully. */
export function parseErrorMessage(text: string, status: number, statusText: string): string {
  if (!text) {
    return `${status} ${statusText}`.trim();
  }
  try {
    const parsed = JSON.parse(text) as { error?: unknown; message?: unknown };
    if (typeof parsed.error === "string" && parsed.error.trim()) {
      return parsed.error;
    }
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message;
    }
  } catch {
    /* not JSON, fall through to raw text */
  }
  return text;
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await apiFetch(path, { ...init, headers });
  const text = await res.text();
  if (!res.ok) {
    throw new ApiError(parseErrorMessage(text, res.status, res.statusText), res.status);
  }
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
