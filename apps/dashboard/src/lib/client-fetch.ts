export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `${res.status}`);
  }
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
