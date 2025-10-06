import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to crash reporting service in production
    if (__DEV__ === false) {
      // TODO: Integrate with crash reporting service (e.g., Sentry, Crashlytics)
      console.error('Production error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-gray-50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="warning" size={32} color="#ef4444" />
              </View>
              <Text className="text-xl font-bold text-gray-800 text-center mb-2">
                Something went wrong
              </Text>
              <Text className="text-gray-600 text-center">
                The app encountered an unexpected error. Please try again.
              </Text>
            </View>

            {__DEV__ && this.state.error && (
              <ScrollView className="max-h-40 mb-6">
                <View className="bg-gray-100 rounded-lg p-4">
                  <Text className="text-sm font-mono text-gray-800 mb-2">
                    Error Details:
                  </Text>
                  <Text className="text-xs text-gray-600 mb-2">
                    {this.state.error.message}
                  </Text>
                  {this.state.errorInfo && (
                    <Text className="text-xs text-gray-500">
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={this.handleRetry}
              className="bg-blue-600 rounded-xl py-4 px-6 items-center"
            >
              <Text className="text-white font-semibold text-base">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    console.error('Error captured:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};