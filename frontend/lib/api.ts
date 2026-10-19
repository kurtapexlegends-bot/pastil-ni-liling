/**
 * Centralized API Client and Base URL Helper
 * Adheres to GEMINI.md production topology (Vercel Frontend + Managed Backend)
 */

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

/**
 * Builds a fully-qualified API URL for a given relative endpoint path.
 * Example: apiUrl('/api/products') -> 'http://127.0.0.1:8000/api/products'
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Global SWR fetcher supporting optional bearer token authentication.
 */
export const apiFetcher = async <T = any>(endpointOrUrl: string): Promise<T> => {
  const url = endpointOrUrl.startsWith('http') ? endpointOrUrl : apiUrl(endpointOrUrl);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${res.status}`);
  }

  return res.json();
};

/**
 * Type-safe fetch wrapper with automatic JSON headers, token injection, and error handling.
 */
export async function apiFetch<T = any>(
  endpointOrUrl: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = endpointOrUrl.startsWith('http') ? endpointOrUrl : apiUrl(endpointOrUrl);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers });
  return res.json();
}

/**
 * Normalizes backend image and storage URLs to resolve correctly in both local dev and production.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url) return '/hero.png';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.startsWith('/') && !url.startsWith('/storage/')) return url;

  // Handle local storage paths from Laravel Storage::url()
  if (url.includes('/storage/')) {
    const storagePath = url.substring(url.indexOf('/storage/'));
    return `${API_BASE_URL}${storagePath}`;
  }

  return url;
}
