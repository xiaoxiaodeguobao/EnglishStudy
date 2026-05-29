/**
 * UserSettingsService
 *
 * 管理用户在页面上输入的 AI 配置，持久化到 localStorage。
 * 部署到 GitHub Pages 等静态托管时，无需服务端，用户自行配置 API 密钥。
 */

export type AIProvider = 'openai' | 'claude' | 'deepseek' | 'doubao';

export interface ProviderSettings {
  apiKey: string;
  model: string;
  apiUrl: string;
}

export interface UserSettings {
  aiProvider: AIProvider;
  openai: ProviderSettings;
  claude: ProviderSettings;
  deepseek: ProviderSettings;
  doubao: ProviderSettings;
}

/** 各 provider 的元信息（用于 UI 展示） */
export interface ProviderMeta {
  label: string;
  model: string;
  apiUrl: string;
  keyPlaceholder: string;
  keyHint: string;
  docsUrl: string;
}

export const PROVIDER_DEFAULTS: Record<AIProvider, ProviderMeta> = {
  openai: {
    label: 'OpenAI (GPT)',
    model: 'gpt-3.5-turbo',
    apiUrl: 'https://api.openai.com/v1',
    keyPlaceholder: 'sk-...',
    keyHint: '在 platform.openai.com/api-keys 获取',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  claude: {
    label: 'Anthropic Claude',
    model: 'claude-3-haiku-20240307',
    apiUrl: 'https://api.anthropic.com/v1',
    keyPlaceholder: 'sk-ant-...',
    keyHint: '在 console.anthropic.com 获取',
    docsUrl: 'https://console.anthropic.com/',
  },
  deepseek: {
    label: 'DeepSeek（深度求索）',
    model: 'deepseek-chat',
    apiUrl: 'https://api.deepseek.com',
    keyPlaceholder: 'sk-...',
    keyHint: '在 platform.deepseek.com 获取',
    docsUrl: 'https://platform.deepseek.com/',
  },
  doubao: {
    label: '豆包 Doubao（字节跳动）',
    model: 'doubao-pro-4k',
    apiUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    keyPlaceholder: '输入豆包 API Key',
    keyHint: '在 console.volcengine.com/ark 获取',
    docsUrl: 'https://console.volcengine.com/ark',
  },
};

const STORAGE_KEY = 'vocab_app_user_settings';

export const DEFAULT_SETTINGS: UserSettings = {
  aiProvider: 'openai',
  openai: {
    apiKey: '',
    model: PROVIDER_DEFAULTS.openai.model,
    apiUrl: PROVIDER_DEFAULTS.openai.apiUrl,
  },
  claude: {
    apiKey: '',
    model: PROVIDER_DEFAULTS.claude.model,
    apiUrl: PROVIDER_DEFAULTS.claude.apiUrl,
  },
  deepseek: {
    apiKey: '',
    model: PROVIDER_DEFAULTS.deepseek.model,
    apiUrl: PROVIDER_DEFAULTS.deepseek.apiUrl,
  },
  doubao: {
    apiKey: '',
    model: PROVIDER_DEFAULTS.doubao.model,
    apiUrl: PROVIDER_DEFAULTS.doubao.apiUrl,
  },
};

export class UserSettingsService {
  /** 读取用户设置，不存在则返回默认值 */
  load(): UserSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw) as Partial<UserSettings>;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        openai:   { ...DEFAULT_SETTINGS.openai,   ...(parsed.openai   ?? {}) },
        claude:   { ...DEFAULT_SETTINGS.claude,   ...(parsed.claude   ?? {}) },
        deepseek: { ...DEFAULT_SETTINGS.deepseek, ...(parsed.deepseek ?? {}) },
        doubao:   { ...DEFAULT_SETTINGS.doubao,   ...(parsed.doubao   ?? {}) },
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  /** 保存用户设置 */
  save(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  /** 检查当前选中的 provider 是否已配置 API Key */
  isConfigured(settings?: UserSettings): boolean {
    const s = settings ?? this.load();
    return !!s[s.aiProvider]?.apiKey?.trim();
  }

  /** 获取当前激活 provider 的完整配置 */
  getActiveProviderSettings(settings?: UserSettings): ProviderSettings & { provider: AIProvider } {
    const s = settings ?? this.load();
    return { ...s[s.aiProvider], provider: s.aiProvider };
  }
}

export const userSettingsService = new UserSettingsService();
