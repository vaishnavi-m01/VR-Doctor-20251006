import React, { useState, useCallback, useMemo } from 'react';
import { View, TextInput, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDebouncedCallback } from '../utils/debounce';
import { withMemo } from '../utils/memoization';
import { LoadingComponent, NoDataFound } from './ErrorComponents';

interface SearchWithDebounceProps<T> {
  onSearch: (query: string) => Promise<T[]>;
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  placeholder?: string;
  debounceDelay?: number;
  minQueryLength?: number;
  emptyMessage?: string;
  loadingMessage?: string;
  showClearButton?: boolean;
  onItemSelect?: (item: T) => void;
  onClear?: () => void;
  style?: any;
}

function SearchWithDebounce<T>({
  onSearch,
  renderItem,
  keyExtractor,
  placeholder = "Search...",
  debounceDelay = 300,
  minQueryLength = 2,
  emptyMessage = "No results found",
  loadingMessage = "Searching...",
  showClearButton = true,
  onItemSelect,
  onClear,
  style
}: SearchWithDebounceProps<T>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(
    useCallback(async (searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setError(null);
      setHasSearched(true);

      try {
        const searchResults = await onSearch(searchQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, [onSearch, minQueryLength]),
    debounceDelay
  );

  // Handle input change
  const handleInputChange = useCallback((text: string) => {
    setQuery(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  // Handle clear
  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setHasSearched(false);
    onClear?.();
  }, [onClear]);

  // Handle item selection
  const handleItemSelect = useCallback((item: T) => {
    onItemSelect?.(item);
  }, [onItemSelect]);

  // Memoized render item
  const memoizedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      const element = renderItem(item, index);
      
      return onItemSelect ? (
        <TouchableOpacity onPress={() => handleItemSelect(item)}>
          {element}
        </TouchableOpacity>
      ) : element;
    },
    [renderItem, onItemSelect, handleItemSelect]
  );

  // Memoized key extractor
  const memoizedKeyExtractor = useCallback(
    (item: T, index: number) => keyExtractor(item, index),
    [keyExtractor]
  );

  // Render content based on state
  const renderContent = () => {
    if (isSearching) {
      return <LoadingComponent message={loadingMessage} size="small" />;
    }

    if (error) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={{ color: '#ef4444', marginTop: 8, textAlign: 'center' }}>
            {error}
          </Text>
        </View>
      );
    }

    if (hasSearched && results.length === 0) {
      return (
        <NoDataFound
          title="No Results"
          message={emptyMessage}
          icon="search-outline"
        />
      );
    }

    if (results.length > 0) {
      return (
        <View style={{ maxHeight: 300 }}>
          {results.map((item, index) => memoizedRenderItem({ item, index }))}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[{ flex: 1 }, style]}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="search-outline" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.textInput}
            placeholder={placeholder}
            value={query}
            onChangeText={handleInputChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {showClearButton && query.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      <View style={styles.resultsContainer}>
        {renderContent()}
      </View>
    </View>
  );
}

// Memoized version
const MemoizedSearchWithDebounce = withMemo(SearchWithDebounce);

// Styles
const styles = {
  searchContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  resultsContainer: {
    flex: 1,
  },
};

export default MemoizedSearchWithDebounce;
