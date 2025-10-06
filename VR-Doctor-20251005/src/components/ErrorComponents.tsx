import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorComponentProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  showRetry?: boolean;
  type?: 'network' | 'server' | 'validation' | 'generic';
}

export const ErrorComponent: React.FC<ErrorComponentProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryText = 'Try Again',
  showRetry = true,
  type = 'generic'
}) => {
  const getErrorIcon = () => {
    switch (type) {
      case 'network':
        return 'wifi-outline';
      case 'server':
        return 'server-outline';
      case 'validation':
        return 'alert-circle-outline';
      default:
        return 'warning-outline';
    }
  };

  const getErrorColor = () => {
    switch (type) {
      case 'network':
        return '#f59e0b'; // amber-500
      case 'server':
        return '#ef4444'; // red-500
      case 'validation':
        return '#f59e0b'; // amber-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons 
          name={getErrorIcon()} 
          size={64} 
          color={getErrorColor()} 
          style={styles.icon}
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
        {showRetry && onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Ionicons name="refresh" size={20} color="white" style={styles.retryIcon} />
            <Text style={styles.retryText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ 
  onRetry, 
  message = 'Please check your internet connection and try again.' 
}) => (
  <ErrorComponent
    type="network"
    title="Network Error"
    message={message}
    onRetry={onRetry}
    retryText="Retry"
  />
);

interface ServerErrorProps {
  onRetry?: () => void;
  message?: string;
}

export const ServerError: React.FC<ServerErrorProps> = ({ 
  onRetry, 
  message = 'Server is temporarily unavailable. Please try again later.' 
}) => (
  <ErrorComponent
    type="server"
    title="Server Error"
    message={message}
    onRetry={onRetry}
    retryText="Retry"
  />
);

interface ValidationErrorProps {
  onRetry?: () => void;
  message?: string;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({ 
  onRetry, 
  message = 'Please check your input and try again.' 
}) => (
  <ErrorComponent
    type="validation"
    title="Validation Error"
    message={message}
    onRetry={onRetry}
    retryText="Fix & Retry"
  />
);

interface NoDataFoundProps {
  title?: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
}

export const NoDataFound: React.FC<NoDataFoundProps> = ({
  title = 'No Data Found',
  message = 'There is no data to display at the moment.',
  icon = 'document-outline',
  actionText = 'Refresh',
  onAction,
  showAction = true
}) => (
  <View style={styles.container}>
    <View style={styles.content}>
      <Ionicons 
        name={icon} 
        size={64} 
        color="#9ca3af" 
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {showAction && onAction && (
        <TouchableOpacity style={styles.retryButton} onPress={onAction}>
          <Ionicons name="refresh" size={20} color="white" style={styles.retryIcon} />
          <Text style={styles.retryText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

interface LoadingComponentProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingComponent: React.FC<LoadingComponentProps> = ({
  message = 'Loading...',
  size = 'medium'
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 48;
      default:
        return 32;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons 
          name="hourglass-outline" 
          size={getSize()} 
          color="#3b82f6" 
          style={styles.loadingIcon}
        />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </View>
  );
};

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = 'document-outline',
  actionText,
  onAction
}) => (
  <View style={styles.container}>
    <View style={styles.content}>
      <Ionicons 
        name={icon} 
        size={64} 
        color="#9ca3af" 
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {actionText && onAction && (
        <TouchableOpacity style={styles.retryButton} onPress={onAction}>
          <Text style={styles.retryText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingIcon: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default {
  ErrorComponent,
  NetworkError,
  ServerError,
  ValidationError,
  NoDataFound,
  LoadingComponent,
  EmptyState,
};
