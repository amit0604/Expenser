import { useQuery } from '@tanstack/react-query'

export type Health = {
  status: string
  service: string
  version: string
}

export type Readiness = {
  status: string
  database: string
  ok: boolean
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => getJson<Health>('/api/health'),
    refetchInterval: 15_000,
  })
}

export function useReadiness() {
  return useQuery({
    queryKey: ['readiness'],
    queryFn: async (): Promise<Readiness> => {
      const response = await fetch('/api/ready', {
        headers: { Accept: 'application/json' },
      })
      const data = (await response.json()) as Omit<Readiness, 'ok'>

      return { ...data, ok: response.ok }
    },
    refetchInterval: 15_000,
    retry: false,
  })
}
