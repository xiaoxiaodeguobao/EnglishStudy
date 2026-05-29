# Data Caching Implementation

## Overview

This document describes the data caching implementation for the Vocabulary Learning App using React Query (@tanstack/react-query).

**Task**: 23.2 实现数据缓存  
**Requirements**: 10.4

## Implementation Summary

### 1. React Query Setup

**File**: `src/lib/queryClient.ts`

Configured QueryClient with the following caching strategies:

- **Default staleTime**: 5 minutes (data is considered fresh)
- **Default gcTime**: 30 minutes (unused data kept in cache)
- **Retry logic**: Up to 2 retries with exponential backoff
- **Refetch behavior**: Disabled on window focus and reconnect by default

### 2. Custom Hooks

#### Word Definitions Hook

**File**: `src/hooks/useWordDefinitions.ts`

- `useWordDefinitions(word, options)`: Fetches and caches word definitions
  - Cache duration: 24 hours (definitions don't change)
  - Retry: 3 attempts
  - Normalizes word to lowercase for consistent cache keys

- `useWordPhonetic(word, options)`: Fetches and caches phonetic transcriptions
  - Cache duration: 24 hours
  - Retry: 1 attempt (not critical)

#### Example Sentences Hook

**File**: `src/hooks/useExampleSentences.ts`

- `useExampleSentences(word, count, options)`: Fetches and caches AI-generated examples
  - Cache duration: 1 hour (AI-generated content can vary)
  - Retry: 2 attempts
  - Reduces API costs while allowing fresh content periodically

#### Daily Words Hook

**File**: `src/hooks/useDailyWords.ts`

- `useDailyWords(date, options)`: Fetches and caches daily word lists
  - Cache duration: 24 hours (daily words don't change once generated)
  - Cache key: Date in YYYY-MM-DD format
  - No retry (loading from local storage)

- `useGenerateDailyWords()`: Mutation for generating new daily words
  - Automatically updates cache after generation
  - Invalidates related queries

- `useAllWordLists(planId, options)`: Fetches all word lists for a plan
  - Cache duration: 10 minutes (can change as user learns)
  - No retry (loading from local storage)

### 3. Integration

**File**: `src/main.tsx`

Wrapped the application with `QueryClientProvider` to enable React Query throughout the app.

```tsx
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

## Benefits

### 1. Reduced API Calls

- Dictionary definitions are cached for 24 hours
- Same word lookups don't trigger new API requests
- AI-generated content is cached for 1 hour

### 2. Improved Performance

- Instant data access from cache
- No loading states for cached data
- Reduced network latency

### 3. Cost Reduction

- Fewer API calls to external services
- Reduced AI service usage (OpenAI/Claude)
- Lower bandwidth consumption

### 4. Better User Experience

- Faster page loads
- Smoother navigation
- Offline-like experience for cached data

## Cache Strategy Details

### Dictionary Service Caching

```typescript
// Word definitions don't change, cache for 24 hours
staleTime: 1000 * 60 * 60 * 24
gcTime: 1000 * 60 * 60 * 24
```

**Rationale**: Dictionary definitions are static and don't change over time. Long cache duration reduces API calls significantly.

### AI Service Caching

```typescript
// AI-generated examples can be cached for 1 hour
staleTime: 1000 * 60 * 60
gcTime: 1000 * 60 * 60 * 2
```

**Rationale**: AI-generated content can vary, but caching for 1 hour balances cost reduction with content freshness.

### Daily Words Caching

```typescript
// Daily words don't change once generated, cache for 24 hours
staleTime: 1000 * 60 * 60 * 24
gcTime: 1000 * 60 * 60 * 24
```

**Rationale**: Once generated, daily word lists are immutable. Long cache duration prevents unnecessary regeneration.

## Usage Examples

### Using Word Definitions Hook

```tsx
import { useWordDefinitions } from '../hooks';

function WordCard({ word }: { word: string }) {
  const { data: definitions, isLoading, error } = useWordDefinitions(word);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {definitions?.map((def, index) => (
        <div key={index}>
          <span>{def.partOfSpeech}</span>
          <p>{def.meaningCN}</p>
        </div>
      ))}
    </div>
  );
}
```

### Using Daily Words Hook

```tsx
import { useDailyWords, useGenerateDailyWords } from '../hooks';

function DailyLearningPage() {
  const today = new Date();
  const { data: wordList, isLoading } = useDailyWords(today);
  const generateWords = useGenerateDailyWords();

  const handleGenerate = () => {
    generateWords.mutate({
      planId: 'plan-1',
      date: today,
      count: 10,
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (!wordList) {
    return <button onClick={handleGenerate}>Generate Words</button>;
  }

  return <div>{/* Display word list */}</div>;
}
```

## Testing

### Test Files

- `src/hooks/useWordDefinitions.test.tsx`: Tests for word definitions caching
- `src/hooks/useDailyWords.test.tsx`: Tests for daily words caching

### Test Coverage

- ✅ Successful data fetching
- ✅ Cache hit behavior (no refetch)
- ✅ Error handling
- ✅ Conditional fetching (enabled option)
- ✅ Cache key normalization
- ✅ Mutation and cache updates

### Running Tests

```bash
npm test -- src/hooks/useWordDefinitions.test.tsx --run
npm test -- src/hooks/useDailyWords.test.tsx --run
```

## Performance Metrics

### Before Caching

- Every word lookup: 1 API call
- Viewing 10 words: 10 API calls
- Revisiting same words: Additional API calls

### After Caching

- First word lookup: 1 API call
- Subsequent lookups (within 24h): 0 API calls
- Viewing 10 words (some cached): 3-5 API calls
- Revisiting same words: 0 API calls

**Estimated API Call Reduction**: 70-80%

## Future Enhancements

1. **Persistent Cache**: Use IndexedDB to persist cache across sessions
2. **Cache Warming**: Preload common words on app startup
3. **Smart Prefetching**: Prefetch related words based on associations
4. **Cache Analytics**: Track cache hit rates and optimize strategies
5. **Offline Support**: Serve cached data when offline

## Configuration

### Adjusting Cache Times

To modify cache durations, edit the respective hook files:

```typescript
// Increase dictionary cache to 7 days
staleTime: 1000 * 60 * 60 * 24 * 7

// Reduce AI cache to 30 minutes
staleTime: 1000 * 60 * 30
```

### Disabling Cache for Development

```typescript
// In src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always fetch fresh data
      gcTime: 0, // Don't keep cache
    },
  },
});
```

## Troubleshooting

### Cache Not Working

1. Check QueryClientProvider is wrapping the app
2. Verify query keys are consistent
3. Check staleTime configuration

### Stale Data Issues

1. Reduce staleTime for affected queries
2. Use `refetchOnWindowFocus: true` for critical data
3. Manually invalidate queries when needed:

```typescript
queryClient.invalidateQueries({ queryKey: ['wordDefinitions'] });
```

### Memory Issues

1. Reduce gcTime to clear cache sooner
2. Limit the number of cached queries
3. Use `queryClient.clear()` to clear all cache

## Conclusion

The React Query caching implementation significantly improves the Vocabulary Learning App's performance and reduces API costs. The strategic cache durations balance data freshness with efficiency, providing users with a fast and responsive experience.
