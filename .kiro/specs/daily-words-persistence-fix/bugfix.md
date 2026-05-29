# Bugfix Requirements Document

## Introduction

修复今日单词持久化问题。当前系统在用户切换页面后，已生成的今日单词会丢失，导致用户需要重新生成单词，且每次生成的单词列表不一致。这严重影响了学习的连续性和用户体验。

本次修复将确保同一天内，如果学习计划没有变更，系统会保持已经生成过的单词列表，只有在新的一天或学习计划变更时才重新生成单词。

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN 用户在当天首次生成单词后切换到其他页面再返回 THEN 系统显示"生成今日单词"按钮，之前生成的单词列表丢失

1.2 WHEN 用户多次点击"生成今日单词"按钮 THEN 系统每次生成不同的单词列表，无法保持一致性

1.3 WHEN 用户刷新页面 THEN 系统无法加载之前生成的今日单词列表

### Expected Behavior (Correct)

2.1 WHEN 用户在当天首次生成单词后切换到其他页面再返回 THEN 系统SHALL自动加载并显示之前生成的单词列表，无需重新生成

2.2 WHEN 用户在同一天内多次访问学习页面且学习计划未变更 THEN 系统SHALL始终显示相同的单词列表

2.3 WHEN 用户刷新页面 THEN 系统SHALL从持久化存储中加载当天已生成的单词列表

2.4 WHEN 用户首次访问当天的学习页面且尚未生成单词 THEN 系统SHALL自动生成并保存当天的单词列表

### Unchanged Behavior (Regression Prevention)

3.1 WHEN 日期变更到新的一天 THEN 系统SHALL CONTINUE TO生成新的单词列表

3.2 WHEN 用户修改学习计划（如每日单词数量） THEN 系统SHALL CONTINUE TO能够生成符合新计划的单词列表

3.3 WHEN 用户标记当天学习完成 THEN 系统SHALL CONTINUE TO正确记录学习进度

3.4 WHEN 用户查看历史单词列表 THEN 系统SHALL CONTINUE TO能够访问之前日期的单词列表
