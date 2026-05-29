# Vocabulary Learning App

A modern web application for systematic English vocabulary learning with AI-powered word generation and intelligent associations.

## ✨ Features

- 📅 **Learning Plan Management**: Create and customize your learning schedule
- 🤖 **AI-Powered Word Generation**: Generate related words with semantic associations
- 📚 **Dictionary Integration**: Complete word definitions with phonetics and multiple meanings
- 📝 **Example Sentences**: 10-15 contextual examples for each word
- 🔗 **Word Associations**: Learn words through thematic and semantic connections
- 📊 **Progress Tracking**: Monitor your learning journey
- 💾 **Offline Support**: Data persistence with IndexedDB
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Persistence**: Dexie.js (IndexedDB wrapper)
- **Data Fetching**: TanStack Query (React Query)
- **Testing**: Vitest + fast-check (property-based testing)
- **UI Components**: Headless UI + Lucide React icons

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** 9.0 or higher (comes with Node.js)
- **Git** (for cloning the repository)

You'll also need:
- An API key from **OpenAI** or **Anthropic Claude** (see [API Setup Guide](./API_SETUP.md))
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vocabulary-learning-app.git
cd vocabulary-learning-app
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including React, TypeScript, Vite, and testing libraries.

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```env
# Choose ONE AI provider
VITE_AI_PROVIDER=openai

# If using OpenAI:
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
VITE_OPENAI_MODEL=gpt-3.5-turbo

# If using Claude:
VITE_CLAUDE_API_KEY=sk-ant-your-claude-api-key-here
VITE_CLAUDE_MODEL=claude-3-haiku-20240307
```

**📖 Need help getting API keys?** See the detailed [API Setup Guide](./API_SETUP.md)

### 4. Verify Installation

Run the tests to ensure everything is set up correctly:

```bash
npm test -- --run
```

All tests should pass ✅

## 🚀 Development

### Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

The development server features:
- ⚡ Hot Module Replacement (HMR)
- 🔍 TypeScript type checking
- 🎨 Tailwind CSS with JIT compilation

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm test` | Run tests in watch mode |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run lint` | Check code quality with ESLint |
| `npm run format` | Format code with Prettier |

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests Once (CI mode)

```bash
npm test -- --run
```

### Run Tests with UI

```bash
npm run test:ui
```

Opens an interactive test UI in your browser at http://localhost:51204

### Test Coverage

```bash
npm test -- --coverage
```

### Testing Stack

- **Vitest**: Fast unit test runner
- **fast-check**: Property-based testing
- **React Testing Library**: Component testing
- **@testing-library/user-event**: User interaction simulation

## 🏗️ Building for Production

### Create Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` directory with:
- ✅ Minified JavaScript and CSS
- ✅ Code splitting for optimal loading
- ✅ Source maps for debugging
- ✅ Asset optimization

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally at http://localhost:4173

### Build Output

```
dist/
├── assets/
│   ├── index-[hash].js      # Main application bundle
│   ├── react-vendor-[hash].js   # React libraries
│   ├── ui-vendor-[hash].js      # UI components
│   ├── data-vendor-[hash].js    # Data management
│   └── index-[hash].css     # Compiled styles
└── index.html               # Entry HTML file
```

## 📁 Project Structure

```
vocabulary-learning-app/
├── src/
│   ├── components/         # React UI components
│   │   ├── ErrorMessage.tsx
│   │   ├── ExampleSentences.tsx
│   │   ├── Layout.tsx
│   │   ├── SentenceChainSection.tsx
│   │   ├── WordAssociationDisplay.tsx
│   │   ├── WordCard.tsx
│   │   ├── WordDefinition.tsx
│   │   └── WordList.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useDailyWords.ts
│   │   ├── useExampleSentences.ts
│   │   └── useWordDefinitions.ts
│   ├── pages/              # Page components
│   │   ├── DailyLearningPage.tsx
│   │   ├── PlanSetupPage.tsx
│   │   ├── ProgressPage.tsx
│   │   └── ReviewPage.tsx
│   ├── services/           # Business logic and API integration
│   │   ├── DictionaryService.ts
│   │   ├── ExampleSentenceService.ts
│   │   ├── LearningPlanService.ts
│   │   ├── ProgressService.ts
│   │   ├── StorageService.ts
│   │   ├── VocabularyDB.ts
│   │   └── WordGeneratorService.ts
│   ├── stores/             # Zustand state management
│   │   ├── dailyWordsStore.ts
│   │   ├── learningPlanStore.ts
│   │   └── progressStore.ts
│   ├── types/              # TypeScript type definitions
│   │   ├── error.ts
│   │   ├── index.ts
│   │   ├── learningPlan.ts
│   │   ├── progress.ts
│   │   ├── services.ts
│   │   ├── word.ts
│   │   └── wordList.ts
│   ├── utils/              # Utility functions
│   │   ├── envConfig.ts
│   │   ├── httpClient.ts
│   │   ├── validation.ts
│   │   └── wordAssociation.ts
│   ├── test/               # Test setup and utilities
│   │   └── setup.ts
│   ├── App.tsx             # Root application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── dist/                   # Production build output
├── .kiro/                  # Kiro AI specifications
│   └── specs/
│       └── vocabulary-learning-app/
├── .env                    # Environment variables (not in git)
├── .env.example            # Environment template
├── .gitignore              # Git ignore patterns
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── prettier.config.js      # Prettier configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── vitest.config.ts        # Vitest test configuration
├── API_SETUP.md            # API setup guide
├── DEPLOYMENT.md           # Deployment guide
└── README.md               # This file
```

### Key Directories

- **`src/components/`**: Reusable React components
- **`src/services/`**: Business logic, API calls, and data management
- **`src/stores/`**: Global state management with Zustand
- **`src/types/`**: TypeScript interfaces and types
- **`src/utils/`**: Helper functions and utilities

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. All variables must be prefixed with `VITE_` to be accessible in the browser.

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_AI_PROVIDER` | AI service provider (`openai` or `claude`) | `openai` |
| `VITE_OPENAI_API_KEY` | OpenAI API key (if using OpenAI) | `sk-proj-...` |
| `VITE_CLAUDE_API_KEY` | Claude API key (if using Claude) | `sk-ant-...` |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_OPENAI_MODEL` | OpenAI model name | `gpt-3.5-turbo` |
| `VITE_CLAUDE_MODEL` | Claude model name | `claude-3-haiku-20240307` |
| `VITE_DICTIONARY_API_URL` | Dictionary API endpoint | `https://api.dictionaryapi.dev/api/v2` |
| `VITE_MAX_API_RETRIES` | Max retry attempts | `3` |
| `VITE_API_TIMEOUT` | Request timeout (ms) | `30000` |
| `VITE_DEBUG_MODE` | Enable debug logging | `false` |

### API Configuration

This application requires API keys for AI-powered features:

- **AI Service** (Required): OpenAI or Anthropic Claude
  - Used for generating word lists, associations, and example sentences
  - See [API_SETUP.md](./API_SETUP.md) for detailed setup instructions
  
- **Dictionary API** (No key required): Free Dictionary API
  - Provides word definitions and phonetics
  - Already configured, no action needed

**Quick Setup:**
1. Copy `.env.example` to `.env`
2. Add your OpenAI or Claude API key
3. Choose your AI provider in the config

For detailed instructions, pricing information, and troubleshooting, see the [API Setup Guide](./API_SETUP.md).

### TypeScript Configuration

The project uses strict TypeScript settings for type safety:

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

### Tailwind CSS Configuration

Custom Tailwind configuration in `tailwind.config.js`:

```javascript
{
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Custom theme extensions
    }
  }
}
```

## 🚢 Deployment

The application can be deployed to various platforms. We recommend **Vercel** or **Netlify** for zero-configuration deployment.

### Quick Deploy

#### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/vocabulary-learning-app)

#### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/vocabulary-learning-app)

### Manual Deployment

For detailed deployment instructions including:
- Environment variable configuration
- Custom domain setup
- CI/CD pipeline configuration
- Performance optimization
- Troubleshooting

See the comprehensive [Deployment Guide](./DEPLOYMENT.md).

### Deployment Checklist

Before deploying to production:

- [ ] Set all required environment variables
- [ ] Test the production build locally (`npm run build && npm run preview`)
- [ ] Verify API keys are working
- [ ] Run all tests (`npm test -- --run`)
- [ ] Check for TypeScript errors (`npm run build`)
- [ ] Review security settings
- [ ] Set up error monitoring (optional)
- [ ] Configure custom domain (optional)

### Supported Platforms

- ✅ **Vercel** (Recommended)
- ✅ **Netlify**
- ✅ **GitHub Pages**
- ✅ **Cloudflare Pages**
- ✅ **AWS Amplify**
- ✅ Any static hosting service

## 🎨 Code Quality

### Linting

Check code quality with ESLint:

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint -- --fix
```

### Formatting

Format code with Prettier:

```bash
npm run format
```

Check formatting without making changes:

```bash
npm run format -- --check
```

### Pre-commit Hooks (Optional)

Install Husky for automatic linting and formatting:

```bash
npm install --save-dev husky lint-staged
npx husky install
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use

If port 5173 is already in use:

```bash
# Use a different port
npm run dev -- --port 3000
```

#### Module Not Found Errors

Clear node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors

Restart the TypeScript server in your IDE or run:

```bash
npm run build
```

#### Environment Variables Not Loading

1. Ensure `.env` file exists in project root
2. Restart the development server
3. Verify variable names have `VITE_` prefix

#### API Key Errors

See the [API Setup Guide](./API_SETUP.md) troubleshooting section.

### Getting Help

- 📖 Check the [API Setup Guide](./API_SETUP.md)
- 📖 Read the [Deployment Guide](./DEPLOYMENT.md)
- 🐛 [Open an issue](https://github.com/yourusername/vocabulary-learning-app/issues)
- 💬 [Start a discussion](https://github.com/yourusername/vocabulary-learning-app/discussions)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow the existing code style
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Dexie.js](https://dexie.org/) - IndexedDB wrapper
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Free Dictionary API](https://dictionaryapi.dev/) - Dictionary service
- [OpenAI](https://openai.com/) / [Anthropic](https://www.anthropic.com/) - AI services

## 📚 Additional Resources

- [API Setup Guide](./API_SETUP.md) - Detailed API configuration
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Design Document](./.kiro/specs/vocabulary-learning-app/design.md) - Technical design
- [Requirements Document](./.kiro/specs/vocabulary-learning-app/requirements.md) - Feature requirements

## 📞 Support

For questions and support:

- 📧 Email: support@example.com
- 💬 Discord: [Join our community](https://discord.gg/example)
- 🐦 Twitter: [@vocablearningapp](https://twitter.com/example)

---

Made with ❤️ for language learners worldwide
