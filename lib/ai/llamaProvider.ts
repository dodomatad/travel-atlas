import { 
  IAIProvider, 
  GenerateTextParams, 
  GenerateTextResult, 
  GenerateStructuredParams, 
  StreamTextParams,
  AIMessage 
} from './provider';
import { z } from 'zod';

export interface LlamaProviderConfig {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

export class LlamaProvider implements IAIProvider {
  public readonly providerName = 'LlamaProvider';
  private baseUrl: string;
  private model: string;
  private timeoutMs: number;

  constructor(config: LlamaProviderConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.LLAMA_BASE_URL || 'http://127.0.0.1:11434';
    this.model = config.model || process.env.LLAMA_MODEL || 'llama3.2:3b';
    this.timeoutMs = config.timeoutMs || 90000;
  }

  public getModelName(): string {
    return this.model;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private formatMessages(messages: AIMessage[]) {
    return messages.map(m => ({
      role: m.role === 'tool' ? 'user' : m.role,
      content: m.content,
    }));
  }

  public async generateText(params: GenerateTextParams): Promise<GenerateTextResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          messages: this.formatMessages(params.messages),
          stream: false,
          options: {
            temperature: params.temperature ?? 0.7,
            num_predict: params.maxTokens ?? 1024,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Ollama HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      return {
        text: data?.message?.content || '',
        usage: {
          promptTokens: data?.prompt_eval_count || 0,
          completionTokens: data?.eval_count || 0,
          totalTokens: (data?.prompt_eval_count || 0) + (data?.eval_count || 0),
        },
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error(`LlamaProvider: Requisição excedeu o timeout de ${this.timeoutMs}ms.`);
      }
      if (err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
        throw new Error(`LlamaProvider: Não foi possível conectar ao Ollama em ${this.baseUrl}. Verifique se o serviço está em execução.`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  public async generateStructured<T>(params: GenerateStructuredParams<T>): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    // Instrução reforçada para emissão de JSON puro
    const augmentedMessages: AIMessage[] = [
      ...params.messages,
      {
        role: 'system',
        content: `IMPORTANTE: Responda única e estritamente com um objeto JSON válido, sem texto explicativo adicional nem delimitadores de markdown. O JSON deve satisfazer o schema ${params.schemaName || 'requisitado'}.`,
      },
    ];

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.model,
          messages: this.formatMessages(augmentedMessages),
          format: 'json',
          stream: false,
          options: {
            temperature: params.temperature ?? 0.2, // Baixa temperatura para rigidez estrutural
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Ollama HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      const rawText = data?.message?.content || '{}';

      // Sanitização defensiva de blocos markdown ```json
      let jsonString = rawText.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```/, '').replace(/```$/, '').trim();
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(jsonString);
      } catch (jsonErr: any) {
        throw new Error(`LlamaProvider: Resposta do modelo não pôde ser parseada como JSON válido: ${jsonErr.message}. Conteúdo bruto: ${rawText}`);
      }

      const validation = params.schema.safeParse(parsedJson);
      if (!validation.success) {
        throw new Error(`LlamaProvider: Validação Zod rejeitou a estrutura retornada pelo Llama: ${validation.error.message}`);
      }

      return validation.data;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error(`LlamaProvider: Timeout na geração estruturada (${this.timeoutMs}ms).`);
      }
      if (err.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
        throw new Error(`LlamaProvider: Falha de conexão com o Ollama local em ${this.baseUrl}.`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  public async *streamText(params: StreamTextParams): AsyncIterable<string> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: this.formatMessages(params.messages),
        stream: true,
        options: {
          temperature: params.temperature ?? 0.7,
        },
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Ollama Streaming HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          const chunk = parsed?.message?.content;
          if (chunk) yield chunk;
        } catch {
          // Ignora linhas parciais
        }
      }
    }
  }
}
