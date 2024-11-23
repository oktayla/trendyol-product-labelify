const TOGETHER_API_KEY = '';
const OPENAI_API_KEY = '';

const DEFAULT_PROVIDER = 'openai';

const PROVIDERS = {
  openai: {
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: OPENAI_API_KEY,
    defaultModel: 'gpt-4o-2024-08-06',
  },
  together: {
    apiUrl: 'https://api.together.xyz/v1/chat/completions',
    apiKey: TOGETHER_API_KEY,
    defaultModel: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
  }
}

const PROVIDER = PROVIDERS[DEFAULT_PROVIDER];
