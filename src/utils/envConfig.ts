/**
 * Environment Configuration Utility
 * 
 * Validates and provides type-safe access to environment variables.
 * Helps developers identify missing or misconfigured API keys.
 */

export interface EnvConfig {
  // AI Service Configuration
  aiProvider: 'openai' | 'claude' | 'doubao' | 'deepseek';
  aiModel?: string; // Generic AI model override
  aiApiUrl?: string; // Generic AI API URL override
  openai: {
    apiKey: string;
    model: string;
    apiUrl: string;
  };
  claude: {
    apiKey: string;
    model: string;
    apiUrl: string;
  };
  doubao: {
    apiKey: string;
    model: string;
    apiUrl: string;
  };
  deepseek: {
    apiKey: string;
    model: string;
    apiUrl: string;
  };
  
  // Dictionary API Configuration
  dictionaryApiUrl: string;
  
  // Application Configuration
  maxApiRetries: number;
  apiTimeout: number;
  debugMode: boolean;
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  return import.meta.env[key] || defaultValue;
}

/**
 * Load user settings from localStorage (set via the Settings page).
 * Returns null if nothing has been saved yet.
 */
function loadUserSettings(): {
  aiProvider?: string;
  openai?: { apiKey?: string; model?: string; apiUrl?: string };
  claude?: { apiKey?: string; model?: string; apiUrl?: string };
  deepseek?: { apiKey?: string; model?: string; apiUrl?: string };
  doubao?: { apiKey?: string; model?: string; apiUrl?: string };
} | null {
  try {
    const raw = localStorage.getItem('vocab_app_user_settings');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Get environment configuration.
 * User settings (from the Settings page) take priority over .env variables.
 */
export function getEnvConfig(): EnvConfig {
  const user = loadUserSettings();

  // Determine active provider: user setting > env var > default
  const aiProvider = (
    user?.aiProvider ||
    getEnvVar('VITE_AI_PROVIDER', 'openai')
  ) as 'openai' | 'claude' | 'doubao' | 'deepseek';

  return {
    aiProvider,
    aiModel: getEnvVar('VITE_AI_MODEL') || undefined,
    aiApiUrl: getEnvVar('VITE_AI_API_URL') || undefined,

    openai: {
      apiKey: user?.openai?.apiKey || getEnvVar('VITE_OPENAI_API_KEY'),
      model:  user?.openai?.model  || getEnvVar('VITE_OPENAI_MODEL', 'gpt-3.5-turbo'),
      apiUrl: user?.openai?.apiUrl || getEnvVar('VITE_OPENAI_API_URL', 'https://api.openai.com/v1'),
    },

    claude: {
      apiKey: user?.claude?.apiKey || getEnvVar('VITE_CLAUDE_API_KEY'),
      model:  user?.claude?.model  || getEnvVar('VITE_CLAUDE_MODEL', 'claude-3-haiku-20240307'),
      apiUrl: user?.claude?.apiUrl || getEnvVar('VITE_CLAUDE_API_URL', 'https://api.anthropic.com/v1'),
    },

    doubao: {
      apiKey: user?.doubao?.apiKey || getEnvVar('VITE_DOUBAO_API_KEY'),
      model:  user?.doubao?.model  || getEnvVar('VITE_DOUBAO_MODEL', 'doubao-pro-4k'),
      apiUrl: user?.doubao?.apiUrl || getEnvVar('VITE_DOUBAO_API_URL', 'https://ark.cn-beijing.volces.com/api/v3'),
    },

    deepseek: {
      apiKey: user?.deepseek?.apiKey || getEnvVar('VITE_DEEPSEEK_API_KEY'),
      model:  user?.deepseek?.model  || getEnvVar('VITE_DEEPSEEK_MODEL', 'deepseek-chat'),
      apiUrl: user?.deepseek?.apiUrl || getEnvVar('VITE_DEEPSEEK_API_URL', 'https://api.deepseek.com'),
    },

    dictionaryApiUrl: getEnvVar(
      'VITE_DICTIONARY_API_URL',
      'https://api.dictionaryapi.dev/api/v2'
    ),

    maxApiRetries: parseInt(getEnvVar('VITE_MAX_API_RETRIES', '3'), 10),
    apiTimeout: parseInt(getEnvVar('VITE_API_TIMEOUT', '30000'), 10),
    debugMode: getEnvVar('VITE_DEBUG_MODE', 'false') === 'true',
  };
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate environment configuration
 * 
 * Checks that required API keys are present and properly formatted.
 */
export function validateEnvConfig(): ValidationResult {
  const config = getEnvConfig();
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate AI provider selection
  if (!['openai', 'claude', 'doubao', 'deepseek'].includes(config.aiProvider)) {
    errors.push(
      `Invalid AI provider: "${config.aiProvider}". Must be "openai", "claude", "doubao", or "deepseek".`
    );
  }
  
  // Validate OpenAI configuration if selected
  if (config.aiProvider === 'openai') {
    if (!config.openai.apiKey) {
      errors.push('OpenAI API key is required when using OpenAI provider.');
    } else if (!config.openai.apiKey.startsWith('sk-')) {
      warnings.push('OpenAI API key should start with "sk-". Please verify your key.');
    }
    
    if (!config.openai.model) {
      warnings.push('OpenAI model not specified. Using default: gpt-3.5-turbo');
    }
  }
  
  // Validate Claude configuration if selected
  if (config.aiProvider === 'claude') {
    if (!config.claude.apiKey) {
      errors.push('Claude API key is required when using Claude provider.');
    } else if (!config.claude.apiKey.startsWith('sk-ant-')) {
      warnings.push('Claude API key should start with "sk-ant-". Please verify your key.');
    }
    
    if (!config.claude.model) {
      warnings.push('Claude model not specified. Using default: claude-3-haiku-20240307');
    }
  }
  
  // Validate Doubao (豆包) configuration if selected
  if (config.aiProvider === 'doubao') {
    if (!config.doubao.apiKey) {
      errors.push('Doubao API key is required when using Doubao provider.');
    }
    
    if (!config.doubao.model) {
      warnings.push('Doubao model not specified. Using default: doubao-pro-4k');
    }
  }
  
  // Validate DeepSeek configuration if selected
  if (config.aiProvider === 'deepseek') {
    if (!config.deepseek.apiKey) {
      errors.push('DeepSeek API key is required when using DeepSeek provider.');
    } else if (!config.deepseek.apiKey.startsWith('sk-')) {
      warnings.push('DeepSeek API key should start with "sk-". Please verify your key.');
    }
    
    if (!config.deepseek.model) {
      warnings.push('DeepSeek model not specified. Using default: deepseek-chat');
    }
  }
  
  // Validate Dictionary API URL
  if (!config.dictionaryApiUrl) {
    errors.push('Dictionary API URL is required.');
  } else if (!config.dictionaryApiUrl.startsWith('http')) {
    errors.push('Dictionary API URL must be a valid HTTP/HTTPS URL.');
  }
  
  // Validate numeric configurations
  if (config.maxApiRetries < 0 || config.maxApiRetries > 10) {
    warnings.push('Max API retries should be between 0 and 10.');
  }
  
  if (config.apiTimeout < 1000 || config.apiTimeout > 120000) {
    warnings.push('API timeout should be between 1000ms and 120000ms.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}



/**
 * Get the active AI API configuration based on selected provider
 */
export function getActiveAIConfig(): {
  apiKey: string;
  model: string;
  apiUrl: string;
  provider: 'openai' | 'claude' | 'doubao' | 'deepseek';
} {
  const config = getEnvConfig();
  
  // Use generic overrides if provided, otherwise use provider-specific config
  if (config.aiProvider === 'claude') {
    return {
      apiKey: config.claude.apiKey,
      model: config.aiModel || config.claude.model,
      apiUrl: config.aiApiUrl || config.claude.apiUrl,
      provider: 'claude',
    };
  }
  
  if (config.aiProvider === 'doubao') {
    return {
      apiKey: config.doubao.apiKey,
      model: config.aiModel || config.doubao.model,
      apiUrl: config.aiApiUrl || config.doubao.apiUrl,
      provider: 'doubao',
    };
  }
  
  if (config.aiProvider === 'deepseek') {
    return {
      apiKey: config.deepseek.apiKey,
      model: config.aiModel || config.deepseek.model,
      apiUrl: config.aiApiUrl || config.deepseek.apiUrl,
      provider: 'deepseek',
    };
  }
  
  return {
    apiKey: config.openai.apiKey,
    model: config.aiModel || config.openai.model,
    apiUrl: config.aiApiUrl || config.openai.apiUrl,
    provider: 'openai',
  };
}

// Export singleton config instance
export const envConfig = getEnvConfig();
