import { IAIProvider, GenerateTextParams, GenerateTextResult, GenerateStructuredParams, StreamTextParams } from './provider';
import { z } from 'zod';

export interface MockProviderOptions {
  simulateTimeoutMs?: number;
  simulateHttpError?: number; // 429, 500, 503
  simulateMalformedJson?: boolean;
  simulateInvalidSchema?: boolean;
  customStructuredResponse?: unknown;
  customTextResponse?: string;
}

export class MockAIProvider implements IAIProvider {
  public readonly providerName = 'MockAIProvider';
  private options: MockProviderOptions;

  constructor(options: MockProviderOptions = {}) {
    this.options = options;
  }

  public setOptions(options: Partial<MockProviderOptions>): void {
    this.options = { ...this.options, ...options };
  }

  public resetOptions(): void {
    this.options = {};
  }

  private async checkSimulationTriggers(): Promise<void> {
    if (this.options.simulateTimeoutMs) {
      await new Promise(resolve => setTimeout(resolve, this.options.simulateTimeoutMs));
      throw new Error(`Provider timeout after ${this.options.simulateTimeoutMs}ms`);
    }

    if (this.options.simulateHttpError) {
      const error = new Error(`HTTP Error ${this.options.simulateHttpError}`);
      (error as any).status = this.options.simulateHttpError;
      throw error;
    }
  }

  public async generateText(params: GenerateTextParams): Promise<GenerateTextResult> {
    await this.checkSimulationTriggers();

    if (this.options.customTextResponse) {
      return {
        text: this.options.customTextResponse,
        usage: { promptTokens: 10, completionTokens: 15, totalTokens: 25 },
      };
    }

    return {
      text: 'Mock response generated successfully for travel intelligence query.',
      usage: { promptTokens: 15, completionTokens: 15, totalTokens: 30 },
    };
  }

  public async generateStructured<T>(params: GenerateStructuredParams<T>): Promise<T> {
    await this.checkSimulationTriggers();

    if (this.options.simulateMalformedJson) {
      throw new SyntaxError('Unexpected token < in JSON at position 0');
    }

    if (this.options.simulateInvalidSchema) {
      // Retorna objeto propositalmente quebrado para testar rejeição do Zod
      return { brokenField: 'invalid', numbers: 'not-a-number' } as unknown as T;
    }

    if (this.options.customStructuredResponse !== undefined) {
      const parsed = params.schema.safeParse(this.options.customStructuredResponse);
      if (!parsed.success) {
        throw parsed.error;
      }
      return parsed.data;
    }

    // Se for schema genérico, cria um fallback básico de teste
    throw new Error('MockAIProvider: Nenhum customStructuredResponse configurado para o schema solicitado.');
  }

  public async *streamText(params: StreamTextParams): AsyncIterable<string> {
    await this.checkSimulationTriggers();
    const chunks = ['Olá! ', 'Sou o ', 'Travel ', 'Intelligence ', 'Agent.'];
    for (const chunk of chunks) {
      yield chunk;
    }
  }
}
