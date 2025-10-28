# Perplexity API Setup Guide

## Getting Perplexity API Key

1. Go to [Perplexity API](https://www.perplexity.ai/settings/api)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the API key (starts with `pplx-`)

## Setting up on Railway

1. Go to your Railway project dashboard
2. Click on your service
3. Go to the "Variables" tab
4. Add a new environment variable:
   - **Name**: `PERPLEXITY_API_KEY`
   - **Value**: Your Perplexity API key (e.g., `pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

## Testing the Integration

After setting the environment variable:

1. Railway will automatically redeploy your service
2. Test the chat interface
3. The agent should now provide intelligent responses using Perplexity's LLM

## Features

- **Hebrew Support**: Automatically detects Hebrew input and responds in Hebrew
- **English Support**: Responds in English for English input
- **Real-time**: Uses Perplexity's online model for current information
- **Fallback**: Falls back to simple rule-based responses if API key is not set

## Pricing

Perplexity API pricing:
- Pay-per-use model
- Very affordable for typical chat usage
- Check [Perplexity Pricing](https://www.perplexity.ai/settings/api) for current rates

## Alternative Models

You can change the model in `backend/src/services/conversationService.js`:

- `llama-3.1-sonar-small-128k-online` (default, fastest)
- `llama-3.1-sonar-large-128k-online` (more capable)
- `llama-3.1-sonar-huge-128k-online` (most capable)

## Troubleshooting

If you get errors:
1. Check that the API key is correctly set in Railway
2. Verify the API key is valid and has credits
3. Check Railway logs for any error messages
4. The service will fall back to simple responses if Perplexity fails
