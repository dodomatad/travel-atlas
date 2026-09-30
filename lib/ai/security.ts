import 'server-only';
import { AIIntent } from './schemas';

export class SecurityGuard {
  // Detector heurístico simples de tentativas óbvias de prompt injection
  private static readonly INJECTION_PATTERNS = [
    /ignore all previous instructions/i,
    /ignore your instructions/i,
    /disregard previous prompts/i,
    /reveal your system prompt/i,
    /show your initial instructions/i,
    /exfiltrate/i,
    /bypass guardrails/i,
  ];

  public static validateUserInput(text: string): { safe: boolean; reason?: string } {
    if (!text || typeof text !== 'string') {
      return { safe: false, reason: 'Input vazio ou inválido.' };
    }

    if (text.length > 4000) {
      return { safe: false, reason: 'Texto excede o limite máximo permitido de 4000 caracteres.' };
    }

    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(text)) {
        return { safe: false, reason: 'Tentativa de manipulação de instrução detectada.' };
      }
    }

    return { safe: true };
  }

  // Allowlist estrita de ferramentas autorizadas por intenção
  public static getAllowedToolsForIntent(intent: AIIntent): string[] {
    switch (intent) {
      case 'ASK_COUNTRY':
      case 'COUNTRY_INFO':
        return ['get_country_info', 'search_web', 'get_weather', 'get_exchange_rate', 'get_entry_requirements'];
      case 'BUILD_TRIP':
        return [
          'get_country_info',
          'search_places',
          'search_restaurants',
          'search_hotels',
          'get_transport_options',
          'get_weather',
          'get_trip_events',
          'get_exchange_rate',
        ];
      case 'REPLAN':
        return ['search_places', 'search_restaurants', 'get_weather', 'get_transport_options'];
      case 'TRIP_COMPANION':
        return ['search_places', 'search_restaurants', 'get_weather', 'get_transport_options'];
      default:
        return [];
    }
  }
}

// In-memory Token Bucket Rate Limiter
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private maxRequestsPerWindow: number;
  private windowMs: number;

  constructor(maxRequests = 20, windowMs = 60000) {
    this.maxRequestsPerWindow = maxRequests;
    this.windowMs = windowMs;
  }

  public checkLimit(clientId: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const clientData = this.requests.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      this.requests.set(clientId, { count: 1, resetTime: now + this.windowMs });
      return { allowed: true, remaining: this.maxRequestsPerWindow - 1 };
    }

    if (clientData.count >= this.maxRequestsPerWindow) {
      return { allowed: false, remaining: 0 };
    }

    clientData.count += 1;
    return { allowed: true, remaining: this.maxRequestsPerWindow - clientData.count };
  }

  public reset(): void {
    this.requests.clear();
  }
}
