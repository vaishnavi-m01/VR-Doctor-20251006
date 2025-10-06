import { useState, useCallback, useRef } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  retryCount: number;
}

interface UseLoadingStateOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onSuccess
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    retryCount: 0
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
    if (error && onError) {
      onError(error);
    }
  }, [onError]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, retryCount: 0 }));
  }, []);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = 'Operation'
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      setState(prev => ({ ...prev, retryCount: 0 }));
      if (onSuccess) {
        onSuccess();
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (state.retryCount < maxRetries) {
        setState(prev => ({ 
          ...prev, 
          retryCount: prev.retryCount + 1,
          error: `${operationName} failed. Retrying... (${prev.retryCount + 1}/${maxRetries})`
        }));

        // Retry after delay
        retryTimeoutRef.current = setTimeout(() => {
          executeWithRetry(operation, operationName);
        }, retryDelay);

        return null;
      } else {
        setError(`${operationName} failed after ${maxRetries} attempts: ${errorMessage}`);
        return null;
      }
    } finally {
      setLoading(false);
    }
  }, [state.retryCount, maxRetries, retryDelay, onError, onSuccess, setLoading, setError]);

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = 'Operation'
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      if (onSuccess) {
        onSuccess();
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`${operationName} failed: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, onSuccess]);

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  return {
    ...state,
    setLoading,
    setError,
    clearError,
    execute,
    executeWithRetry,
    cleanup
  };
};
