# API Setup Guide

This guide explains how to obtain and configure the API keys required for the Vocabulary Learning App.

## Overview

The application integrates with the following services:

1. **AI Service** (OpenAI or Claude) - **Required** for:
   - Generating daily word lists with semantic associations
   - Creating example sentences with translations
   - Generating sentence chains using multiple words

2. **Dictionary API** (Free Dictionary API) - **No API key required**:
   - Fetching word definitions and phonetics
   - Multiple part-of-speech meanings

## Quick Start

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Choose and configure ONE AI provider (OpenAI or Claude)

3. Start the development server:
   ```bash
   npm run dev
   ```

## AI Service Configuration

### Option 1: OpenAI API (Recommended for beginners)

**Why OpenAI?**
- Well-documented API
- Reliable performance
- Cost-effective for development (GPT-3.5-turbo)

**Steps to get your API key:**

1. **Create an OpenAI account**
   - Visit: https://platform.openai.com/signup
   - Sign up with email or Google/Microsoft account

2. **Add payment method**
   - Go to: https://platform.openai.com/account/billing
   - Add a credit card (required even for free tier)
   - Note: New accounts get $5 free credit

3. **Generate API key**
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Give it a name (e.g., "Vocabulary Learning App")
   - **Important**: Copy the key immediately - you won't see it again!

4. **Configure in .env file**
   ```env
   VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   VITE_OPENAI_MODEL=gpt-3.5-turbo
   VITE_OPENAI_API_URL=https://api.openai.com/v1
   VITE_AI_PROVIDER=openai
   ```

**Pricing (as of 2024):**
- GPT-3.5-turbo: $0.50 / 1M input tokens, $1.50 / 1M output tokens
- GPT-4-turbo: $10.00 / 1M input tokens, $30.00 / 1M output tokens
- Estimated cost: ~$0.01-0.05 per day of word generation (10-20 words)

**Recommended models:**
- Development: `gpt-3.5-turbo` (fast and cheap)
- Production: `gpt-4-turbo` or `gpt-4o` (better quality)

### Option 2: Anthropic Claude API

**Why Claude?**
- Excellent at generating natural, contextual content
- Strong multilingual support (English-Chinese translations)
- Competitive pricing

**Steps to get your API key:**

1. **Create an Anthropic account**
   - Visit: https://console.anthropic.com/
   - Sign up with email

2. **Add payment method**
   - Go to: https://console.anthropic.com/settings/billing
   - Add payment information
   - Note: $5 free credit for new accounts

3. **Generate API key**
   - Go to: https://console.anthropic.com/settings/keys
   - Click "Create Key"
   - Name it (e.g., "Vocabulary App")
   - **Important**: Copy the key immediately!

4. **Configure in .env file**
   ```env
   VITE_CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
   VITE_CLAUDE_MODEL=claude-3-haiku-20240307
   VITE_CLAUDE_API_URL=https://api.anthropic.com/v1
   VITE_AI_PROVIDER=claude
   ```

**Pricing (as of 2024):**
- Claude 3 Haiku: $0.25 / 1M input tokens, $1.25 / 1M output tokens
- Claude 3 Sonnet: $3.00 / 1M input tokens, $15.00 / 1M output tokens
- Claude 3 Opus: $15.00 / 1M input tokens, $75.00 / 1M output tokens

**Recommended models:**
- Development: `claude-3-haiku-20240307` (fastest and cheapest)
- Production: `claude-3-sonnet-20240229` (balanced)

## Dictionary API Configuration

**Good news**: The Free Dictionary API requires **no API key**!

The application uses: https://api.dictionaryapi.dev/api/v2

**Features:**
- Free and open source
- No rate limits for reasonable use
- Provides definitions, phonetics, examples, and synonyms
- No authentication required

**Configuration in .env:**
```env
VITE_DICTIONARY_API_URL=https://api.dictionaryapi.dev/api/v2
```

**Note**: This is already configured in `.env.example` and requires no changes.

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_AI_PROVIDER` | AI service to use (`openai` or `claude`) | `openai` |
| `VITE_OPENAI_API_KEY` | OpenAI API key (if using OpenAI) | `sk-proj-...` |
| `VITE_CLAUDE_API_KEY` | Claude API key (if using Claude) | `sk-ant-...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_OPENAI_MODEL` | OpenAI model to use | `gpt-3.5-turbo` |
| `VITE_CLAUDE_MODEL` | Claude model to use | `claude-3-haiku-20240307` |
| `VITE_DICTIONARY_API_URL` | Dictionary API endpoint | `https://api.dictionaryapi.dev/api/v2` |
| `VITE_MAX_API_RETRIES` | Max retry attempts for failed requests | `3` |
| `VITE_API_TIMEOUT` | Request timeout in milliseconds | `30000` |
| `VITE_DEBUG_MODE` | Enable debug logging | `false` |

## Security Best Practices

### ⚠️ Important Security Notes

1. **Never commit `.env` file to Git**
   - The `.env` file is already in `.gitignore`
   - Only commit `.env.example` (without real keys)

2. **Keep API keys secret**
   - Don't share keys in screenshots, logs, or error messages
   - Rotate keys if accidentally exposed

3. **Use environment-specific keys**
   - Development: Use separate API keys with lower rate limits
   - Production: Use dedicated keys with monitoring

4. **Monitor API usage**
   - OpenAI: https://platform.openai.com/usage
   - Claude: https://console.anthropic.com/settings/billing

5. **Set spending limits**
   - OpenAI: Set monthly budget limits in billing settings
   - Claude: Configure usage notifications

### Client-Side API Key Exposure

**Important**: This is a frontend-only application. Environment variables prefixed with `VITE_` are exposed in the browser bundle.

**Mitigation strategies:**

1. **For development/personal use**: Current approach is acceptable
   - Keep keys private
   - Monitor usage regularly
   - Set low spending limits

2. **For production/public deployment**: Consider these options:
   - Build a backend API proxy to hide keys
   - Use serverless functions (Vercel, Netlify)
   - Implement user authentication and rate limiting
   - Use API key rotation

**Example backend proxy** (future enhancement):
```
Frontend → Your Backend API → OpenAI/Claude API
         (no keys exposed)    (keys stored securely)
```

## Testing Your Configuration

### 1. Verify environment variables are loaded

Create a test file `src/test-env.ts`:

```typescript
console.log('AI Provider:', import.meta.env.VITE_AI_PROVIDER);
console.log('OpenAI Key exists:', !!import.meta.env.VITE_OPENAI_API_KEY);
console.log('Claude Key exists:', !!import.meta.env.VITE_CLAUDE_API_KEY);
console.log('Dictionary API:', import.meta.env.VITE_DICTIONARY_API_URL);
```

### 2. Test Dictionary API (no key required)

```bash
curl https://api.dictionaryapi.dev/api/v2/entries/en/hello
```

Should return JSON with word definitions.

### 3. Test OpenAI API

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Say hello"}],
    "max_tokens": 10
  }'
```

### 4. Test Claude API

```bash
curl https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-haiku-20240307",
    "messages": [{"role": "user", "content": "Say hello"}],
    "max_tokens": 10
  }'
```

## Troubleshooting

### "API key not found" error

**Solution**: 
1. Verify `.env` file exists in project root
2. Check variable names match exactly (including `VITE_` prefix)
3. Restart development server after changing `.env`

### "Invalid API key" error

**Solution**:
1. Verify you copied the entire key (including `sk-` prefix)
2. Check for extra spaces or newlines
3. Regenerate key if necessary

### "Rate limit exceeded" error

**Solution**:
1. Check your API usage dashboard
2. Wait a few minutes and retry
3. Upgrade to paid tier if needed
4. Implement request caching

### "Network error" or timeout

**Solution**:
1. Check internet connection
2. Verify API endpoint URLs are correct
3. Increase `VITE_API_TIMEOUT` value
4. Check if API service is down (status pages)

### Dictionary API returns 404

**Solution**:
1. Word might not exist in dictionary
2. Check spelling
3. Try alternative dictionary APIs if needed

## Cost Estimation

### Typical Usage Patterns

**Daily word generation** (10 words):
- Input: ~500 tokens (prompt with context)
- Output: ~2000 tokens (words, definitions, examples, associations)
- Cost per day:
  - OpenAI GPT-3.5: ~$0.001-0.002
  - Claude Haiku: ~$0.0005-0.001

**Monthly cost** (30 days):
- OpenAI GPT-3.5: ~$0.03-0.06
- Claude Haiku: ~$0.015-0.03

**Annual cost** (365 days):
- OpenAI GPT-3.5: ~$0.40-0.75
- Claude Haiku: ~$0.20-0.40

### Cost Optimization Tips

1. **Use cheaper models for development**
   - GPT-3.5-turbo or Claude Haiku

2. **Cache generated content**
   - Store word lists in IndexedDB
   - Avoid regenerating same words

3. **Batch requests when possible**
   - Generate multiple days at once
   - Reduce API call overhead

4. **Set token limits**
   - Limit max_tokens in API requests
   - Optimize prompt length

## Alternative Free Options

If you want to avoid API costs entirely:

### 1. Use Mock Data (Current Implementation)
- Services already have mock implementations
- No API calls, no costs
- Limited variety and quality

### 2. Local AI Models
- Run models locally (Ollama, LM Studio)
- One-time setup, no ongoing costs
- Requires powerful hardware

### 3. Free Tier Limits
- OpenAI: $5 free credit (new accounts)
- Claude: $5 free credit (new accounts)
- Sufficient for testing and light usage

## Next Steps

1. ✅ Copy `.env.example` to `.env`
2. ✅ Choose AI provider (OpenAI or Claude)
3. ✅ Obtain and configure API key
4. ✅ Test configuration
5. ✅ Start building!

## Support

- **OpenAI Documentation**: https://platform.openai.com/docs
- **Claude Documentation**: https://docs.anthropic.com/
- **Free Dictionary API**: https://dictionaryapi.dev/
- **Project Issues**: [Create an issue on GitHub]

## References

- [OpenAI API Pricing](https://openai.com/pricing)
- [Anthropic Pricing](https://www.anthropic.com/pricing)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)
