/**
 * ContextFilter Component Examples
 * 
 * Demonstrates various usage scenarios for the ContextFilter component.
 */

import React, { useState } from 'react';
import { ContextFilter } from './ContextFilter';
import { ApplicationContext } from '../types/context';

/**
 * Example 1: Basic usage with all contexts
 */
export function BasicContextFilterExample() {
  const [selectedContexts, setSelectedContexts] = useState<ApplicationContext[]>([
    'daily-conversation',
  ]);

  const allContexts: ApplicationContext[] = [
    'daily-conversation',
    'business-communication',
    'academic-writing',
    'technical-documentation',
    'literary-expression',
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">基础用法</h2>
      <ContextFilter
        contexts={allContexts}
        selectedContexts={selectedContexts}
        onSelectionChange={setSelectedContexts}
      />
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">
          已选择: {selectedContexts.length > 0 ? selectedContexts.join(', ') : '无'}
        </p>
      </div>
    </div>
  );
}

/**
 * Example 2: Subset of contexts
 */
export function SubsetContextFilterExample() {
  const [selectedContexts, setSelectedContexts] = useState<ApplicationContext[]>([]);

  const subsetContexts: ApplicationContext[] = [
    'daily-conversation',
    'business-communication',
    'academic-writing',
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">部分场景</h2>
      <p className="text-sm text-gray-600 mb-3">
        只显示日常、商务和学术三个场景
      </p>
      <ContextFilter
        contexts={subsetContexts}
        selectedContexts={selectedContexts}
        onSelectionChange={setSelectedContexts}
      />
    </div>
  );
}

/**
 * Example 3: Pre-selected contexts
 */
export function PreSelectedContextFilterExample() {
  const [selectedContexts, setSelectedContexts] = useState<ApplicationContext[]>([
    'daily-conversation',
    'business-communication',
    'academic-writing',
  ]);

  const allContexts: ApplicationContext[] = [
    'daily-conversation',
    'business-communication',
    'academic-writing',
    'technical-documentation',
    'literary-expression',
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">预选场景</h2>
      <p className="text-sm text-gray-600 mb-3">
        默认选中三个场景
      </p>
      <ContextFilter
        contexts={allContexts}
        selectedContexts={selectedContexts}
        onSelectionChange={setSelectedContexts}
      />
    </div>
  );
}

/**
 * Example 4: With custom styling
 */
export function CustomStyledContextFilterExample() {
  const [selectedContexts, setSelectedContexts] = useState<ApplicationContext[]>([]);

  const allContexts: ApplicationContext[] = [
    'daily-conversation',
    'business-communication',
    'academic-writing',
    'technical-documentation',
    'literary-expression',
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">自定义样式</h2>
      <ContextFilter
        contexts={allContexts}
        selectedContexts={selectedContexts}
        onSelectionChange={setSelectedContexts}
        className="bg-white p-4 rounded-lg shadow-sm"
      />
    </div>
  );
}

/**
 * Example 5: Integrated with filtering logic
 */
export function IntegratedFilteringExample() {
  const [selectedContexts, setSelectedContexts] = useState<ApplicationContext[]>([
    'daily-conversation',
    'business-communication',
  ]);

  const allContexts: ApplicationContext[] = [
    'daily-conversation',
    'business-communication',
    'academic-writing',
    'technical-documentation',
    'literary-expression',
  ];

  // Mock data for demonstration
  const mockExamples = [
    { id: 1, context: 'daily-conversation', text: 'Example 1' },
    { id: 2, context: 'business-communication', text: 'Example 2' },
    { id: 3, context: 'academic-writing', text: 'Example 3' },
    { id: 4, context: 'daily-conversation', text: 'Example 4' },
    { id: 5, context: 'technical-documentation', text: 'Example 5' },
  ];

  const filteredExamples = mockExamples.filter(ex =>
    selectedContexts.length === 0 || selectedContexts.includes(ex.context as ApplicationContext)
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">集成过滤功能</h2>
      <ContextFilter
        contexts={allContexts}
        selectedContexts={selectedContexts}
        onSelectionChange={setSelectedContexts}
      />
      <div className="mt-6">
        <h3 className="text-md font-medium mb-3">过滤结果</h3>
        <div className="space-y-2">
          {filteredExamples.length > 0 ? (
            filteredExamples.map(ex => (
              <div key={ex.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                <span className="text-sm font-medium">{ex.context}</span>
                <p className="text-sm text-gray-600 mt-1">{ex.text}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">没有匹配的例句</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Example 6: All examples in a showcase
 */
export function ContextFilterShowcase() {
  return (
    <div className="space-y-6 p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ContextFilter 组件示例</h1>
      <BasicContextFilterExample />
      <SubsetContextFilterExample />
      <PreSelectedContextFilterExample />
      <CustomStyledContextFilterExample />
      <IntegratedFilteringExample />
    </div>
  );
}
