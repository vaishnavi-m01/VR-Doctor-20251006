import { Alert } from 'react-native';
import { authService } from '../services/authService';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  data?: any;
}

export class ErrorHandler {
  static handleApiError(error: any): ApiError {
    console.error('API Error:', error);

    // Network errors
    if (!error.response) {
      return {
        message: 'Network error. Please check your internet connection.',
        status: 0,
        code: 'NETWORK_ERROR'
      };
    }

    const status = error.response?.status || error.status;
    const data = error.response?.data || error.data;

    // Authentication errors
    if (status === 401) {
      // Auto-logout on authentication error
      authService.logout();
      return {
        message: 'Your session has expired. Please login again.',
        status,
        code: 'AUTH_ERROR'
      };
    }

    // Permission errors
    if (status === 403) {
      return {
        message: 'You do not have permission to perform this action.',
        status,
        code: 'PERMISSION_ERROR'
      };
    }

    // Not found errors
    if (status === 404) {
      return {
        message: 'The requested resource was not found.',
        status,
        code: 'NOT_FOUND'
      };
    }

    // Server errors
    if (status >= 500) {
      return {
        message: 'Server error. Please try again later.',
        status,
        code: 'SERVER_ERROR'
      };
    }

    // Client errors
    if (status >= 400) {
      const message = data?.message || data?.error || 'Invalid request. Please check your input.';
      return {
        message,
        status,
        code: 'CLIENT_ERROR',
        data
      };
    }

    // Default error
    return {
      message: error.message || 'An unexpected error occurred.',
      status,
      code: 'UNKNOWN_ERROR'
    };
  }

  static showErrorAlert(error: ApiError, onRetry?: () => void) {
    const buttons = [
      { text: 'OK', style: 'default' as const }
    ];

    if (onRetry) {
      buttons.unshift({
        text: 'Retry',
        style: 'default' as const,
        onPress: onRetry
      });
    }

    Alert.alert(
      'Error',
      error.message,
      buttons
    );
  }

  static logError(error: any, context?: string) {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      context,
      error: error.message || error,
      stack: error.stack,
      ...(error.response && {
        status: error.response.status,
        data: error.response.data
      })
    };

    console.error('Error logged:', errorInfo);

    // In production, send to crash reporting service
    if (__DEV__ === false) {
      // TODO: Integrate with crash reporting service
      // crashlytics().recordError(error);
    }
  }
}

// Hook for error handling in components
export const useErrorHandler = () => {
  const handleError = (error: any, context?: string) => {
    const apiError = ErrorHandler.handleApiError(error);
    ErrorHandler.logError(error, context);
    return apiError;
  };

  const showError = (error: ApiError, onRetry?: () => void) => {
    ErrorHandler.showErrorAlert(error, onRetry);
  };

  return { handleError, showError };
};
