import React, { memo, useMemo, useCallback, ComponentType } from 'react';
import { Text } from 'react-native';

/**
 * Higher-order component for memoizing components with custom comparison
 */
export function withMemo<P extends object>(
  Component: ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(Component, areEqual);
}

/**
 * Memoized component wrapper with custom display name
 */
export function createMemoizedComponent<P extends object>(
  Component: ComponentType<P>,
  displayName?: string,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  const MemoizedComponent = memo(Component, areEqual);
  MemoizedComponent.displayName = displayName || `Memoized(${Component.displayName || Component.name})`;
  return MemoizedComponent;
}

/**
 * Hook for memoizing expensive calculations
 */
export function useExpensiveCalculation<T>(
  calculation: () => T,
  deps: React.DependencyList
): T {
  return useMemo(calculation, deps);
}

/**
 * Hook for memoizing callbacks with stable references
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * Memoized list item component for better performance
 */
export interface MemoizedListItemProps<T> {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor?: (item: T, index: number) => string;
}

export function MemoizedListItem<T>({
  item,
  index,
  renderItem,
  keyExtractor
}: MemoizedListItemProps<T>) {
  const key = useMemo(() => 
    keyExtractor ? keyExtractor(item, index) : index.toString(),
    [item, index, keyExtractor]
  );

  const renderedItem = useMemo(() => 
    renderItem(item, index),
    [item, index, renderItem]
  );

  return <React.Fragment key={key}>{renderedItem}</React.Fragment>;
}

/**
 * Memoized list component for better performance
 */
export interface MemoizedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor?: (item: T, index: number) => string;
  ListEmptyComponent?: React.ComponentType;
  ListHeaderComponent?: React.ComponentType;
  ListFooterComponent?: React.ComponentType;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const MemoizedList = memo(function MemoizedList<T>({
  data,
  renderItem,
  keyExtractor,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing = false,
  onRefresh
}: MemoizedListProps<T>) {
  const memoizedData = useMemo(() => data, [data]);

  const memoizedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => (
      <MemoizedListItem
        item={item}
        index={index}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    ),
    [renderItem, keyExtractor]
  );

  const memoizedKeyExtractor = useCallback(
    (item: T, index: number) => 
      keyExtractor ? keyExtractor(item, index) : index.toString(),
    [keyExtractor]
  );

  return (
    <React.Fragment>
      {ListHeaderComponent && <ListHeaderComponent />}
      {memoizedData.length === 0 && ListEmptyComponent ? (
        <ListEmptyComponent />
      ) : (
        memoizedData.map((item, index) => 
          memoizedRenderItem({ item, index })
        )
      )}
      {ListFooterComponent && <ListFooterComponent />}
    </React.Fragment>
  );
});

/**
 * Memoized form field component
 */
export interface MemoizedFormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  error?: string;
  disabled?: boolean;
}

export const MemoizedFormField = memo(function MemoizedFormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  error,
  disabled = false
}: MemoizedFormFieldProps) {
  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText(text);
    },
    [onChangeText]
  );

  return (
    <React.Fragment>
      {/* Your form field implementation here */}
      <Text>{label}</Text>
      {/* Add your actual form field component */}
    </React.Fragment>
  );
});

/**
 * Memoized button component
 */
export interface MemoizedButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export const MemoizedButton = memo(function MemoizedButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium'
}: MemoizedButtonProps) {
  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      onPress();
    }
  }, [onPress, disabled, loading]);

  return (
    <React.Fragment>
      {/* Your button implementation here */}
      <Text>{title}</Text>
      {/* Add your actual button component */}
    </React.Fragment>
  );
});

/**
 * Memoized card component
 */
export interface MemoizedCardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export const MemoizedCard = memo(function MemoizedCard({
  title,
  subtitle,
  children,
  onPress,
  style
}: MemoizedCardProps) {
  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  return (
    <React.Fragment>
      {/* Your card implementation here */}
      {title && <Text>{title}</Text>}
      {subtitle && <Text>{subtitle}</Text>}
      {children}
      {/* Add your actual card component */}
    </React.Fragment>
  );
});

/**
 * Hook for memoizing API responses
 */
export function useMemoizedApiResponse<T>(
  apiCall: () => Promise<T>,
  deps: React.DependencyList
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const memoizedApiCall = useCallback(apiCall, deps);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await memoizedApiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [memoizedApiCall]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for memoizing filtered data
 */
export function useMemoizedFilter<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  deps: React.DependencyList
) {
  return useMemo(() => {
    return data.filter(filterFn);
  }, [data, filterFn, ...deps]);
}

/**
 * Hook for memoizing sorted data
 */
export function useMemoizedSort<T>(
  data: T[],
  sortFn: (a: T, b: T) => number,
  deps: React.DependencyList
) {
  return useMemo(() => {
    return [...data].sort(sortFn);
  }, [data, sortFn, ...deps]);
}

/**
 * Hook for memoizing computed values
 */
export function useMemoizedValue<T>(
  computeFn: () => T,
  deps: React.DependencyList
): T {
  return useMemo(computeFn, deps);
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = React.useRef(0);
  const lastRenderTime = React.useRef(Date.now());

  React.useEffect(() => {
    renderCount.current += 1;
    const currentTime = Date.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    if (__DEV__) {
      // console.log(`${componentName} rendered ${renderCount.current} times. Time since last render: ${timeSinceLastRender}ms`);
    }
    
    lastRenderTime.current = currentTime;
  });

  return {
    renderCount: renderCount.current,
    timeSinceLastRender: Date.now() - lastRenderTime.current
  };
}

export default {
  withMemo,
  createMemoizedComponent,
  useExpensiveCalculation,
  useStableCallback,
  MemoizedListItem,
  MemoizedList,
  MemoizedFormField,
  MemoizedButton,
  MemoizedCard,
  useMemoizedApiResponse,
  useMemoizedFilter,
  useMemoizedSort,
  useMemoizedValue,
  usePerformanceMonitor,
};
