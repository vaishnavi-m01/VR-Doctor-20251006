import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Debounce utility for search inputs
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Memoized console.log to prevent excessive logging
export const useMemoizedLog = () => {
  const logCache = useRef<Map<string, number>>(new Map());
  const lastLogTime = useRef<Map<string, number>>(new Map());
  
  return useCallback((message: string, data?: any, throttleMs: number = 1000) => {
    const now = Date.now();
    const lastTime = lastLogTime.current.get(message) || 0;
    
    if (now - lastTime > throttleMs) {
      console.log(message, data);
      lastLogTime.current.set(message, now);
    }
  }, []);
};

// Optimized participant selection hook
export const useOptimizedParticipantSelection = (
  participants: any[],
  initialSelection?: string
) => {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelection || null);
  const prevSelectedId = useRef<string | null>(null);
  const memoizedLog = useMemoizedLog();

  const selectedParticipant = useMemo(() => {
    return participants.find(p => p.ParticipantId === selectedId) || null;
  }, [participants, selectedId]);

  const setSelection = useCallback((id: string | null) => {
    if (id !== prevSelectedId.current) {
      prevSelectedId.current = id;
      setSelectedId(id);
      memoizedLog(`🔍 Selected participant ${id}`, { 
        groupType: selectedParticipant?.groupType 
      });
    }
  }, [selectedParticipant?.groupType, memoizedLog]);

  return {
    selectedId,
    selectedParticipant,
    setSelection
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (renderCount.current > 10 && timeSinceLastRender < 100) {
      console.warn(`⚠️ ${componentName} is re-rendering too frequently (${renderCount.current} renders)`);
    }
    
    lastRenderTime.current = now;
  });
  
  return renderCount.current;
};

// Optimized API call hook
export const useOptimizedApiCall = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    enabled?: boolean;
    retryCount?: number;
    cacheTime?: number;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<{ data: T; timestamp: number } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { enabled = true, retryCount = 0, cacheTime = 30000 } = options;

  const execute = useCallback(async () => {
    if (!enabled) return;

    // Check cache
    if (cacheRef.current && Date.now() - cacheRef.current.timestamp < cacheTime) {
      setData(cacheRef.current.data);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      cacheRef.current = { data: result, timestamp: Date.now() };
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall, enabled, cacheTime, ...dependencies]);

  useEffect(() => {
    execute();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute]);

  return { data, loading, error, refetch: execute };
};
