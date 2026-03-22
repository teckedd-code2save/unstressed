import { useAuth } from '@clerk/clerk-expo'
import { getApiUrl } from './utils'

async function fetchWithAuth(path: string, token: string | null, options?: RequestInit) {
  const res = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || `HTTP ${res.status}`)
  }
  return res.json()
}

export function createApiClient(getToken: () => Promise<string | null>) {
  return {
    async get(path: string) {
      const token = await getToken()
      return fetchWithAuth(path, token)
    },
    async post(path: string, body: unknown) {
      const token = await getToken()
      return fetchWithAuth(path, token, {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    async patch(path: string, body: unknown) {
      const token = await getToken()
      return fetchWithAuth(path, token, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
    },
  }
}
