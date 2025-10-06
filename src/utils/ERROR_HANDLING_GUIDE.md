# Comprehensive Error Handling & Performance Optimization Guide

This guide covers all the error handling, performance optimizations, and best practices implemented in the VR Doctor application.

## 🚨 Error Handling Components

### 1. **Error Components** (`src/components/ErrorComponents.tsx`)

#### Available Components:
- `ErrorComponent` - Generic error display
- `NetworkError` - Network connectivity issues
- `ServerError` - Server-side errors (5xx)
- `ValidationError` - Input validation errors
- `NoDataFound` - Empty state when no data is available
- `LoadingComponent` - Loading states
- `EmptyState` - Custom empty states

#### Usage Examples:

```typescript
import { NetworkError, ServerError, NoDataFound, LoadingComponent } from '@components/ErrorComponents';

// Network error
<NetworkError 
  onRetry={() => refetchData()}
  message="Please check your internet connection."
/>

// Server error
<ServerError 
  onRetry={() => retryApiCall()}
  message="Server is temporarily unavailable."
/>

// No data found
<NoDataFound
  title="No Assessments Found"
  message="No FACT-G assessments found for this participant."
  actionText="Refresh"
  onAction={() => loadAssessments()}
/>

// Loading state
<LoadingComponent 
  message="Loading assessments..." 
  size="medium" 
/>
```

### 2. **React Error Boundary** (`src/components/ErrorBoundary.tsx`)

#### Features:
- **Catches JavaScript errors** anywhere in the component tree
- **Logs errors** to console in development
- **Reports errors** to crash reporting services in production
- **Custom fallback UI** with retry functionality
- **Error details** in development mode

#### Usage:

```typescript
import ErrorBoundary from '@components/ErrorBoundary';

// Wrap your app or specific components
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>

// With error handler
<ErrorBoundary onError={(error, errorInfo) => {
  // Custom error handling
  console.log('Error caught:', error);
}}>
  <YourComponent />
</ErrorBoundary>
```

#### Higher-Order Component:

```typescript
import { withErrorBoundary } from '@components/ErrorBoundary';

const SafeComponent = withErrorBoundary(YourComponent, {
  fallback: <CustomErrorUI />,
  onError: (error) => console.log(error)
});
```

## 🔄 API Error Handling

### Enhanced API Client (`src/services/apiClient.ts`)

#### Features:
- **Automatic error categorization**
- **User-friendly error messages**
- **Retry mechanisms**
- **Network status detection**

#### Error Types:
```typescript
interface EnhancedError {
  isNetworkError: boolean;      // No internet connection
  isServerError: boolean;       // 5xx status codes
  isClientError: boolean;       // 4xx status codes
  isAuthError: boolean;         // 401 Unauthorized
  isForbiddenError: boolean;    // 403 Forbidden
  isNotFoundError: boolean;     // 404 Not Found
  isTimeoutError: boolean;      // Request timeout
  status?: number;              // HTTP status code
  data?: any;                   // Error response data
  message: string;              // Error message
}
```

#### Usage in Components:

```typescript
try {
  const response = await apiService.get('/assessments');
  // Handle success
} catch (error) {
  if (error.isNetworkError) {
    return <NetworkError onRetry={() => retry()} />;
  }
  
  if (error.isServerError) {
    return <ServerError onRetry={() => retry()} />;
  }
  
  if (error.isAuthError) {
    // Redirect to login
    navigation.navigate('Login');
  }
  
  // Generic error
  return <ErrorComponent message={error.message} />;
}
```

## ⚡ Performance Optimizations

### 1. **Debouncing** (`src/utils/debounce.ts`)

#### Features:
- **Search debouncing** - Prevents excessive API calls
- **Form submission debouncing** - Prevents duplicate submissions
- **API call debouncing** - Reduces server load

#### Usage Examples:

```typescript
import { useDebouncedCallback, useDebouncedSearch } from '@utils/debounce';

// Debounced search
const { debouncedSearch, isSearching } = useDebouncedSearch(
  async (query) => {
    const results = await searchAPI(query);
    return results;
  },
  300 // 300ms delay
);

// Debounced callback
const debouncedSave = useDebouncedCallback(
  async (data) => {
    await saveAssessment(data);
  },
  1000 // 1 second delay
);

// Usage
<TextInput 
  onChangeText={(text) => debouncedSearch(text)}
  placeholder="Search assessments..."
/>
```

### 2. **Lazy Loading** (`src/utils/lazyLoading.tsx`)

#### Features:
- **Component lazy loading** - Load components only when needed
- **Automatic error boundaries** - Catch loading errors
- **Loading fallbacks** - Show loading states
- **Retry mechanisms** - Retry failed loads

#### Usage:

```typescript
import { LazyFactG, LazySocioDemographic } from '@utils/lazyLoading';

// In your navigation
<Stack.Screen 
  name="FactG" 
  component={LazyFactG} 
/>

// Custom lazy component
const LazyCustomComponent = withLazyLoading(
  () => import('./CustomComponent'),
  'Loading custom component...'
);
```

#### Available Lazy Components:
- `LazyPatientScreening`
- `LazySocioDemographic`
- `LazyFactG`
- `LazyPreVR`
- `LazyPostVRAssessment`
- `LazyStudyObservation`
- `LazyAdverseEventForm`
- `LazyExitInterview`
- `LazyPreAndPostVR`
- `LazyScreening`
- `LazyPatientDatabaseScreen`
- `LazyDistressThermometerScreen`
- `LazyEdmontonFactGScreen`
- `LazyDoctorDashboard`
- `LazyHome`
- `LazySessionSetupScreen`
- `LazySessionControlScreen`
- `LazySessionCompletedScreen`
- `LazyLogin`
- `LazyProfile`

### 3. **Memoization** (`src/utils/memoization.tsx`)

#### Features:
- **Component memoization** - Prevent unnecessary re-renders
- **Callback memoization** - Stable function references
- **Value memoization** - Expensive calculation caching
- **List optimization** - Optimized list rendering

#### Usage Examples:

```typescript
import { withMemo, useExpensiveCalculation, useStableCallback } from '@utils/memoization';

// Memoized component
const MemoizedScoreDisplay = withMemo(function ScoreDisplay({ scores }) {
  return <ScoreChart scores={scores} />;
});

// Expensive calculation
const expensiveValue = useExpensiveCalculation(() => {
  return computeComplexScores(data);
}, [data]);

// Stable callback
const handleSave = useStableCallback((data) => {
  saveAssessment(data);
}, [saveAssessment]);

// Memoized list
<MemoizedList
  data={assessments}
  renderItem={({ item }) => <AssessmentCard assessment={item} />}
  keyExtractor={(item) => item.id}
/>
```

## 🔍 Search with Debouncing

### Search Component (`src/components/SearchWithDebounce.tsx`)

#### Features:
- **Automatic debouncing** - Prevents excessive API calls
- **Loading states** - Shows search progress
- **Error handling** - Displays search errors
- **Empty states** - Shows when no results found
- **Customizable** - Flexible configuration

#### Usage:

```typescript
import SearchWithDebounce from '@components/SearchWithDebounce';

<SearchWithDebounce
  onSearch={async (query) => {
    const results = await searchParticipants(query);
    return results;
  }}
  renderItem={({ item }) => (
    <ParticipantCard participant={item} />
  )}
  keyExtractor={(item) => item.id}
  placeholder="Search participants..."
  debounceDelay={300}
  minQueryLength={2}
  onItemSelect={(item) => {
    navigation.navigate('ParticipantDetails', { id: item.id });
  }}
/>
```

## 📱 Complete Example Implementation

### FactG with Error Handling (`src/screens/assessments/FactGWithErrorHandling.tsx`)

This example demonstrates all the best practices:

```typescript
import React, { useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  NetworkError, 
  ServerError, 
  LoadingComponent, 
  NoDataFound 
} from '@components/ErrorComponents';
import { useDebouncedCallback } from '../../utils/debounce';
import { withMemo } from '../../utils/memoization';

function FactGWithErrorHandling({ patientId }) {
  const dispatch = useAppDispatch();
  const { factGAssessments, factGLoading, factGError } = useAppSelector(state => state.assessment);

  // Memoized scores calculation
  const scores = useMemo(() => computeScores(answers), [answers]);

  // Debounced save function
  const debouncedSave = useDebouncedCallback(
    useCallback(async (assessmentData) => {
      try {
        await dispatch(saveFactGAssessment(assessmentData)).unwrap();
        // Success handling
      } catch (error) {
        // Error handling
      }
    }, [dispatch]),
    1000
  );

  // Error state rendering
  if (factGError) {
    if (factGError.includes('Network')) {
      return <NetworkError onRetry={() => dispatch(fetchFactGAssessments(patientId))} />;
    }
    
    if (factGError.includes('Server')) {
      return <ServerError onRetry={() => dispatch(fetchFactGAssessments(patientId))} />;
    }

    return <ErrorComponent message={factGError} onRetry={() => dispatch(fetchFactGAssessments(patientId))} />;
  }

  // Loading state
  if (factGLoading && factGAssessments.length === 0) {
    return <LoadingComponent message="Loading FACT-G assessments..." />;
  }

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
      {/* Form content */}
      
      {/* Memoized components */}
      <MemoizedScoreDisplay scores={scores} />
      <MemoizedAssessmentHistory assessments={factGAssessments} onRetry={handleRetry} />
    </ScrollView>
  );
}

export default withMemo(FactGWithErrorHandling);
```

## 🎯 Best Practices

### 1. **Error Handling**
- Always wrap API calls in try-catch blocks
- Use specific error components for different error types
- Provide retry mechanisms for recoverable errors
- Show user-friendly error messages
- Log errors for debugging

### 2. **Performance**
- Use `React.memo` for components that receive stable props
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers
- Implement debouncing for search and API calls
- Use lazy loading for large components

### 3. **Loading States**
- Show loading indicators for all async operations
- Use skeleton screens for better UX
- Implement pull-to-refresh for data updates
- Provide cancel mechanisms for long operations

### 4. **Empty States**
- Show meaningful empty state messages
- Provide actions to resolve empty states
- Use appropriate icons and illustrations
- Guide users on next steps

### 5. **Search Optimization**
- Implement debouncing (300-500ms delay)
- Set minimum query length (2-3 characters)
- Show loading states during search
- Handle search errors gracefully
- Provide clear empty states

## 🚀 Migration Guide

### From Basic Components to Error-Handled Components

**Before:**
```typescript
function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/data');
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  if (data.length === 0) return <Text>No data found</Text>;

  return <DataList data={data} />;
}
```

**After:**
```typescript
function MyComponent() {
  const { data, loading, error } = useAppSelector(state => state.myData);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMyData());
  }, [dispatch]);

  if (loading) return <LoadingComponent message="Loading data..." />;
  if (error) return <ErrorComponent message={error} onRetry={() => dispatch(fetchMyData())} />;
  if (data.length === 0) return <NoDataFound title="No Data" message="No data available" />;

  return <MemoizedDataList data={data} />;
}
```

## 📊 Performance Monitoring

### Use Performance Monitor Hook

```typescript
import { usePerformanceMonitor } from '@utils/memoization';

function MyComponent() {
  const { renderCount, timeSinceLastRender } = usePerformanceMonitor('MyComponent');
  
  // Component logic
  
  return <View>...</View>;
}
```

This will log render counts and timing in development mode to help identify performance issues.

## 🔧 Configuration

### Environment-Specific Settings

```typescript
// Development
const DEBOUNCE_DELAY = 300;
const API_TIMEOUT = 10000;
const ENABLE_PERFORMANCE_MONITORING = true;

// Production
const DEBOUNCE_DELAY = 500;
const API_TIMEOUT = 15000;
const ENABLE_PERFORMANCE_MONITORING = false;
```

## 📝 Summary

This comprehensive error handling and performance optimization system provides:

1. **Robust Error Handling** - Catches and handles all types of errors gracefully
2. **Performance Optimization** - Reduces unnecessary re-renders and API calls
3. **Better User Experience** - Loading states, empty states, and retry mechanisms
4. **Developer Experience** - Easy-to-use components and utilities
5. **Maintainability** - Consistent patterns and reusable components

Implement these patterns throughout your application for a more robust, performant, and user-friendly experience.
