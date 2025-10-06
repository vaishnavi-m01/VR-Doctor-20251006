import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

interface ApiCallOptions {
  enabled?: boolean;
  retryCount?: number;
  cacheTime?: number;
  staleTime?: number;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  staleTime: number;
}

export const useOptimizedApi = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: ApiCallOptions = {}
) => {
  const {
    enabled = true,
    retryCount = 0,
    cacheTime = 30000, // 30 seconds
    staleTime = 10000, // 10 seconds
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  // Create cache key from dependencies
  const cacheKey = useMemo(() => {
    return JSON.stringify(dependencies);
  }, dependencies);

  const execute = useCallback(async () => {
    if (!enabled) return;

    // Check cache first
    const cachedEntry = cacheRef.current.get(cacheKey);
    if (cachedEntry) {
      const now = Date.now();
      const isStale = now - cachedEntry.timestamp > cachedEntry.staleTime;
      
      if (!isStale) {
        setState(prev => ({ ...prev, data: cachedEntry.data, loading: false, error: null }));
        return;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      
      if (!abortControllerRef.current.signal.aborted) {
        setState({ data: result, loading: false, error: null });
        
        // Cache the result
        cacheRef.current.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          staleTime,
        });
        
        // Clean up old cache entries
        const now = Date.now();
        for (const [key, entry] of cacheRef.current.entries()) {
          if (now - entry.timestamp > cacheTime) {
            cacheRef.current.delete(key);
          }
        }
        
        retryCountRef.current = 0;
      }
    } catch (error) {
      if (!abortControllerRef.current.signal.aborted) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Retry logic
        if (retryCountRef.current < retryCount) {
          retryCountRef.current += 1;
          setTimeout(() => execute(), 1000 * retryCountRef.current);
          return;
        }
        
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      }
    }
  }, [apiCall, enabled, cacheTime, staleTime, cacheKey, retryCount]);

  // Execute on mount and when dependencies change
  useEffect(() => {
    execute();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute]);

  const refetch = useCallback(() => {
    // Clear cache for this key
    cacheRef.current.delete(cacheKey);
    execute();
  }, [execute, cacheKey]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return {
    ...state,
    refetch,
    clearCache,
  };
};

// Hook for API calls with request deduplication
export const useDeduplicatedApi = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: ApiCallOptions = {}
) => {
  const pendingRequestsRef = useRef<Map<string, Promise<T>>>(new Map());
  
  const deduplicatedApiCall = useCallback(() => {
    const requestKey = JSON.stringify(dependencies);
    
    // If there's already a pending request for this key, return it
    if (pendingRequestsRef.current.has(requestKey)) {
      return pendingRequestsRef.current.get(requestKey)!;
    }
    
    // Create new request
    const request = apiCall().finally(() => {
      pendingRequestsRef.current.delete(requestKey);
    });
    
    pendingRequestsRef.current.set(requestKey, request);
    return request;
  }, [apiCall, dependencies]);

  return useOptimizedApi(deduplicatedApiCall, dependencies, options);
};

// Hook for paginated API calls
export const usePaginatedApi = <T>(
  apiCall: (page: number, pageSize: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
  pageSize: number = 20,
  options: ApiCallOptions = {}
) => {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const { data, loading, error, refetch } = useOptimizedApi(
    () => apiCall(page, pageSize),
    [page, pageSize],
    options
  );

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllData(data.data);
      } else {
        setAllData(prev => [...prev, ...data.data]);
      }
      setHasMore(data.hasMore);
      setTotal(data.total);
    }
  }, [data, page]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, loading]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
    setTotal(0);
  }, []);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    total,
    loadMore,
    reset,
    refetch,
  };
};
