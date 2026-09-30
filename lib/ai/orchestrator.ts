import { IAIProvider } from './provider';
import { ToolRegistry } from './tools';
import { SecurityGuard } from './security';
import { AILogger } from './observability';
import { 
  AIIntent, 
  AIIntentSchema, 
  AIResponse, 
  AIResponseSchema, 
  TravelerProfile, 
  TripItinerary 
} from './schemas';

export interface OrchestratorContext {
  userId?: string;
  selectedCountry?: string;
  selectedCity?: string;
  travelerProfile?: Partial<TravelerProfile>;
  currentItinerary?: TripItinerary;
  knownDates?: { startDate?: string; endDate?: string };
  knownDurationDays?: number;
}

export interface OrchestratorRequest {
  userMessage: string;
  context?: OrchestratorContext;
}

export class AIOrchestrator {
  private provider: IAIProvider;
  private tools: ToolRegistry;

  constructor(provider: IAIProvider, tools: ToolRegistry = new ToolRegistry()) {
    this.provider = provider;
    this.tools = tools;
  }

  // 1. Interpretação heurística de intenção
  public determineIntent(message: string, context?: OrchestratorContext): AIIntent {
    const msg = message.toLowerCase();

    if (msg.includes('replaneje') || msg.includes('troque') || msg.includes('remova') || msg.includes('cansado') || msg.includes('chovendo')) {
      return 'REPLAN';
    }
    if (msg.includes('o que faço agora') || msg.includes('estou aqui') || msg.includes('próximo passo')) {
      return 'TRIP_COMPANION';
    }
    if (msg.includes('monte') || msg.includes('planeje') || msg.includes('roteiro') || msg.includes('viagem de') || msg.includes('dias em')) {
      return 'BUILD_TRIP';
    }
    if (msg.includes('como é') || msg.includes('informações') || msg.includes('visto') || msg.includes('moeda') || msg.includes('segurança')) {
      return 'COUNTRY_INFO';
    }
    if (context?.selectedCountry && (msg.includes('qual') || msg.includes('quando') || msg.includes('vale a pena'))) {
      return 'ASK_COUNTRY';
    }

    return 'COUNTRY_INFO';
  }

  // 2. Progressive Disclosure: Identifica apenas as perguntas faltantes
  public identifyMissingInformation(intent: AIIntent, message: string, context?: OrchestratorContext): string[] {
    if (intent !== 'BUILD_TRIP') return [];

    const msg = message.toLowerCase();
    const missing: string[] = [];

    const hasDestination = Boolean(context?.selectedCountry || context?.selectedCity || this.extractMentionedCountry(message));
    if (!hasDestination) {
      missing.push('Qual é o destino desejado para a viagem?');
    }

    const hasDuration = Boolean(context?.knownDurationDays || /\b(\d+)\s*(dias|semanas)\b/i.test(msg));
    if (!hasDuration) {
      missing.push('Quantos dias pretende ficar no destino?');
    }

    const hasBudget = Boolean(context?.travelerProfile?.budgetLevel || msg.includes('econômico') || msg.includes('moderado') || msg.includes('luxo'));
    if (!hasBudget && missing.length === 0) {
      missing.push('Qual é o seu perfil de orçamento (Econômico, Moderado ou Luxo)?');
    }

    const hasInterests = Boolean(context?.travelerProfile?.interests?.length || msg.includes('história') || msg.includes('gastronomia') || msg.includes('natureza') || msg.includes('praia'));
    if (!hasInterests && missing.length === 0) {
      missing.push('Quais seus principais interesses (ex: História, Gastronomia, Natureza, Compras)?');
    }

    // Retorna apenas a PRIMEIRA pergunta necessária para não sobrecarregar o usuário
    return missing.slice(0, 1);
  }

  private extractMentionedCountry(message: string): string | null {
    const common = ['itália', 'japão', 'frança', 'brasil', 'portugal', 'espanha', 'eua', 'grécia', 'alemanha'];
    const lower = message.toLowerCase();
    for (const c of common) {
      if (lower.includes(c)) return c.toUpperCase();
    }
    return null;
  }

  // 3. Orquestração Principal
  public async processRequest(request: OrchestratorRequest): Promise<AIResponse> {
    const requestId = AILogger.generateRequestId();
    const startTime = Date.now();

    // Validação de Segurança
    const sec = SecurityGuard.validateUserInput(request.userMessage);
    if (!sec.safe) {
      AILogger.log({
        requestId,
        status: 'ERROR',
        error: sec.reason,
        metadata: { inputLength: request.userMessage.length }
      });
      return {
        intent: 'COUNTRY_INFO',
        message: 'A mensagem enviada não pôde ser processada por razões de segurança ou formato inválido.',
        questionsForUser: [],
        needsMoreInfo: false,
        sources: [],
      };
    }

    const intent = this.determineIntent(request.userMessage, request.context);
    const missingQuestions = this.identifyMissingInformation(intent, request.userMessage, request.context);

    // Se faltarem informações fundamentais para o planejamento, aplica Progressive Disclosure imediatamente
    if (missingQuestions.length > 0) {
      AILogger.log({
        requestId,
        intent,
        status: 'SUCCESS',
        latencyMs: Date.now() - startTime,
        metadata: { progressiveDisclosure: true }
      });

      return {
        intent,
        message: 'Com certeza! Vamos montar o seu roteiro perfeito.',
        questionsForUser: missingQuestions,
        needsMoreInfo: true,
        sources: [],
      };
    }

    // Executa ferramentas autorizadas
    const allowedTools = SecurityGuard.getAllowedToolsForIntent(intent);
    const toolResults: Record<string, unknown> = {};

    if (allowedTools.includes('get_country_info') && request.context?.selectedCountry) {
      const toolRes = await this.tools.executeTool('get_country_info', { country: request.context.selectedCountry });
      if (toolRes.success) {
        toolResults['countryInfo'] = toolRes.data;
      }
    }

    try {
      // Para conversação e informações gerais, usa geração direta de texto rápida
      if (intent !== 'BUILD_TRIP') {
        const textResult = await this.provider.generateText({
          messages: [
            { 
              role: 'system', 
              content: `Você é o Travel Intelligence Engine. Responda em português brasileiro de forma direta, agradável, concisa e altamente prática sobre viagens, destinos e roteiros.` 
            },
            { role: 'user', content: request.userMessage }
          ],
          temperature: 0.7,
          maxTokens: 512,
        });

        AILogger.log({
          requestId,
          intent,
          status: 'SUCCESS',
          provider: this.provider.providerName,
          latencyMs: Date.now() - startTime,
        });

        return {
          intent,
          message: textResult.text,
          questionsForUser: [],
          needsMoreInfo: false,
          sources: [{ sourceName: 'Llama 3.2 Travel Intelligence' }],
        };
      }

      // Para planejamento estruturado, chama o AI Provider configurado
      const structuredResult = await this.provider.generateStructured<AIResponse>({
        messages: [
          { role: 'system', content: `Você é o Travel Intelligence Engine. Intenção: ${intent}.` },
          { role: 'user', content: request.userMessage }
        ],
        schema: AIResponseSchema,
        schemaName: 'AIResponse'
      });

      AILogger.log({
        requestId,
        intent,
        status: 'SUCCESS',
        provider: this.provider.providerName,
        latencyMs: Date.now() - startTime,
      });

      return structuredResult;
    } catch (err: any) {
      AILogger.log({
        requestId,
        intent,
        status: 'ERROR',
        provider: this.provider.providerName,
        latencyMs: Date.now() - startTime,
        error: err?.message || 'Falha no processamento da resposta estruturada.',
      });

      // Recuperação defensiva estruturada: nunca quebra a tela do usuário
      return {
        intent,
        message: 'Não foi possível estruturar todos os dados no momento, mas estamos atualizando as informações com segurança.',
        questionsForUser: [],
        needsMoreInfo: false,
        sources: [],
      };
    }
  }
}
