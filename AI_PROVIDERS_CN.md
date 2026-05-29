# 中国大陆 AI 服务配置指南

本应用支持多个 AI 服务提供商，包括在中国大陆可用的豆包（Doubao）和 DeepSeek。

## 支持的 AI 服务提供商

### 1. OpenAI (国际)
- **适用地区**: 全球（中国大陆需要代理）
- **官网**: https://platform.openai.com/
- **获取 API Key**: https://platform.openai.com/api-keys
- **定价**: https://openai.com/pricing
- **推荐模型**: `gpt-3.5-turbo`, `gpt-4`

### 2. Anthropic Claude (国际)
- **适用地区**: 全球（中国大陆需要代理）
- **官网**: https://www.anthropic.com/
- **获取 API Key**: https://console.anthropic.com/
- **定价**: https://www.anthropic.com/pricing
- **推荐模型**: `claude-3-haiku-20240307`, `claude-3-sonnet-20240229`

### 3. 字节跳动豆包 Doubao (中国大陆) ⭐ 推荐
- **适用地区**: 中国大陆可直接访问
- **官网**: https://www.volcengine.com/product/doubao
- **控制台**: https://console.volcengine.com/ark
- **文档**: https://www.volcengine.com/docs/82379
- **定价**: https://www.volcengine.com/docs/82379/1099320
- **推荐模型**: `doubao-pro-4k`, `doubao-pro-32k`
- **特点**: 
  - 兼容 OpenAI API 格式
  - 中文理解能力强
  - 价格相对较低
  - 国内访问速度快

### 4. DeepSeek (中国大陆) ⭐ 推荐
- **适用地区**: 中国大陆可直接访问
- **官网**: https://www.deepseek.com/
- **控制台**: https://platform.deepseek.com/
- **文档**: https://platform.deepseek.com/api-docs/
- **定价**: https://platform.deepseek.com/api-docs/pricing/
- **推荐模型**: `deepseek-chat`, `deepseek-coder`
- **特点**:
  - 兼容 OpenAI API 格式
  - 性价比极高（价格是 GPT-3.5 的 1/10）
  - 中文和英文能力均衡
  - 国内访问速度快

## 配置步骤

### 1. 复制环境变量模板

```bash
cp .env.example .env
```

### 2. 选择并配置 AI 服务提供商

#### 配置豆包 (Doubao)

1. 访问 [火山引擎控制台](https://console.volcengine.com/ark)
2. 创建应用并获取 API Key
3. 在 `.env` 文件中配置：

```env
# 选择豆包作为 AI 提供商
VITE_AI_PROVIDER=doubao

# 豆包配置
VITE_DOUBAO_API_KEY=your-doubao-api-key-here
VITE_DOUBAO_MODEL=doubao-pro-4k
VITE_DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3
```

#### 配置 DeepSeek

1. 访问 [DeepSeek 平台](https://platform.deepseek.com/)
2. 注册账号并获取 API Key
3. 在 `.env` 文件中配置：

```env
# 选择 DeepSeek 作为 AI 提供商
VITE_AI_PROVIDER=deepseek

# DeepSeek 配置
VITE_DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
VITE_DEEPSEEK_MODEL=deepseek-chat
VITE_DEEPSEEK_API_URL=https://api.deepseek.com
```

#### 配置 OpenAI（需要代理）

```env
# 选择 OpenAI 作为 AI 提供商
VITE_AI_PROVIDER=openai

# OpenAI 配置
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_OPENAI_MODEL=gpt-3.5-turbo
VITE_OPENAI_API_URL=https://api.openai.com/v1
```

#### 配置 Claude（需要代理）

```env
# 选择 Claude 作为 AI 提供商
VITE_AI_PROVIDER=claude

# Claude 配置
VITE_CLAUDE_API_KEY=sk-ant-your-claude-api-key-here
VITE_CLAUDE_MODEL=claude-3-haiku-20240307
VITE_CLAUDE_API_URL=https://api.anthropic.com/v1
```

### 3. 启动应用

```bash
npm run dev
```

## 价格对比（参考）

| 提供商 | 模型 | 输入价格 (¥/百万 tokens) | 输出价格 (¥/百万 tokens) | 备注 |
|--------|------|-------------------------|-------------------------|------|
| OpenAI | gpt-3.5-turbo | ~10 | ~20 | 需要代理 |
| OpenAI | gpt-4 | ~210 | ~420 | 需要代理 |
| Claude | claude-3-haiku | ~1.8 | ~9 | 需要代理 |
| 豆包 | doubao-pro-4k | ~0.8 | ~2 | 国内直连 |
| DeepSeek | deepseek-chat | ~1 | ~2 | 国内直连 |

*价格仅供参考，请以官方最新定价为准*

## 推荐配置

### 中国大陆用户
- **首选**: DeepSeek（性价比最高，速度快）
- **备选**: 豆包（中文理解好）

### 国际用户
- **首选**: OpenAI GPT-3.5-turbo（稳定可靠）
- **备选**: Claude Haiku（价格低，质量好）

## 常见问题

### Q: 豆包和 DeepSeek 的 API 格式是什么？
A: 两者都兼容 OpenAI API 格式，应用内部使用 `OpenAIAdapter` 处理请求。

### Q: 如何切换 AI 提供商？
A: 只需修改 `.env` 文件中的 `VITE_AI_PROVIDER` 值，然后重启应用即可。

### Q: 可以同时配置多个提供商吗？
A: 可以在 `.env` 中配置多个提供商的 API Key，但同一时间只能使用一个（由 `VITE_AI_PROVIDER` 指定）。

### Q: API Key 安全吗？
A: `.env` 文件已在 `.gitignore` 中，不会被提交到版本控制。但请注意：
- 不要在公开场合分享 `.env` 文件
- 定期轮换 API Key
- 为 API Key 设置使用限额

### Q: 豆包的 API URL 为什么不同？
A: 豆包使用火山引擎的 API 网关，URL 格式为 `https://ark.cn-beijing.volces.com/api/v3`。不同地区可能有不同的接入点。

### Q: DeepSeek 支持哪些模型？
A: 主要支持 `deepseek-chat`（通用对话）和 `deepseek-coder`（代码生成）。本应用推荐使用 `deepseek-chat`。

## 技术支持

如遇到配置问题，请：
1. 检查 API Key 是否正确
2. 确认 API URL 是否正确
3. 查看浏览器控制台的错误信息
4. 参考各提供商的官方文档

## 相关文档

- [API 配置指南](./API_SETUP.md)
- [环境变量配置](./.env.example)
- [部署指南](./DEPLOYMENT.md)
