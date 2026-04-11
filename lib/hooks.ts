import { useEffect, useState, useRef, useCallback } from 'react'

/**
 * Debounce hook to delay function execution
 * @param callback Function to debounce
 * @param delay Delay in milliseconds
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T
}

/**
 * Cache for API responses
 */
const responseCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function clearCache() {
  responseCache.clear()
}

export async function cachedFetch(
  url: string,
  options?: RequestInit,
  cacheDuration = CACHE_DURATION
): Promise<Response> {
  const cacheKey = `${url}:${JSON.stringify(options?.body || '')}`
  const cached = responseCache.get(cacheKey)

  // Return cached response if valid
  if (cached && Date.now() - cached.timestamp < cacheDuration) {
    return new Response(JSON.stringify(cached.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Fetch fresh data
  const response = await fetch(url, options)
  const data = await response.json()

  // Cache the response
  responseCache.set(cacheKey, { data, timestamp: Date.now() })

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Hook for paginated data fetching
 */
export function usePaginatedFetch<T>(
  url: string,
  pageSize: number = 10
) {
  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${url}?page=${page}&limit=${pageSize}`)
        const newData = await response.json()
        
        if (page === 1) {
          setData(newData)
        } else {
          setData(prev => [...prev, ...newData])
        }
        
        setHasMore(newData.length === pageSize)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url, page, pageSize])

  const nextPage = useCallback(() => {
    if (hasMore && !loading) {
      setPage(p => p + 1)
    }
  }, [hasMore, loading])

  return { data, loading, hasMore, nextPage, page, setPage }
}

/**
 * Hook for debounced search
 */
export function useDebouncedSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  delay: number = 300
) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [loading, setLoading] = useState(false)

  const debouncedSearch = useDebounce(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const data = await searchFn(q)
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, delay)

  const handleQueryChange = (q: string) => {
    setQuery(q)
    debouncedSearch(q)
  }

  return { query, setQuery: handleQueryChange, results, loading }
}
