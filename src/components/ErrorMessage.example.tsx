/**
 * ErrorMessage Component Usage Examples
 * 
 * This file demonstrates various use cases for the ErrorMessage component.
 * These examples can be used as reference for implementing error handling.
 */

import { ErrorMessage } from './ErrorMessage';

/**
 * Example 1: Network Error with Retry
 * Use case: API request failed, user can retry
 */
export function NetworkErrorExample() {
  const handleRetry = () => {
    console.log('Retrying network request...');
    // Implement retry logic here
  };

  return (
    <ErrorMessage
      message="无法获取单词解释"
      errorType="network"
      details="网络连接出现问题,请检查您的网络设置。"
      onRetry={handleRetry}
    />
  );
}

/**
 * Example 2: Validation Error without Retry
 * Use case: User input validation failed
 */
export function ValidationErrorExample() {
  return (
    <ErrorMessage
      message="请输入1到365之间的数字"
      errorType="validation"
      showRetry={false}
    />
  );
}

/**
 * Example 3: Storage Error with Retry
 * Use case: Failed to save data to IndexedDB
 */
export function StorageErrorExample() {
  const handleRetry = () => {
    console.log('Retrying save operation...');
    // Implement retry logic here
  };

  return (
    <ErrorMessage
      message="无法保存学习计划"
      errorType="storage"
      details="您的浏览器存储空间已满。请清理一些旧数据或导出数据后重试。"
      onRetry={handleRetry}
    />
  );
}

/**
 * Example 4: Generation Error with Retry
 * Use case: AI service failed to generate words
 */
export function GenerationErrorExample() {
  const handleRetry = () => {
    console.log('Retrying word generation...');
    // Implement retry logic here
  };

  return (
    <ErrorMessage
      message="系统无法生成今天的单词列表"
      errorType="generation"
      onRetry={handleRetry}
    />
  );
}

/**
 * Example 5: Data Integrity Error
 * Use case: Detected inconsistent data
 */
export function DataIntegrityErrorExample() {
  return (
    <ErrorMessage
      message="检测到数据完整性问题"
      errorType="data_integrity"
      details="学习计划数据与进度数据不一致。"
    />
  );
}

/**
 * Example 6: Generic Error
 * Use case: Unknown error type
 */
export function GenericErrorExample() {
  const handleRetry = () => {
    console.log('Retrying operation...');
  };

  return (
    <ErrorMessage
      message="操作失败,请重试"
      onRetry={handleRetry}
    />
  );
}
