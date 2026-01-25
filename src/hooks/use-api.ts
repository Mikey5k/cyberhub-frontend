import { useState, useEffect, useCallback } from 'react';

interface CacheItem {
  data: any;
  timestamp: number;
  loading: boolean;
  error: Error | null;
}

const CACHE_DURATION = 30000; // 30 seconds
const cache = new Map<string, CacheItem>();

export function useApi<T>(url: string | null, options?: {
  refreshInterval?: number;
  optimisticUpdate?: (oldData: T) => T;
}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!url) return;

    const cached = cache.get(url);
    const now = Date.now();

    // Return cached data if fresh
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_DURATION) {
      setData(cached.data);
      setLoading(cached.loading);
      setError(cached.error);
      return;
    }

    // Update cache with loading state
    cache.set(url, { data, timestamp: now, loading: true, error: null });
    setLoading(true);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      
      // Update cache with fresh data
      cache.set(url, { 
        data: result, 
        timestamp: Date.now(), 
        loading: false, 
        error: null 
      });
      
      setData(result);
      setLoading(false);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      // Update cache with error
      cache.set(url, { 
        data, 
        timestamp: now, 
        loading: false, 
        error 
      });
      
      setError(error);
      setLoading(false);
    }
  }, [url, data]);

  // Optimistic update helper
  const optimisticUpdate = useCallback((updater: (oldData: T | null) => T) => {
    if (!url) return;
    
    const cached = cache.get(url);
    if (cached) {
      const newData = updater(cached.data);
      cache.set(url, { 
        data: newData, 
        timestamp: cached.timestamp, 
        loading: false, 
        error: null 
      });
      setData(newData);
    }
  }, [url]);

  // Initial fetch and background refresh
  useEffect(() => {
    if (!url) return;
    
    fetchData();
    
    const interval = options?.refreshInterval 
      ? setInterval(() => fetchData(true), options.refreshInterval)
      : undefined;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [url, fetchData, options?.refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    optimisticUpdate
  };
}

// Helper to invalidate cache
export function invalidateCache(url?: string) {
  if (url) {
    cache.delete(url);
  } else {
    cache.clear();
  }
}