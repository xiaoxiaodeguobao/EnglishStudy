/**
 * Layout Component
 *
 * Main layout container with header and navigation.
 * Requirements: 11.1, 11.2, 11.3
 */

import { Link, useLocation } from 'react-router-dom';
import { Settings, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { userSettingsService } from '../services/UserSettingsService';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isConfigured, setIsConfigured] = useState(true);

  // 每次路由变化时重新检查配置状态（用户可能刚从设置页保存）
  useEffect(() => {
    setIsConfigured(userSettingsService.isConfigured());
  }, [location.pathname]);

  const isSettingsPage = location.pathname === '/settings';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">
              单词学习
            </h1>
            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition"
              >
                学习计划
              </Link>
              <Link
                to="/daily"
                className="px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition"
              >
                每日学习
              </Link>
              <Link
                to="/progress"
                className="px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition"
              >
                学习进度
              </Link>
              <Link
                to="/review"
                className="px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition"
              >
                复习
              </Link>

              {/* 设置入口 — 未配置时显示橙色警告角标 */}
              <Link
                to="/settings"
                className={`relative ml-2 flex items-center gap-1.5 px-3 py-2 text-sm rounded transition
                  ${isSettingsPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                <Settings className="w-4 h-4" />
                <span>API 设置</span>
                {!isConfigured && !isSettingsPage && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
                )}
              </Link>
            </nav>
          </div>
        </div>

        {/* 未配置时的全局提示条（设置页本身不显示） */}
        {!isConfigured && !isSettingsPage && (
          <div className="bg-amber-50 border-t border-amber-200 px-4 py-2">
            <div className="container mx-auto flex items-center gap-2 text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                尚未配置 AI API 密钥，AI 功能将无法使用。
              </span>
              <Link
                to="/settings"
                className="ml-1 font-medium underline underline-offset-2 hover:text-amber-900"
              >
                立即配置 →
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
