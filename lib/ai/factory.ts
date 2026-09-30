import { IAIProvider } from './provider';
import { LlamaProvider } from './llamaProvider';
import { MockAIProvider } from './mockProvider';

let cachedProvider: IAIProvider | null = null;

export function getAIProvider(): IAIProvider {
  if (cachedProvider) return cachedProvider;

  if (process.env.USE_MOCK_AI === 'true' || (process.env.VERCEL === '1' && !process.env.LLAMA_BASE_URL)) {
    cachedProvider = new MockAIProvider();
    return cachedProvider;
  }

  // Por padrão usa o Llama local (ou endpoint configurado em LLAMA_BASE_URL)
  cachedProvider = new LlamaProvider({
    baseUrl: process.env.LLAMA_BASE_URL || 'http://127.0.0.1:11434',
    model: process.env.LLAMA_MODEL || 'llama3.2:3b',
  });

  return cachedProvider;
}
