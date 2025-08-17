// lib/fern.ts
export const FERN_BASE = process.env.FERN_BASE_URL!;
export const FERN_KEY = process.env.FERN_API_KEY!;

export async function fernFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${FERN_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      "Content-Type": "application/json",
      Authorization: `Bearer ${FERN_KEY}`,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fern error ${res.status}: ${text}`);
  }
  return res.json();
}
