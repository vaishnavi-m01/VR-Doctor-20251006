import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: number;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  showAlert?: boolean;
  logToConsole?: boolean;
  retryable?: boolean;
  onRetry?: () => void;
}

export const useErrorHandler = () => {
  const errorCountRef = useRef<Map<string, number>>(new Map());

  const handleError = useCallback((
    error: Error | string,
    context: ErrorContext = {},
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      showAlert = false,
      logToConsole = true,
      retryable = false,
      onRetry,
    } = options;

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorKey = `${context.component}-${context.action}-${errorMessage}`;
    
    // Track error frequency
    const currentCount = errorCountRef.current.get(errorKey) || 0;
    errorCountRef.current.set(errorKey, currentCount + 1);

    // Log to console
    if (logToConsole) {
      console.error(`🚨 Error in ${context.component || 'Unknown'}:`, {
        message: errorMessage,
        context,
        count: currentCount + 1,
        timestamp: new Date().toISOString(),
      });
    }

    // Show toast notification
    if (showToast) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        position: 'top',
        topOffset: 60,
        visibilityTime: 4000,
      });
    }

    // Show alert for critical errors
    if (showAlert) {
      Alert.alert(
        'Error',
        errorMessage,
        retryable && onRetry ? [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: onRetry },
        ] : [{ text: 'OK' }]
      );
    }
  }, []);

  const handleApiError = useCallback((
    error: any,
    context: ErrorContext = {},
    options: ErrorHandlerOptions = {}
  ) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      switch (status) {
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Authentication required. Please login again.';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Server error (${status}). Please try again.`;
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    handleError(errorMessage, context, options);
  }, [handleError]);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    context: ErrorContext = {},
    options: ErrorHandlerOptions = {}
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context, options);
      throw error;
    }
  }, [handleError]);

  const clearErrorCount = useCallback((errorKey?: string) => {
    if (errorKey) {
      errorCountRef.current.delete(errorKey);
    } else {
      errorCountRef.current.clear();
    }
  }, []);

  const getErrorCount = useCallback((errorKey: string) => {
    return errorCountRef.current.get(errorKey) || 0;
  }, []);

  return {
    handleError,
    handleApiError,
    handleAsyncError,
    clearErrorCount,
    getErrorCount,
  };
};

// Hook for retry logic
export const useRetry = (maxRetries: number = 3, delay: number = 1000) => {
  const retryCountRef = useRef(0);

  const executeWithRetry = useCallback(async <T>(
    fn: () => Promise<T>,
    onRetry?: (attempt: number) => void
  ): Promise<T> => {
    try {
      const result = await fn();
      retryCountRef.current = 0; // Reset on success
      return result;
    } catch (error) {
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        onRetry?.(retryCountRef.current);
        
        // Exponential backoff
        const delayTime = delay * Math.pow(2, retryCountRef.current - 1);
        await new Promise(resolve => setTimeout(resolve, delayTime));
        
        return executeWithRetry(fn, onRetry);
      }
      
      retryCountRef.current = 0; // Reset on final failure
      throw error;
    }
  }, [maxRetries, delay]);

  const resetRetryCount = useCallback(() => {
    retryCountRef.current = 0;
  }, []);

  return {
    executeWithRetry,
    resetRetryCount,
    currentRetryCount: retryCountRef.current,
  };
};
