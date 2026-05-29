/**
 * SettingsPage
 *
 * 用户在此页面选择 AI 服务商并输入 API 密钥。
 * 配置保存在浏览器 localStorage，无需服务端。
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Key, ExternalLink, CheckCircle, AlertCircle, Eye, EyeOff, Save } from 'lucide-react';
import {
  userSettingsService,
  PROVIDER_DEFAULTS,
  DEFAULT_SETTINGS,
  type UserSettings,
  type AIProvider,
} from '../services/UserSettingsService';

const PROVIDERS: AIProvider[] = ['openai', 'claude', 'deepseek', 'doubao'];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSettings(userSettingsService.load());
  }, []);

  const activeProvider = settings.aiProvider;
  const activeMeta = PROVIDER_DEFAULTS[activeProvider];
  const activeProviderSettings = settings[activeProvider];

  function handleProviderChange(provider: AIProvider) {
    setSettings(prev => ({ ...prev, aiProvider: provider }));
    setSaved(false);
    setError('');
  }

  function handleFieldChange(field: 'apiKey' | 'model' | 'apiUrl', value: string) {
    setSettings(prev => ({
      ...prev,
      [activeProvider]: {
        ...prev[activeProvider],
        [field]: value,
      },
    }));
    setSaved(false);
    setError('');
  }

  function handleSave() {
    if (!activeProviderSettings.apiKey.trim()) {
      setError('请输入 API 密钥');
      return;
    }
    userSettingsService.save(settings);
    setSaved(true);
    setError('');
    // 短暂提示后跳转
    setTimeout(() => navigate('/'), 1200);
  }

  function handleReset() {
    const fresh = { ...DEFAULT_SETTINGS };
    setSettings(fresh);
    userSettingsService.save(fresh);
    setSaved(false);
    setError('');
  }

  const isConfigured = userSettingsService.isConfigured(settings);

  return (
    <div className="max-w-2xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Settings className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API 设置</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            配置 AI 服务商和密钥，数据仅保存在您的浏览器本地
          </p>
        </div>
      </div>

      {/* 当前状态提示 */}
      {isConfigured ? (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-6 text-sm text-green-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>已配置 <strong>{activeMeta.label}</strong>，可以正常使用 AI 功能</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6 text-sm text-amber-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>尚未配置 API 密钥，请选择服务商并填写密钥后保存</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Step 1: 选择 AI 服务商 */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            第一步：选择 AI 服务商
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROVIDERS.map(provider => {
              const meta = PROVIDER_DEFAULTS[provider];
              const isActive = activeProvider === provider;
              const hasKey = !!settings[provider].apiKey.trim();
              return (
                <button
                  key={provider}
                  onClick={() => handleProviderChange(provider)}
                  className={`
                    relative flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all
                    ${isActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                    ${isActive ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{meta.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{meta.model}</div>
                  </div>
                  {hasKey && (
                    <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: 填写 API 密钥 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              第二步：填写 {activeMeta.label} 密钥
            </h2>
            <a
              href={activeMeta.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="w-3 h-3" />
              获取密钥
            </a>
          </div>

          {/* API Key 输入 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Key className="inline w-3.5 h-3.5 mr-1 text-gray-400" />
              API 密钥 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={activeProviderSettings.apiKey}
                onChange={e => handleFieldChange('apiKey', e.target.value)}
                placeholder={activeMeta.keyPlaceholder}
                className="w-full pr-10 pl-3 py-2.5 border border-gray-300 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  font-mono placeholder:font-sans"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-500">{activeMeta.keyHint}</p>
          </div>

          {/* 高级选项：Model 和 API URL */}
          <details className="group">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 select-none list-none flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
              高级选项（自定义模型和 API 地址）
            </summary>
            <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">模型名称</label>
                <input
                  type="text"
                  value={activeProviderSettings.model}
                  onChange={e => handleFieldChange('model', e.target.value)}
                  placeholder={activeMeta.model}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">API 地址</label>
                <input
                  type="text"
                  value={activeProviderSettings.apiUrl}
                  onChange={e => handleFieldChange('apiUrl', e.target.value)}
                  placeholder={activeMeta.apiUrl}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
                <p className="mt-1 text-xs text-gray-400">
                  使用 OpenAI 兼容接口的第三方服务时可修改此地址
                </p>
              </div>
            </div>
          </details>
        </div>

        {/* 操作按钮 */}
        <div className="p-6 bg-gray-50 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
          >
            清除所有配置
          </button>
          <div className="flex items-center gap-3">
            {error && (
              <span className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </span>
            )}
            {saved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                已保存，跳转中…
              </span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium
                rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              <Save className="w-4 h-4" />
              保存设置
            </button>
          </div>
        </div>
      </div>

      {/* 安全说明 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          🔒 <strong>隐私说明：</strong>您的 API 密钥仅保存在本浏览器的 localStorage 中，
          不会上传到任何服务器。清除浏览器数据后需重新配置。
          请勿在公共电脑上保存密钥。
        </p>
      </div>
    </div>
  );
}
