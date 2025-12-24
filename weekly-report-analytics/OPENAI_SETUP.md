# OpenAI API Setup Guide

This application uses OpenAI's GPT-4o model to provide AI-powered insights on your weekly report data.

## Getting Your OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy your API key (you won't be able to see it again!)

## Setting Up the Environment Variable

### For Development (Local)

1. In the `weekly-report-analytics` directory, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and replace `your_openai_api_key_here` with your actual API key:
   ```
   VITE_OPENAI_API_KEY=sk-...your-actual-key-here...
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### For Production (Firebase Hosting)

When deploying to production, you'll need to set the environment variable in your build process or hosting platform.

#### Option 1: Build-time Environment Variable
Set the environment variable before building:
```bash
export VITE_OPENAI_API_KEY=sk-...your-actual-key-here...
npm run build
```

#### Option 2: CI/CD Pipeline
Add the `VITE_OPENAI_API_KEY` as a secret in your GitHub repository:
1. Go to your repository Settings
2. Navigate to Secrets and variables > Actions
3. Add a new repository secret named `VITE_OPENAI_API_KEY`
4. Update your GitHub Actions workflow to use this secret

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit your `.env` file** - It's already in `.gitignore`
2. **API Key Exposure** - Since this is a client-side app, the API key will be visible in the browser. Consider these options:
   - Use a backend API proxy to hide the key
   - Set usage limits in your OpenAI account
   - Monitor your OpenAI usage regularly
3. **Cost Management** - Set up billing alerts in your OpenAI account to avoid unexpected charges

## Model Information

The app uses **GPT-4o** by default, which provides:
- High-quality business insights
- Better understanding of complex financial data
- More accurate analysis

You can switch to **GPT-3.5-turbo** for cost savings by editing `/src/lib/openai.ts` and changing the `model` parameter.

## Troubleshooting

### "Failed to get AI response"
- Check that your API key is correctly set in `.env`
- Verify your OpenAI account has available credits
- Check the browser console for specific error messages

### API Key Not Working
- Ensure the key starts with `sk-`
- Verify the key is active in your OpenAI dashboard
- Check that you've set the environment variable correctly

## Cost Estimation

Approximate costs per query:
- **GPT-4o**: $0.005 - $0.02 per query
- **GPT-3.5-turbo**: $0.001 - $0.003 per query

Costs depend on the length of your data and questions. Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage).
