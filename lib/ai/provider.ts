import { z } from 'zod';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
}

export interface GenerateTextParams {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateTextResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface GenerateStructuredParams<T> {
  messages: AIMessage[];
  schema: z.ZodType<T>;
  temperature?: number;
  schemaName?: string;
}

export interface StreamTextParams {
  messages: AIMessage[];
  temperature?: number;
}

export interface ToolCallRequest {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolCallResponse {
  id: string;
  name: string;
  result: unknown;
  isError?: boolean;
}

export interface IAIProvider {
  readonly providerName: string;
  generateText(params: GenerateTextParams): Promise<GenerateTextResult>;
  generateStructured<T>(params: GenerateStructuredParams<T>): Promise<T>;
  streamText(params: StreamTextParams): AsyncIterable<string>;
}
