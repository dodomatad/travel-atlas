import { describe, it, expect, beforeEach } from 'vitest';
import { AIOrchestrator } from '@/lib/ai/orchestrator';
import { MockAIProvider } from '@/lib/ai/mockProvider';
import { ToolRegistry } from '@/lib/ai/tools';

describe('AIOrchestrator Intent and Progressive Disclosure', () => {
  let mockProvider: MockAIProvider;
  let orchestrator: AIOrchestrator;
  let tools: ToolRegistry;

  beforeEach(() => {
    mockProvider = new MockAIProvider();
    tools = new ToolRegistry();
    orchestrator = new AIOrchestrator(mockProvider, tools);
  });

  describe('Determinação de Intenções', () => {
    it('deve classificar pedidos de roteiro como BUILD_TRIP', () => {
      const intent = orchestrator.determineIntent('Monte uma viagem de 10 dias na Itália');
      expect(intent).toBe('BUILD_TRIP');
    });

    it('deve classificar pedidos de alteração como REPLAN', () => {
      const intent = orchestrator.determineIntent('Remova o museu pois está chovendo');
      expect(intent).toBe('REPLAN');
    });

    it('deve classificar perguntas sobre o momento atual como TRIP_COMPANION', () => {
      const intent = orchestrator.determineIntent('O que faço agora que terminei o almoço?');
      expect(intent).toBe('TRIP_COMPANION');
    });

    it('deve classificar dúvidas sobre moeda e visto como COUNTRY_INFO', () => {
      const intent = orchestrator.determineIntent('Quais são as exigências de visto e moeda?');
      expect(intent).toBe('COUNTRY_INFO');
    });

    it('deve classificar perguntas contextuais de país selecionado como ASK_COUNTRY', () => {
      const intent = orchestrator.determineIntent('Quando vale a pena visitar?', { selectedCountry: 'França' });
      expect(intent).toBe('ASK_COUNTRY');
    });
  });

  describe('Progressive Disclosure (Não repetir perguntas)', () => {
    it('deve perguntar o destino se nenhuma localidade for informada', () => {
      const missing = orchestrator.identifyMissingInformation('BUILD_TRIP', 'Quero viajar');
      expect(missing.length).toBe(1);
      expect(missing[0]).toContain('destino');
    });

    it('NÃO deve perguntar o destino se ele já constar no contexto', () => {
      const missing = orchestrator.identifyMissingInformation(
        'BUILD_TRIP', 
        'Quero viajar', 
        { selectedCountry: 'Japão' }
      );
      // Já tem o destino, agora pergunta a duração
      expect(missing.length).toBe(1);
      expect(missing[0]).toContain('Quantos dias');
    });

    it('NÃO deve perguntar a duração se a mensagem já trouxer a quantidade de dias', () => {
      const missing = orchestrator.identifyMissingInformation(
        'BUILD_TRIP', 
        'Quero viajar para a Itália por 7 dias',
        { selectedCountry: 'Itália' }
      );
      // Já tem destino e duração, agora pergunta orçamento
      expect(missing.length).toBe(1);
      expect(missing[0]).toContain('orçamento');
    });

    it('deve avançar para interesses se destino, dias e orçamento já estiverem resolvidos', () => {
      const missing = orchestrator.identifyMissingInformation(
        'BUILD_TRIP', 
        'Quero viajar para a Itália por 7 dias com orçamento moderado',
        { 
          selectedCountry: 'Itália',
          travelerProfile: { budgetLevel: 'MODERATE' } as any
        }
      );
      expect(missing.length).toBe(1);
      expect(missing[0]).toContain('interesses');
    });
  });
});
