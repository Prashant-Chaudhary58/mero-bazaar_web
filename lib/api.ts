// lib/api.ts
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5001'
  : process.env.NEXT_PUBLIC_API_URL || 'https://your-api.com';

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const defaultOptions: RequestInit = {
    credentials: 'include',                    // auto-send/receive HttpOnly cookie
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(url, defaultOptions);

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed: ${res.status}`);
  }

  return res;
}

// Helper examples
export async function login(phone: string, password: string) {
  const res = await apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });
  return res.json();
}

export async function getCurrentUser() {
  const res = await apiFetch('/api/v1/auth/me'); // assume you add this protected route
  return res.json();
}