import { getApiUrl } from './utils'

async function fetchWithAuth(path: string, token: string | null, options?: RequestInit) {
  const apiUrl = getApiUrl()
  const shouldBypassAuth = !token && /localhost|127\.0\.0\.1/.test(apiUrl)
  const res = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(shouldBypassAuth ? { 'x-dev-bypass': 'true' } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || `HTTP ${res.status}`)
  }
  if (res.status === 204) return null

  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return res.json()
  }

  return res.text()
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
