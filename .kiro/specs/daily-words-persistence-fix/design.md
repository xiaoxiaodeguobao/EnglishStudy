# Daily Words Persistence Fix - Bugfix Design

## Overview

This bugfix addresses a critical persistence issue where daily generated words are lost when users navigate between pages or refresh the browser. Currently, the `DailyLearningPage` component loads words from storage but does not automatically generate and persist them on first visit. This forces users to manually click "生成今日单词" each time they visit the page, and if they navigate away before the words are saved, the words are lost entirely.

The fix will implement automatic word generation and persistence on first page load for each day, ensuring that:
1. Words are automatically generated and saved when a user first visits the learning page for a given day
2. Subsequent visits to the page load the persisted words from storage
3. Words remain consistent throughout the day unless the learning plan changes
4. Page navigation and browser refresh do not cause word loss

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a user visits the daily learning page for a date that has no persisted word list, and the system fails to automatically generate and persist words
- **Property (P)**: The desired behavior - the system should automatically generate, persist, and display daily words on first visit, and load persisted words on subsequent visits
- **Preservation**: Existing behaviors that must remain unchanged - date changes trigger new word generation, plan changes allow new word generation, progress tracking continues to work, historical word lists remain accessible
- **useDailyWords**: The React Query hook in `src/hooks/useDailyWords.ts` that fetches daily word lists from storage
- **DailyLearningPage**: The page component in `src/pages/DailyLearningPage.tsx` that displays daily words and handles user interactions
- **dailyWordsStore**: The Zustand store in `src/stores/dailyWordsStore.ts` that manages daily word list state
- **StorageService**: The service in `src/services/StorageService.ts` that handles persistence operations using IndexedDB
- **WordGeneratorService**: The service in `src/services/WordGeneratorService.ts` that generates daily word lists with associations

## Bug Details

### Bug Condition

The bug manifests when a user visits the daily learning page and no word list exists in storage for the current date. The system displays a "生成今日单词" button and waits for manual user action, but if the user navigates away before clicking the button or after clicking but before persistence completes, the words are lost. Additionally, even after generation, if the user switches pages and returns, the system may fail to load the persisted words correctly.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { date: Date, currentPlan: LearningPlan | null, navigationEvent: boolean }
  OUTPUT: boolean
  
  RETURN (input.currentPlan !== null)
         AND (NOT wordListExistsInStorage(input.date, input.currentPlan.id))
         AND (NOT autoGenerationTriggered(input.date))
         AND (input.navigationEvent OR pageLoadEvent)
END FUNCTION
```

### Examples

- **Example 1**: User visits daily learning page on 2024-01-15 for the first time. No words exist in storage. System shows "生成今日单词" button. User clicks button, words are generated. User navigates to Progress page. User returns to daily learning page. **Expected**: Words from earlier generation are displayed. **Actual**: "生成今日单词" button is shown again, previous words are lost.

- **Example 2**: User visits daily learning page on 2024-01-16. No words exist for this date. System shows "生成今日单词" button. User navigates away without clicking. User returns to daily learning page. **Expected**: System automatically generates and displays words. **Actual**: "生成今日单词" button is shown again, requiring manual action.

- **Example 3**: User refreshes the browser on daily learning page after generating words. **Expected**: Previously generated words are loaded and displayed. **Actual**: "生成今日单词" button may appear, or words may fail to load.

- **Edge Case**: User has a learning plan with 10 words per day. User generates words for 2024-01-15. User changes plan to 15 words per day. User visits daily learning page for 2024-01-15 again. **Expected**: Original 10 words are displayed (plan change doesn't affect already-generated days). **Actual**: System behavior is inconsistent.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Date changes (new day) must continue to trigger generation of new word lists
- Learning plan changes must continue to allow generation of new word lists with updated parameters
- Progress tracking (marking days complete) must continue to work correctly
- Historical word list access must remain functional

**Scope:**
All inputs that do NOT involve the current day's word list persistence should be completely unaffected by this fix. This includes:
- Navigation to other pages (Progress, Review, Plan Setup)
- Viewing historical word lists from previous dates
- Modifying learning plan settings
- Progress tracking and statistics

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Missing Auto-Generation Logic**: The `DailyLearningPage` component loads words using `loadDailyWords(currentDate)` but does not automatically trigger generation when no words exist. The component shows a manual "生成今日单词" button instead of automatically generating words on first visit.

2. **Incomplete Persistence Flow**: The `useDailyWordsStore` has separate `loadDailyWords` and `generateNewWords` actions, but there's no automatic fallback from load to generate. When `loadDailyWords` returns null (no words in storage), the component doesn't automatically call `generateNewWords`.

3. **React Query Cache Issues**: The `useDailyWords` hook uses React Query with a 24-hour cache, but the cache may not be properly invalidated or updated when words are generated, leading to stale data or failed loads on subsequent visits.

4. **State Synchronization Issues**: The Zustand store (`dailyWordsStore`) and React Query cache may become out of sync, causing the component to display incorrect state (showing the generate button when words actually exist in storage).

## Correctness Properties

Property 1: Bug Condition - Automatic Word Generation and Persistence

_For any_ page visit where the current date has no persisted word list and a valid learning plan exists, the system SHALL automatically generate a new word list, persist it to storage, and display it to the user without requiring manual button clicks.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation - Existing Functionality Unchanged

_For any_ interaction that does NOT involve the current day's word list (date changes, plan modifications, progress tracking, historical access), the system SHALL produce exactly the same behavior as the original code, preserving all existing functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/pages/DailyLearningPage.tsx`

**Component**: `DailyLearningPage`

**Specific Changes**:

1. **Add Auto-Generation Effect**: Add a new `useEffect` hook that monitors when `currentPlan` exists, `currentWordList` is null, and `loading` is false. When these conditions are met, automatically call `generateNewWords` to create and persist the word list.

2. **Improve Loading State Management**: Ensure the loading state properly reflects both the load operation and the auto-generation operation, preventing race conditions and duplicate generations.

3. **Add Generation Guard**: Implement a ref-based guard to prevent duplicate auto-generation calls during React's strict mode double-rendering or rapid re-renders.

4. **Update Error Handling**: Ensure errors during auto-generation are properly caught and displayed, with a retry mechanism that doesn't cause infinite loops.

5. **Synchronize State**: Ensure the Zustand store state and React Query cache remain synchronized after auto-generation completes.

**File**: `src/hooks/useDailyWords.ts`

**Hook**: `useDailyWords`

**Specific Changes**:

1. **Improve Cache Invalidation**: Ensure the React Query cache is properly invalidated and updated when new words are generated via the mutation.

2. **Add Refetch Trigger**: Provide a mechanism to refetch daily words after generation completes, ensuring the latest data is always displayed.

**File**: `src/stores/dailyWordsStore.ts`

**Store**: `useDailyWordsStore`

**Specific Changes**:

1. **Add Generation Status Tracking**: Add a `isGenerating` flag to distinguish between loading existing words and generating new words, preventing UI flicker.

2. **Improve Error Recovery**: Ensure the store properly resets state after errors, allowing retry operations to succeed.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate page visits with no persisted words and verify that words are NOT automatically generated on unfixed code. Also test navigation scenarios where words are lost. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **First Visit No Auto-Generation Test**: Visit daily learning page for a date with no persisted words. Assert that no automatic generation occurs and the "生成今日单词" button is displayed. (will fail on unfixed code - demonstrates missing auto-generation)

2. **Navigation Word Loss Test**: Generate words manually, navigate to another page, return to daily learning page. Assert that words are NOT automatically loaded and the generate button appears again. (will fail on unfixed code - demonstrates persistence/loading issue)

3. **Refresh Word Loss Test**: Generate words manually, refresh the browser. Assert that words are NOT loaded from storage. (will fail on unfixed code - demonstrates cache/storage sync issue)

4. **Multiple Generation Inconsistency Test**: Click "生成今日单词" button multiple times. Assert that different word lists are generated each time. (will fail on unfixed code - demonstrates lack of persistence check before generation)

**Expected Counterexamples**:
- Words are not automatically generated on first page visit
- Words are lost after navigation or refresh
- Multiple generations produce inconsistent results
- Possible causes: missing auto-generation logic, incomplete persistence flow, cache synchronization issues

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := DailyLearningPage_fixed(input)
  ASSERT expectedBehavior(result)
  ASSERT wordsAutomaticallyGenerated(result)
  ASSERT wordsPersistedToStorage(result)
  ASSERT wordsDisplayedToUser(result)
END FOR
```

**Test Cases**:
1. **Auto-Generation on First Visit**: Visit daily learning page for a date with no persisted words. Verify that words are automatically generated, persisted, and displayed without manual button click.

2. **Persistence After Navigation**: Generate words (automatically or manually), navigate away, return to page. Verify that the same words are loaded from storage and displayed.

3. **Persistence After Refresh**: Generate words, refresh browser. Verify that words are loaded from storage and displayed correctly.

4. **Consistent Word Lists**: Visit page multiple times on the same day. Verify that the same word list is displayed each time (no regeneration).

5. **Plan Change Handling**: Generate words for a date, change learning plan, visit the same date again. Verify that original words are still displayed (plan change doesn't affect already-generated days).

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT DailyLearningPage_original(input) = DailyLearningPage_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for date changes, plan modifications, and progress tracking, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Date Change Preservation**: Observe that changing to a new day triggers new word generation on unfixed code. Write test to verify this continues after fix - new days should still generate new words.

2. **Plan Modification Preservation**: Observe that modifying the learning plan (words per day, difficulty) works correctly on unfixed code. Write test to verify plan changes continue to work after fix.

3. **Progress Tracking Preservation**: Observe that marking days complete and viewing progress works correctly on unfixed code. Write test to verify progress tracking continues to work after fix.

4. **Historical Access Preservation**: Observe that viewing word lists from previous dates works correctly on unfixed code. Write test to verify historical access continues to work after fix.

5. **Navigation Preservation**: Observe that navigating to other pages (Progress, Review, Plan Setup) works correctly on unfixed code. Write test to verify navigation continues to work after fix.

### Unit Tests

- Test auto-generation logic triggers when no words exist for current date
- Test auto-generation does not trigger when words already exist
- Test loading persisted words from storage on page visit
- Test error handling during auto-generation
- Test generation guard prevents duplicate generations
- Test state synchronization between Zustand store and React Query cache

### Property-Based Tests

- Generate random dates and verify that first visit always auto-generates words
- Generate random navigation sequences and verify words persist correctly
- Generate random learning plan configurations and verify persistence works for all configurations
- Test that all non-current-day interactions produce identical behavior before and after fix

### Integration Tests

- Test full user flow: visit page → auto-generate words → navigate away → return → verify same words displayed
- Test full user flow: visit page → auto-generate words → refresh browser → verify same words displayed
- Test full user flow: visit page → auto-generate words → change plan → visit same date → verify original words displayed
- Test full user flow: visit page on day 1 → auto-generate → visit page on day 2 → verify new words generated
- Test error recovery: auto-generation fails → error displayed → retry succeeds → words displayed
