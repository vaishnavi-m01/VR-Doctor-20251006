import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
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
}

/**
 * Custom hook for debouncing function calls
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds
 * @param deps - Dependencies array
 * @returns The debounced function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay, ...deps]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Higher-order function to create a debounced version of any function
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Custom hook for search with debouncing
 * @param searchFunction - The function to call when searching
 * @param delay - The delay in milliseconds (default: 300)
 * @returns Object with search function and loading state
 */
export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T>,
  delay: number = 300
) {
  const [isSearching, setIsSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback(
    (query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (query.trim() === '') {
        setIsSearching(false);
        return Promise.resolve([] as T);
      }

      setIsSearching(true);
      setLastQuery(query);

      return new Promise<T>((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            const result = await searchFunction(query);
            setIsSearching(false);
            resolve(result);
          } catch (error) {
            setIsSearching(false);
            reject(error);
          }
        }, delay);
      });
    },
    [searchFunction, delay]
  );

  const cancelSearch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedSearch,
    isSearching,
    lastQuery,
    cancelSearch,
  };
}

/**
 * Custom hook for API calls with debouncing
 * @param apiCall - The API function to call
 * @param delay - The delay in milliseconds (default: 500)
 * @returns Object with debounced API call and states
 */
export function useDebouncedApiCall<T, P extends any[]>(
  apiCall: (...args: P) => Promise<T>,
  delay: number = 500
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedApiCall = useCallback(
    (...args: P) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsLoading(true);
      setError(null);

      return new Promise<T>((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            const result = await apiCall(...args);
            setData(result);
            setIsLoading(false);
            resolve(result);
          } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            setIsLoading(false);
            reject(error);
          }
        }, delay);
      });
    },
    [apiCall, delay]
  );

  const cancelApiCall = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedApiCall,
    isLoading,
    error,
    data,
    cancelApiCall,
  };
}

// Import useState for the hooks
import { useState } from 'react';

export default {
  useDebounce,
  useDebouncedCallback,
  debounce,
  useDebouncedSearch,
  useDebouncedApiCall,
};
