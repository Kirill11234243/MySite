export function apiUrl(path: string) {
  const base = process.env.API_URL
    || (process.env.API_HOST ? `https://${process.env.API_HOST}` : '')
    || process.env.NEXT_PUBLIC_API_URL
    || 'http://localhost:4000';

  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function fetchApiJson<T>(path: string, attempts = 8): Promise<T | null> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(apiUrl(path), {
        cache: 'no-store',
        signal: AbortSignal.timeout(15_000),
      });
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        return await response.json() as T;
      }
    } catch {
      // A free Render service can be unavailable while it wakes up.
    }

    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 7_000));
    }
  }

  return null;
}
