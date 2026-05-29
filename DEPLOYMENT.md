# Deployment Guide

This guide provides detailed instructions for deploying the Vocabulary Learning App to production environments.

## Table of Contents

- [Overview](#overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Vercel Deployment](#vercel-deployment)
- [Netlify Deployment](#netlify-deployment)
- [GitHub Pages Deployment](#github-pages-deployment)
- [Other Platforms](#other-platforms)
- [Environment Variables](#environment-variables)
- [Custom Domain Setup](#custom-domain-setup)
- [Performance Optimization](#performance-optimization)
- [Monitoring and Analytics](#monitoring-and-analytics)
- [Troubleshooting](#troubleshooting)

## Overview

The Vocabulary Learning App is a static single-page application (SPA) built with Vite. It can be deployed to any static hosting service that supports:

- Static file serving
- SPA routing (fallback to index.html)
- Environment variables
- HTTPS

**Recommended Platforms:**
- ✅ **Vercel** - Zero-config, automatic deployments, edge network
- ✅ **Netlify** - Easy setup, form handling, serverless functions
- ✅ **GitHub Pages** - Free for public repositories
- ✅ **Cloudflare Pages** - Fast global CDN, unlimited bandwidth

## Pre-Deployment Checklist

Before deploying, ensure you have completed the following:

### 1. Build Verification

```bash
# Install dependencies
npm install

# Run tests
npm test -- --run

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit http://localhost:4173 and verify:
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] API calls succeed
- [ ] No console errors
- [ ] Responsive design works on mobile

### 2. Environment Variables

Prepare your environment variables:

```env
# Required
VITE_AI_PROVIDER=openai
VITE_OPENAI_API_KEY=sk-proj-your-key-here

# Optional
VITE_OPENAI_MODEL=gpt-3.5-turbo
VITE_DICTIONARY_API_URL=https://api.dictionaryapi.dev/api/v2
VITE_MAX_API_RETRIES=3
VITE_API_TIMEOUT=30000
VITE_DEBUG_MODE=false
```

⚠️ **Security Note**: Never commit `.env` files with real API keys to Git!

### 3. Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run build
```

All checks should pass without errors.

### 4. API Keys

- [ ] Obtain production API keys (separate from development)
- [ ] Set spending limits on API providers
- [ ] Test API keys in production environment
- [ ] Monitor API usage

## Vercel Deployment

Vercel is the recommended platform for deploying Vite applications.

### Method 1: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub, GitLab, or Bitbucket
3. Authorize Vercel to access your repositories

#### Step 2: Import Project

1. Click **"Add New Project"**
2. Select **"Import Git Repository"**
3. Choose your vocabulary-learning-app repository
4. Click **"Import"**

#### Step 3: Configure Project

**Framework Preset**: Vite (auto-detected)

**Build Settings**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Root Directory**: `./` (leave as default)

#### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `VITE_AI_PROVIDER` | `openai` |
| `VITE_OPENAI_API_KEY` | `sk-proj-your-key-here` |
| `VITE_OPENAI_MODEL` | `gpt-3.5-turbo` |

Add all other variables from your `.env` file.

**Environment Scope**: Select all (Production, Preview, Development)

#### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (1-3 minutes)
3. Visit your deployment URL: `https://your-app.vercel.app`

### Method 2: Deploy via Vercel CLI

#### Install Vercel CLI

```bash
npm install -g vercel
```

#### Login to Vercel

```bash
vercel login
```

#### Deploy

```bash
# First deployment
vercel

# Production deployment
vercel --prod
```

Follow the prompts to configure your project.

### Vercel Configuration File

Create `vercel.json` in project root for advanced configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Commits to `main` branch
- **Preview**: Pull requests and other branches

### Custom Domain on Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `vocab.example.com`)
3. Configure DNS records as instructed
4. Wait for SSL certificate (automatic)

## Netlify Deployment

Netlify is another excellent option with similar features to Vercel.

### Method 1: Deploy via Netlify Dashboard

#### Step 1: Create Netlify Account

1. Go to [netlify.com](https://www.netlify.com)
2. Sign up with GitHub, GitLab, or Bitbucket
3. Authorize Netlify

#### Step 2: Add New Site

1. Click **"Add new site"** → **"Import an existing project"**
2. Choose your Git provider
3. Select your repository
4. Authorize access

#### Step 3: Configure Build Settings

**Build Settings**:
- Base directory: (leave empty)
- Build command: `npm run build`
- Publish directory: `dist`

#### Step 4: Add Environment Variables

Click **"Show advanced"** → **"New variable"**

Add all variables from your `.env` file:

```
VITE_AI_PROVIDER=openai
VITE_OPENAI_API_KEY=sk-proj-your-key-here
VITE_OPENAI_MODEL=gpt-3.5-turbo
```

#### Step 5: Deploy

1. Click **"Deploy site"**
2. Wait for build (1-3 minutes)
3. Visit your site: `https://random-name-123.netlify.app`

### Method 2: Deploy via Netlify CLI

#### Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Login

```bash
netlify login
```

#### Initialize and Deploy

```bash
# Initialize
netlify init

# Deploy to production
netlify deploy --prod
```

### Netlify Configuration File

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Custom Domain on Netlify

1. Go to Site Settings → Domain Management
2. Click **"Add custom domain"**
3. Enter your domain
4. Configure DNS records
5. Enable HTTPS (automatic with Let's Encrypt)

## GitHub Pages Deployment

GitHub Pages is free for public repositories.

### Step 1: Install gh-pages Package

```bash
npm install --save-dev gh-pages
```

### Step 2: Update package.json

Add deployment scripts:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### Step 3: Configure Vite Base Path

Update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/vocabulary-learning-app/', // Replace with your repo name
  // ... rest of config
});
```

### Step 4: Deploy

```bash
npm run deploy
```

This creates a `gh-pages` branch and deploys the `dist` folder.

### Step 5: Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` / `root`
4. Save

Your site will be available at: `https://yourusername.github.io/vocabulary-learning-app/`

### Environment Variables on GitHub Pages

GitHub Pages doesn't support environment variables directly. Options:

1. **Build-time variables**: Set in GitHub Actions workflow
2. **Runtime configuration**: Use a config file
3. **Backend proxy**: Use serverless functions

**Example GitHub Actions workflow** (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        env:
          VITE_AI_PROVIDER: ${{ secrets.VITE_AI_PROVIDER }}
          VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
          VITE_OPENAI_MODEL: ${{ secrets.VITE_OPENAI_MODEL }}
        run: npm run build
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Add secrets in repository Settings → Secrets and variables → Actions.

## Other Platforms

### Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect your Git repository
3. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
4. Add environment variables
5. Deploy

### AWS Amplify

1. Go to AWS Amplify Console
2. Connect repository
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables
5. Deploy

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy
```

## Environment Variables

### Production vs Development

Use different API keys for different environments:

**Development** (`.env.local`):
```env
VITE_OPENAI_API_KEY=sk-proj-dev-key
VITE_DEBUG_MODE=true
```

**Production** (Platform dashboard):
```env
VITE_OPENAI_API_KEY=sk-proj-prod-key
VITE_DEBUG_MODE=false
```

### Security Best Practices

1. **Never commit API keys** to Git
2. **Use separate keys** for dev/prod
3. **Set spending limits** on API providers
4. **Rotate keys regularly**
5. **Monitor API usage**
6. **Consider backend proxy** for production

### Backend API Proxy (Recommended for Production)

To hide API keys from the browser:

1. Create serverless functions (Vercel/Netlify)
2. Move API calls to backend
3. Frontend calls your API
4. Your API calls OpenAI/Claude

**Example Vercel Serverless Function** (`api/generate-words.ts`):

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const apiKey = process.env.OPENAI_API_KEY; // Not exposed to browser
  
  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  });
  
  const data = await response.json();
  res.json(data);
}
```

## Custom Domain Setup

### DNS Configuration

For both Vercel and Netlify, you'll need to configure DNS records:

**Option 1: CNAME Record** (Subdomain)
```
Type: CNAME
Name: vocab (or www)
Value: your-app.vercel.app (or your-app.netlify.app)
```

**Option 2: A Record** (Root domain)
```
Type: A
Name: @
Value: [Platform IP address]
```

### SSL/TLS Certificate

Both Vercel and Netlify provide automatic HTTPS:
- Free SSL certificates via Let's Encrypt
- Automatic renewal
- Force HTTPS redirect

## Performance Optimization

### Build Optimization

Already configured in `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@headlessui/react', 'lucide-react'],
        },
      },
    },
  },
});
```

### Caching Strategy

Configure cache headers:

**Vercel** (`vercel.json`):
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Netlify** (`netlify.toml`):
```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Performance Checklist

- [x] Code splitting configured
- [x] Assets minified
- [x] Gzip/Brotli compression (automatic on platforms)
- [x] Cache headers configured
- [ ] Image optimization (if using images)
- [ ] Lazy loading for routes
- [ ] Service Worker (optional, for offline support)

## Monitoring and Analytics

### Error Tracking

**Sentry Integration**:

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Analytics

**Vercel Analytics**:

```bash
npm install @vercel/analytics
```

```typescript
// src/main.tsx
import { Analytics } from '@vercel/analytics/react';

<App />
<Analytics />
```

**Google Analytics**:

```typescript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### Performance Monitoring

**Vercel Speed Insights**:

```bash
npm install @vercel/speed-insights
```

```typescript
import { SpeedInsights } from '@vercel/speed-insights/react';

<App />
<SpeedInsights />
```

## Troubleshooting

### Build Failures

**Issue**: Build fails with TypeScript errors

**Solution**:
```bash
# Check locally first
npm run build

# Fix type errors
npm run lint
```

**Issue**: Out of memory during build

**Solution**: Increase Node memory
```json
{
  "scripts": {
    "build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
  }
}
```

### Routing Issues

**Issue**: 404 on page refresh

**Solution**: Configure SPA fallback

**Vercel**: Add to `vercel.json`
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Netlify**: Add to `netlify.toml`
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables Not Working

**Issue**: Environment variables undefined

**Solutions**:
1. Ensure variables have `VITE_` prefix
2. Restart dev server after changing `.env`
3. Check platform dashboard for correct values
4. Redeploy after adding new variables

### API Key Errors in Production

**Issue**: API calls fail in production

**Solutions**:
1. Verify API keys are set in platform dashboard
2. Check API key permissions and quotas
3. Test API keys with curl
4. Check browser console for errors
5. Verify CORS settings

### Performance Issues

**Issue**: Slow page loads

**Solutions**:
1. Check bundle size: `npm run build -- --analyze`
2. Implement code splitting
3. Enable compression
4. Use CDN (automatic on Vercel/Netlify)
5. Optimize images

## Deployment Checklist

Before going live:

- [ ] All tests passing
- [ ] Production build successful
- [ ] Environment variables configured
- [ ] API keys tested
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS enabled
- [ ] Error tracking set up
- [ ] Analytics configured
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

## Rollback Strategy

### Vercel

1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Netlify

1. Go to Deploys
2. Find previous deploy
3. Click "Publish deploy"

### Git-based Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
```

## Support and Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Netlify Documentation**: https://docs.netlify.com
- **Vite Deployment Guide**: https://vitejs.dev/guide/static-deploy.html
- **Project Issues**: [GitHub Issues](https://github.com/yourusername/vocabulary-learning-app/issues)

---

**Need help?** Open an issue or contact support@example.com
