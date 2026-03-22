export function formatTimeOfDay(): string {
  const hour = new Date().getHours()
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${day} ${time}`
}

export function getEnergyEmoji(level?: string): string {
  switch (level) {
    case 'high': return '⚡'
    case 'medium': return '🌤'
    case 'low': return '🌙'
    default: return '☀️'
  }
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }) as T
}

export function getApiUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'
}
