import { describe, it, expect, beforeEach } from 'vitest';
import { ToolRegistry } from '@/lib/ai/tools';

describe('Tool Registry and Tool Contracts', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  it('deve listar todas as 10 ferramentas previstas', () => {
    const tools = registry.listToolNames();
    expect(tools.length).toBe(10);
    expect(tools).toContain('search_web');
    expect(tools).toContain('get_country_info');
    expect(tools).toContain('get_weather');
    expect(tools).toContain('get_exchange_rate');
    expect(tools).toContain('search_places');
    expect(tools).toContain('search_restaurants');
    expect(tools).toContain('search_hotels');
    expect(tools).toContain('get_transport_options');
    expect(tools).toContain('get_entry_requirements');
    expect(tools).toContain('get_trip_events');
  });

  it('deve executar uma ferramenta válida com sucesso', async () => {
    const result = await registry.executeTool('get_country_info', { country: 'Itália' });
    expect(result.success).toBe(true);
    expect((result.data as any).country).toBe('Itália');
  });

  it('deve rejeitar execução quando argumentos violarem o schema Zod', async () => {
    // get_country_info exige string não vazia
    const result = await registry.executeTool('get_country_info', { country: '' });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('deve retornar erro controlado ao chamar ferramenta inexistente', async () => {
    const result = await registry.executeTool('tool_fantasma', {});
    expect(result.success).toBe(false);
    expect(result.error).toContain('não encontrada');
  });

  it('deve calcular taxa de câmbio para moedas suportadas', async () => {
    const result = await registry.executeTool('get_exchange_rate', { fromCurrency: 'USD', toCurrency: 'BRL' });
    expect(result.success).toBe(true);
    expect((result.data as any).rate).toBeGreaterThan(0);
  });
});
