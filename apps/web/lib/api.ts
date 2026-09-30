export function apiUrl(path: string) {
  const base = process.env.API_URL
    || (process.env.API_HOST ? `https://${process.env.API_HOST}` : '')
    || process.env.NEXT_PUBLIC_API_URL
    || 'http://localhost:4000';

  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
