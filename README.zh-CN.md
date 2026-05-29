# 单词学习应用

一款现代化的英语单词系统学习 Web 应用，具备 AI 驱动的单词生成和智能关联功能。

## ✨ 功能特性

- 📅 **学习计划管理**：创建和自定义您的学习计划
- 🤖 **AI 驱动的单词生成**：生成具有语义关联的相关单词
- 📚 **词典集成**：完整的单词释义，包含音标和多种词义
- 📝 **例句展示**：每个单词提供 10-15 个上下文例句
- 🔗 **单词关联**：通过主题和语义关联学习单词
- 📊 **进度跟踪**：监控您的学习进程
- 💾 **离线支持**：使用 IndexedDB 实现数据持久化
- 📱 **响应式设计**：在桌面和移动设备上无缝运行

## 🚀 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式方案**：Tailwind CSS
- **状态管理**：Zustand
- **数据持久化**：Dexie.js（IndexedDB 封装）
- **数据获取**：TanStack Query（React Query）
- **测试框架**：Vitest + fast-check（属性测试）
- **UI 组件**：Headless UI + Lucide React 图标

## 📋 前置要求

开始之前，请确保已安装以下软件：

- **Node.js** 18.0 或更高版本（[下载地址](https://nodejs.org/)）
- **npm** 9.0 或更高版本（随 Node.js 一起安装）
- **Git**（用于克隆仓库）

您还需要：
- **OpenAI** 或 **Anthropic Claude** 的 API 密钥（参见 [API 设置指南](./API_SETUP.md)）
- 现代浏览器（Chrome、Firefox、Safari 或 Edge）

## 🛠️ 安装步骤

### 1. 克隆仓库

```bash
git clone https://github.com/yourusername/vocabulary-learning-app.git
cd vocabulary-learning-app
```

### 2. 安装依赖

```bash
npm install
```

这将安装所有必需的包，包括 React、TypeScript、Vite 和测试库。

### 3. 配置环境变量

复制示例环境文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件并添加您的 API 密钥：

```env
# 选择一个 AI 提供商
VITE_AI_PROVIDER=openai

# 如果使用 OpenAI：
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_OPENAI_MODEL=gpt-3.5-turbo

# 如果使用 Claude：
VITE_CLAUDE_API_KEY=sk-ant-your-claude-api-key-here
VITE_CLAUDE_MODEL=claude-3-haiku-20240307
```

**📖 需要帮助获取 API 密钥？** 请查看详细的 [API 设置指南](./API_SETUP.md)

### 4. 验证安装

运行测试以确保一切设置正确：

```bash
npm test -- --run
```

所有测试应该通过 ✅

## 🚀 开发

### 启动开发服务器

```bash
npm run dev
```

应用将在 **http://localhost:5173** 上运行

开发服务器功能：
- ⚡ 热模块替换（HMR）
- 🔍 TypeScript 类型检查
- 🎨 Tailwind CSS 与 JIT 编译

### 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动带 HMR 的开发服务器 |
| `npm run build` | 构建优化的生产版本 |
| `npm run preview` | 本地预览生产构建 |
| `npm test` | 在监视模式下运行测试 |
| `npm run test:ui` | 使用 Vitest UI 运行测试 |
| `npm run lint` | 使用 ESLint 检查代码质量 |
| `npm run format` | 使用 Prettier 格式化代码 |

## 🧪 测试

### 运行所有测试

```bash
npm test
```

### 运行一次测试（CI 模式）

```bash
npm test -- --run
```

### 使用 UI 运行测试

```bash
npm run test:ui
```

在浏览器中打开交互式测试 UI，地址为 http://localhost:51204

### 测试覆盖率

```bash
npm test -- --coverage
```

### 测试技术栈

- **Vitest**：快速的单元测试运行器
- **fast-check**：属性测试
- **React Testing Library**：组件测试
- **@testing-library/user-event**：用户交互模拟

## 🏗️ 生产构建

### 创建生产构建

```bash
npm run build
```

这将在 `dist/` 目录中创建优化的构建，包含：
- ✅ 压缩的 JavaScript 和 CSS
- ✅ 代码分割以优化加载
- ✅ 用于调试的 Source Maps
- ✅ 资源优化

### 预览生产构建

```bash
npm run preview
```

在 http://localhost:4173 本地提供生产构建

### 构建输出

```
dist/
├── assets/
│   ├── index-[hash].js          # 主应用程序包
│   ├── react-vendor-[hash].js   # React 库
│   ├── ui-vendor-[hash].js      # UI 组件
│   ├── data-vendor-[hash].js    # 数据管理
│   └── index-[hash].css         # 编译的样式
└── index.html                   # 入口 HTML 文件
```

## 📁 项目结构

```
vocabulary-learning-app/
├── src/
│   ├── components/         # React UI 组件
│   │   ├── ErrorMessage.tsx
│   │   ├── ExampleSentences.tsx
│   │   ├── Layout.tsx
│   │   ├── SentenceChainSection.tsx
│   │   ├── WordAssociationDisplay.tsx
│   │   ├── WordCard.tsx
│   │   ├── WordDefinition.tsx
│   │   └── WordList.tsx
│   ├── hooks/              # 自定义 React Hooks
│   │   ├── useDailyWords.ts
│   │   ├── useExampleSentences.ts
│   │   └── useWordDefinitions.ts
│   ├── pages/              # 页面组件
│   │   ├── DailyLearningPage.tsx
│   │   ├── PlanSetupPage.tsx
│   │   ├── ProgressPage.tsx
│   │   └── ReviewPage.tsx
│   ├── services/           # 业务逻辑和 API 集成
│   │   ├── DictionaryService.ts
│   │   ├── ExampleSentenceService.ts
│   │   ├── LearningPlanService.ts
│   │   ├── ProgressService.ts
│   │   ├── StorageService.ts
│   │   ├── VocabularyDB.ts
│   │   └── WordGeneratorService.ts
│   ├── stores/             # Zustand 状态管理
│   │   ├── dailyWordsStore.ts
│   │   ├── learningPlanStore.ts
│   │   └── progressStore.ts
│   ├── types/              # TypeScript 类型定义
│   │   ├── error.ts
│   │   ├── index.ts
│   │   ├── learningPlan.ts
│   │   ├── progress.ts
│   │   ├── services.ts
│   │   ├── word.ts
│   │   └── wordList.ts
│   ├── utils/              # 工具函数
│   │   ├── envConfig.ts
│   │   ├── httpClient.ts
│   │   ├── validation.ts
│   │   └── wordAssociation.ts
│   ├── test/               # 测试设置和工具
│   │   └── setup.ts
│   ├── App.tsx             # 根应用组件
│   ├── main.tsx            # 应用入口点
│   └── index.css           # 全局样式
├── dist/                   # 生产构建输出
├── .kiro/                  # Kiro AI 规范
│   └── specs/
│       └── vocabulary-learning-app/
├── .env                    # 环境变量（不在 git 中）
├── .env.example            # 环境变量模板
├── .gitignore              # Git 忽略模式
├── eslint.config.js        # ESLint 配置
├── index.html              # HTML 入口点
├── package.json            # 依赖和脚本
├── postcss.config.js       # PostCSS 配置
├── prettier.config.js      # Prettier 配置
├── tailwind.config.js      # Tailwind CSS 配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 构建配置
├── vitest.config.ts        # Vitest 测试配置
├── API_SETUP.md            # API 设置指南
├── DEPLOYMENT.md           # 部署指南
└── README.md               # 英文说明文档
```

### 关键目录

- **`src/components/`**：可复用的 React 组件
- **`src/services/`**：业务逻辑、API 调用和数据管理
- **`src/stores/`**：使用 Zustand 的全局状态管理
- **`src/types/`**：TypeScript 接口和类型
- **`src/utils/`**：辅助函数和工具

## 🔧 配置

### 环境变量

应用程序使用环境变量进行配置。所有变量必须以 `VITE_` 为前缀才能在浏览器中访问。

#### 必需变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `VITE_AI_PROVIDER` | AI 服务提供商（`openai` 或 `claude`） | `openai` |
| `VITE_OPENAI_API_KEY` | OpenAI API 密钥（如果使用 OpenAI） | `sk-proj-...` |
| `VITE_CLAUDE_API_KEY` | Claude API 密钥（如果使用 Claude） | `sk-ant-...` |

#### 可选变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_OPENAI_MODEL` | OpenAI 模型名称 | `gpt-3.5-turbo` |
| `VITE_CLAUDE_MODEL` | Claude 模型名称 | `claude-3-haiku-20240307` |
| `VITE_DICTIONARY_API_URL` | 词典 API 端点 | `https://api.dictionaryapi.dev/api/v2` |
| `VITE_MAX_API_RETRIES` | 最大重试次数 | `3` |
| `VITE_API_TIMEOUT` | 请求超时时间（毫秒） | `30000` |
| `VITE_DEBUG_MODE` | 启用调试日志 | `false` |

### API 配置

此应用程序需要 API 密钥才能使用 AI 功能：

- **AI 服务**（必需）：OpenAI 或 Anthropic Claude
  - 用于生成单词列表、关联和例句
  - 详细设置说明请参见 [API_SETUP.md](./API_SETUP.md)
  
- **词典 API**（无需密钥）：免费词典 API
  - 提供单词释义和音标
  - 已配置，无需操作

**快速设置：**
1. 将 `.env.example` 复制为 `.env`
2. 添加您的 OpenAI 或 Claude API 密钥
3. 在配置中选择您的 AI 提供商

有关详细说明、价格信息和故障排除，请参见 [API 设置指南](./API_SETUP.md)。

### TypeScript 配置

项目使用严格的 TypeScript 设置以确保类型安全：

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Tailwind CSS 配置

`tailwind.config.js` 中的自定义 Tailwind 配置：

```javascript
{
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // 自定义主题扩展
    }
  }
}
```

## 🚢 部署

应用程序可以部署到各种平台。我们推荐使用 **Vercel** 或 **Netlify** 进行零配置部署。

### 快速部署

#### 部署到 Vercel

[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/vocabulary-learning-app)

#### 部署到 Netlify

[![部署到 Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/vocabulary-learning-app)

### 手动部署

有关详细的部署说明，包括：
- 环境变量配置
- 自定义域名设置
- CI/CD 流水线配置
- 性能优化
- 故障排除

请参见全面的 [部署指南](./DEPLOYMENT.md)。

### 部署检查清单

在部署到生产环境之前：

- [ ] 设置所有必需的环境变量
- [ ] 在本地测试生产构建（`npm run build && npm run preview`）
- [ ] 验证 API 密钥是否正常工作
- [ ] 运行所有测试（`npm test -- --run`）
- [ ] 检查 TypeScript 错误（`npm run build`）
- [ ] 审查安全设置
- [ ] 设置错误监控（可选）
- [ ] 配置自定义域名（可选）

### 支持的平台

- ✅ **Vercel**（推荐）
- ✅ **Netlify**
- ✅ **GitHub Pages**
- ✅ **Cloudflare Pages**
- ✅ **AWS Amplify**
- ✅ 任何静态托管服务

## 🎨 代码质量

### 代码检查

使用 ESLint 检查代码质量：

```bash
npm run lint
```

修复可自动修复的问题：

```bash
npm run lint -- --fix
```

### 代码格式化

使用 Prettier 格式化代码：

```bash
npm run format
```

检查格式而不进行更改：

```bash
npm run format -- --check
```

### 预提交钩子（可选）

安装 Husky 以实现自动代码检查和格式化：

```bash
npm install --save-dev husky lint-staged
npx husky install
```

添加到 `package.json`：

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## 🐛 故障排除

### 常见问题

#### 端口已被占用

如果端口 5173 已被占用：

```bash
# 使用不同的端口
npm run dev -- --port 3000
```

#### 模块未找到错误

清除 node_modules 并重新安装：

```bash
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript 错误

在 IDE 中重启 TypeScript 服务器或运行：

```bash
npm run build
```

#### 环境变量未加载

1. 确保 `.env` 文件存在于项目根目录
2. 重启开发服务器
3. 验证变量名称具有 `VITE_` 前缀

#### API 密钥错误

请参见 [API 设置指南](./API_SETUP.md) 的故障排除部分。

### 获取帮助

- 📖 查看 [API 设置指南](./API_SETUP.md)
- 📖 阅读 [部署指南](./DEPLOYMENT.md)
- 🐛 [提交问题](https://github.com/yourusername/vocabulary-learning-app/issues)
- 💬 [开始讨论](https://github.com/yourusername/vocabulary-learning-app/discussions)

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m 'Add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打开 Pull Request

### 开发指南

- 为新功能编写测试
- 遵循现有的代码风格
- 根据需要更新文档
- 在提交前确保所有测试通过

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [React](https://react.dev/) - UI 框架
- [Vite](https://vitejs.dev/) - 构建工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Dexie.js](https://dexie.org/) - IndexedDB 封装
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [Free Dictionary API](https://dictionaryapi.dev/) - 词典服务
- [OpenAI](https://openai.com/) / [Anthropic](https://www.anthropic.com/) - AI 服务

## 📚 其他资源

- [API 设置指南](./API_SETUP.md) - 详细的 API 配置
- [部署指南](./DEPLOYMENT.md) - 生产部署说明
- [设计文档](./.kiro/specs/vocabulary-learning-app/design.md) - 技术设计
- [需求文档](./.kiro/specs/vocabulary-learning-app/requirements.md) - 功能需求

## 📞 支持

如有问题和支持需求：

- 📧 邮箱：support@example.com
- 💬 Discord：[加入我们的社区](https://discord.gg/example)
- 🐦 Twitter：[@vocablearningapp](https://twitter.com/example)

---

为全球语言学习者用 ❤️ 制作
