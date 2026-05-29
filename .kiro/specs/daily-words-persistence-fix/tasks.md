# Implementation Plan

## Phase 1: Bug Condition Exploration (BEFORE Fix)

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Daily Words Not Auto-Generated on First Visit
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases - first page visit with no persisted words
  - Test implementation details from Bug Condition in design:
    - User visits daily learning page for a date with no persisted word list
    - Valid learning plan exists
    - System should automatically generate and persist words
    - System should display words without manual button click
  - The test assertions should match the Expected Behavior Properties from design:
    - Assert words are automatically generated
    - Assert words are persisted to storage
    - Assert words are displayed to user
    - Assert no manual "生成今日单词" button click is required
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found:
    - Words are NOT automatically generated on first visit
    - "生成今日单词" button is displayed instead
    - Manual user action is required
    - Words may be lost after navigation or refresh
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

## Phase 2: Preservation Property Tests (BEFORE Fix)

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Current-Day Functionality Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - Date changes to new day trigger new word generation
    - Learning plan modifications work correctly
    - Progress tracking (marking days complete) works correctly
    - Historical word list access works correctly
    - Navigation to other pages works correctly
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - Test 1: Date change to new day generates new words (not same words)
    - Test 2: Learning plan modifications allow new word generation with updated parameters
    - Test 3: Progress tracking continues to work (mark complete, view progress)
    - Test 4: Historical word lists from previous dates remain accessible
    - Test 5: Navigation to other pages (Progress, Review, Plan Setup) works correctly
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

## Phase 3: Implementation

- [x] 3. Fix for daily words persistence issue

  - [x] 3.1 Add auto-generation logic to DailyLearningPage
    - Add new `useEffect` hook that monitors when:
      - `currentPlan` exists (not null)
      - `currentWordList` is null (no words in storage)
      - `loading` is false (not currently loading)
    - When conditions are met, automatically call `generateNewWords`
    - Implement ref-based generation guard to prevent duplicate calls during React strict mode
    - Add proper error handling for auto-generation failures
    - Ensure loading state reflects both load and auto-generation operations
    - _Bug_Condition: isBugCondition(input) where input.currentPlan !== null AND NOT wordListExistsInStorage(input.date, input.currentPlan.id) AND NOT autoGenerationTriggered(input.date)_
    - _Expected_Behavior: Words are automatically generated, persisted to storage, and displayed without manual button click_
    - _Preservation: Date changes continue to trigger new word generation; plan modifications continue to work; progress tracking continues to work; historical access continues to work_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.2 Improve state synchronization in dailyWordsStore
    - Add `isGenerating` flag to distinguish between loading and generating
    - Ensure store properly resets state after errors
    - Improve error recovery to allow retry operations
    - Ensure Zustand store and React Query cache remain synchronized
    - _Bug_Condition: State synchronization issues between store and cache_
    - _Expected_Behavior: Store and cache remain synchronized after generation_
    - _Preservation: All existing store operations continue to work_
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Enhance useDailyWords hook cache management
    - Improve cache invalidation when new words are generated
    - Add refetch trigger after generation completes
    - Ensure React Query cache properly updates with latest data
    - Verify 24-hour cache staleTime works correctly with auto-generation
    - _Bug_Condition: React Query cache not properly updated after generation_
    - _Expected_Behavior: Cache is properly invalidated and updated with latest data_
    - _Preservation: Existing cache behavior for historical dates unchanged_
    - _Requirements: 2.2, 2.3_

  - [x] 3.4 Update loading state management
    - Ensure loading state properly reflects both load and auto-generation
    - Prevent race conditions during auto-generation
    - Add proper loading indicators for auto-generation vs manual generation
    - Prevent UI flicker during state transitions
    - _Bug_Condition: Loading state not properly managed during auto-generation_
    - _Expected_Behavior: Loading state accurately reflects current operation_
    - _Preservation: Existing loading behavior for manual generation unchanged_
    - _Requirements: 2.1, 2.4_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Daily Words Auto-Generated on First Visit
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify all assertions pass:
      - Words are automatically generated on first visit
      - Words are persisted to storage
      - Words are displayed to user
      - No manual button click required
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Current-Day Functionality Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Verify all preservation tests pass:
      - Date changes still trigger new word generation
      - Plan modifications still work correctly
      - Progress tracking still works correctly
      - Historical access still works correctly
      - Navigation still works correctly
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

## Phase 4: Integration Testing

- [x] 4. Integration tests for complete user flows

  - [x] 4.1 Test full flow: first visit → auto-generate → navigate → return
    - Visit daily learning page for first time on a date
    - Verify words are automatically generated and displayed
    - Navigate to Progress page
    - Return to daily learning page
    - Verify same words are loaded from storage and displayed
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 4.2 Test full flow: first visit → auto-generate → refresh
    - Visit daily learning page for first time on a date
    - Verify words are automatically generated and displayed
    - Refresh browser
    - Verify same words are loaded from storage and displayed
    - _Requirements: 2.1, 2.3_

  - [x] 4.3 Test full flow: generate → change plan → revisit same date
    - Visit daily learning page and auto-generate words
    - Change learning plan (e.g., words per day)
    - Visit daily learning page for same date again
    - Verify original words are still displayed (plan change doesn't affect already-generated days)
    - _Requirements: 2.2, 3.2_

  - [x] 4.4 Test full flow: day 1 → day 2 new words
    - Visit daily learning page on day 1, auto-generate words
    - Visit daily learning page on day 2 (new day)
    - Verify new words are generated for day 2 (not same as day 1)
    - _Requirements: 2.2, 3.1_

  - [x] 4.5 Test error recovery flow
    - Simulate auto-generation failure (e.g., network error)
    - Verify error is displayed to user
    - Retry generation
    - Verify retry succeeds and words are displayed
    - _Requirements: 2.1, 2.4_

- [x] 5. Checkpoint - Ensure all tests pass
  - Verify all bug condition tests pass (confirms fix works)
  - Verify all preservation tests pass (confirms no regressions)
  - Verify all integration tests pass (confirms complete user flows work)
  - Run full test suite to ensure no unexpected failures
  - If any issues arise, ask the user for guidance
