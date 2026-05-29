/**
 * App Component
 * 
 * Root application component with routing configuration.
 * Sets up routes for all pages and wraps them with Layout.
 * Includes application initialization logic and global error boundary.
 * Requirements: 10.4, 11.1, 11.2
 */

import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, Component, ReactNode, lazy, Suspense } from 'react';
import { Layout } from './components/Layout';
import { ErrorMessage } from './components/ErrorMessage';
import { useLearningPlanStore } from './stores/learningPlanStore';
import { db } from './services/VocabularyDB';

// Lazy load page components for code splitting (Requirement 11.1, 11.2)
const PlanSetupPage = lazy(() => import('./pages/PlanSetupPage'));
const DailyLearningPage = lazy(() => import('./pages/DailyLearningPage'));
const ReviewPage = lazy(() => import('./pages/ReviewPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

/**
 * Global Error Boundary Component
 * Catches and displays errors from any component in the tree
 * Requirement: 11.1
 */
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <ErrorMessage
              message={this.state.error?.message || '应用程序遇到了一个错误'}
              onRetry={this.handleReset}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * App Initialization Component
 * Handles application startup logic
 * Requirements: 10.4, 11.1
 */
function AppInitializer({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const loadCurrentPlan = useLearningPlanStore((state) => state.loadCurrentPlan);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Check if IndexedDB storage is available (Requirement 10.4)
        if (!window.indexedDB) {
          throw new Error('您的浏览器不支持本地存储功能，请使用现代浏览器访问此应用');
        }

        // Test database connection
        try {
          await db.open();
          console.info('[App] IndexedDB connection established');
        } catch (dbError) {
          console.error('[App] Failed to open database:', dbError);
          throw new Error('无法连接到本地数据库，请检查浏览器设置');
        }

        // Load current learning plan (Requirement 10.4)
        try {
          await loadCurrentPlan();
          console.info('[App] Current learning plan loaded');
        } catch (planError) {
          console.warn('[App] Failed to load current plan:', planError);
          // Not a critical error - user can create a new plan
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('[App] Initialization failed:', error);
        setInitError(
          error instanceof Error ? error.message : '应用初始化失败，请刷新页面重试'
        );
      }
    }

    initializeApp();
  }, [loadCurrentPlan]);

  // Show loading state during initialization
  if (!isInitialized && !initError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">正在加载应用...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ErrorMessage
            message={initError}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  // Render children once initialized
  return <>{children}</>;
}

/**
 * Loading Fallback Component
 * Displayed while lazy-loaded components are being fetched
 * Requirement: 11.1, 11.2
 */
function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <p className="text-gray-600 text-sm">加载中...</p>
      </div>
    </div>
  );
}

/**
 * Main App Component
 * Requirements: 10.4, 11.1, 11.2
 */
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppInitializer>
          <Layout>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* Route: / - Plan Setup Page (Requirement 11.1) */}
                <Route path="/" element={<PlanSetupPage />} />
                
                {/* Route: /daily - Daily Learning Page (Requirement 11.2) */}
                <Route path="/daily" element={<DailyLearningPage />} />
                
                {/* Route: /review - Review Page (Requirement 11.2) */}
                <Route path="/review" element={<ReviewPage />} />
                
                {/* Route: /progress - Progress Page (Requirement 11.2) */}
                <Route path="/progress" element={<ProgressPage />} />

                {/* Route: /settings - API Settings Page */}
                <Route path="/settings" element={<SettingsPage />} />
                
                {/* Catch-all route - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </AppInitializer>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
