#!/usr/bin/env pwsh
# Script to run bug condition exploration test

$env:CI = "true"
npx vitest run --reporter=verbose --no-file-parallelism src/pages/DailyLearningPage.bugCondition.test.tsx
