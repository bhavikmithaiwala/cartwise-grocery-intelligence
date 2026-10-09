export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options, credentials: 'same-origin',
    headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), 'X-CartWise-Request': '1', ...options.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ code: 'NETWORK_ERROR', message: 'The server could not complete this request.' }));
    throw new ApiError(response.status, error.code, error.message);
  }
  return response.status === 204 ? undefined as T : response.json();
}
export interface Account { id: string; email: string }
export const post = <T,>(path: string, data: unknown) => api<T>(path, { method: 'POST', body: JSON.stringify(data) });
