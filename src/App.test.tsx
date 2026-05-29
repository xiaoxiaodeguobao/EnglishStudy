/**
 * App Component Tests
 * 
 * Tests for the root App component and routing configuration.
 * Requirements: 10.4, 11.1, 11.2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import PlanSetupPage from './pages/PlanSetupPage';
import DailyLearningPage from './pages/DailyLearningPage';
import ReviewPage from './pages/ReviewPage';
import ProgressPage from './pages/ProgressPage';
import App from './App';
import { useLearningPlanStore } from './stores/learningPlanStore';
import { db } from './services/VocabularyDB';

// Helper component to test routes without nesting routers
function TestRouter({ initialRoute }: { initialRoute: string }) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <Layout>
        <Routes>
          <Route path="/" element={<PlanSetupPage />} />
          <Route path="/daily" element={<DailyLearningPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </MemoryRouter>
  );
}

describe('App Component', () => {
  beforeEach(() => {
    // Mock console methods to avoid noise in test output
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the Layout component after initialization', async () => {
    // Requirement 11.1
    render(<App />);
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByText('Vocabulary Learning App')).toBeInTheDocument();
    });
  });

  it('should show loading state during initialization', () => {
    // Requirement 10.4
    render(<App />);
    
    // Check for loading indicator
    expect(screen.getByText('正在加载应用...')).toBeInTheDocument();
  });

  it('should initialize database connection on startup', async () => {
    // Requirement 10.4
    const dbOpenSpy = vi.spyOn(db, 'open');
    
    render(<App />);
    
    await waitFor(() => {
      expect(dbOpenSpy).toHaveBeenCalled();
    });
  });

  it('should load current learning plan on startup', async () => {
    // Requirement 10.4
    const loadCurrentPlanSpy = vi.spyOn(
      useLearningPlanStore.getState(),
      'loadCurrentPlan'
    );
    
    render(<App />);
    
    await waitFor(() => {
      expect(loadCurrentPlanSpy).toHaveBeenCalled();
    });
  });

  it('should handle initialization errors gracefully', async () => {
    // Requirement 10.4
    // Mock database open to fail
    vi.spyOn(db, 'open').mockRejectedValueOnce(new Error('Database error'));
    
    render(<App />);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/无法连接到本地数据库/)).toBeInTheDocument();
    });
  });

  it('should show error message when IndexedDB is not supported', async () => {
    // Requirement 10.4
    // Mock window.indexedDB to be undefined
    const originalIndexedDB = window.indexedDB;
    Object.defineProperty(window, 'indexedDB', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/不支持本地存储功能/)).toBeInTheDocument();
    });
    
    // Restore
    Object.defineProperty(window, 'indexedDB', {
      value: originalIndexedDB,
      writable: true,
      configurable: true,
    });
  });

  it('should render PlanSetupPage at root path /', () => {
    // Requirement 11.1
    render(<TestRouter initialRoute="/" />);
    
    // Check for PlanSetupPage content
    expect(screen.getByText('学习计划设置')).toBeInTheDocument();
  });

  it('should render DailyLearningPage at /daily path', () => {
    // Requirement 11.2
    render(<TestRouter initialRoute="/daily" />);
    
    // Check for DailyLearningPage content
    expect(screen.getByText('今日学习')).toBeInTheDocument();
  });

  it('should render ReviewPage at /review path', () => {
    // Requirement 11.2
    render(<TestRouter initialRoute="/review" />);
    
    // Check for ReviewPage content
    expect(screen.getByText('单词复习')).toBeInTheDocument();
  });

  it('should render ProgressPage at /progress path', () => {
    // Requirement 11.2
    render(<TestRouter initialRoute="/progress" />);
    
    // Check for ProgressPage content - use heading role to be more specific
    expect(screen.getByRole('heading', { name: '学习进度', level: 2 })).toBeInTheDocument();
  });

  it('should redirect unknown paths to root', () => {
    // Requirement 11.1
    render(<TestRouter initialRoute="/unknown-path" />);
    
    // Should redirect to PlanSetupPage
    expect(screen.getByText('学习计划设置')).toBeInTheDocument();
  });

  it('should render navigation links in Layout', async () => {
    // Requirement 11.2
    render(<App />);
    
    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.getByText('Vocabulary Learning App')).toBeInTheDocument();
    });
    
    // Check that all navigation links are present
    expect(screen.getByText('学习计划')).toBeInTheDocument();
    expect(screen.getByText('每日学习')).toBeInTheDocument();
    expect(screen.getByText('学习进度')).toBeInTheDocument();
    expect(screen.getByText('复习')).toBeInTheDocument();
  });
});
