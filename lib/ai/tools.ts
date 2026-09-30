import { z } from 'zod';

export interface ToolDefinition<TInput = any, TOutput = any> {
  name: string;
  description: string;
  inputSchema: z.ZodType<TInput>;
  execute: (input: TInput) => Promise<TOutput>;
}

// 1. search_web
export const SearchWebInputSchema = z.object({
  query: z.string().min(1),
  maxResults: z.number().int().positive().default(3),
});
export const searchWebTool: ToolDefinition<z.infer<typeof SearchWebInputSchema>> = {
  name: 'search_web',
  description: 'Pesquisa informações recentes e verificadas na web.',
  inputSchema: SearchWebInputSchema,
  execute: async ({ query, maxResults }) => {
    return {
      results: [
        { title: `Resultado sobre ${query}`, snippet: `Informações turísticas e práticas sobre ${query}.`, url: `https://example.com/search?q=${encodeURIComponent(query)}` }
      ].slice(0, maxResults)
    };
  }
};

// 2. get_country_info
export const GetCountryInfoInputSchema = z.object({
  country: z.string().min(1),
});
export const getCountryInfoTool: ToolDefinition<z.infer<typeof GetCountryInfoInputSchema>> = {
  name: 'get_country_info',
  description: 'Obtém dados gerais de cultura, história, capital e idioma do país.',
  inputSchema: GetCountryInfoInputSchema,
  execute: async ({ country }) => {
    return {
      country,
      capital: 'Capital de ' + country,
      officialLanguage: 'Idioma oficial',
      currency: 'Moeda local',
      accessLevel: 'EASY',
      overview: `Visão geral factual e curada sobre o turismo em ${country}.`
    };
  }
};

// 3. get_weather
export const GetWeatherInputSchema = z.object({
  city: z.string().min(1),
  monthOrDate: z.string().optional(),
});
export const getWeatherTool: ToolDefinition<z.infer<typeof GetWeatherInputSchema>> = {
  name: 'get_weather',
  description: 'Consulta temperatura média, probabilidade de chuva e clima sazonal.',
  inputSchema: GetWeatherInputSchema,
  execute: async ({ city, monthOrDate }) => {
    return {
      city,
      period: monthOrDate || 'current',
      temperatureC: 22,
      condition: 'Sol com poucas nuvens',
      rainProbabilityPercent: 15,
      recommendation: 'Clima propício para atividades ao ar livre.'
    };
  }
};

// 4. get_exchange_rate
export const GetExchangeRateInputSchema = z.object({
  fromCurrency: z.string().min(3).max(3),
  toCurrency: z.string().min(3).max(3).default('BRL'),
});
export const getExchangeRateTool: ToolDefinition<z.infer<typeof GetExchangeRateInputSchema>> = {
  name: 'get_exchange_rate',
  description: 'Retorna a taxa de câmbio atual entre duas moedas.',
  inputSchema: GetExchangeRateInputSchema,
  execute: async ({ fromCurrency, toCurrency }) => {
    const rates: Record<string, number> = {
      'USD-BRL': 5.45,
      'EUR-BRL': 5.95,
      'GBP-BRL': 7.10,
      'JPY-BRL': 0.036,
    };
    const key = `${fromCurrency.toUpperCase()}-${toCurrency.toUpperCase()}`;
    return {
      from: fromCurrency,
      to: toCurrency,
      rate: rates[key] || 1.0,
      asOf: new Date().toISOString().split('T')[0]
    };
  }
};

// 5. search_places
export const SearchPlacesInputSchema = z.object({
  city: z.string().min(1),
  category: z.enum(['HISTORIC', 'MUSEUM', 'NATURE', 'PARK', 'VIEWPOINT', 'ALL']).default('ALL'),
});
export const searchPlacesTool: ToolDefinition<z.infer<typeof SearchPlacesInputSchema>> = {
  name: 'search_places',
  description: 'Localiza pontos turísticos e atrações renomadas na cidade.',
  inputSchema: SearchPlacesInputSchema,
  execute: async ({ city, category }) => {
    return {
      city,
      places: [
        { name: `Centro Histórico de ${city}`, type: 'HISTORIC', coordinates: { lat: 0, lng: 0 }, estimatedTimeHours: 2.5 },
        { name: `Mirante Panorâmico de ${city}`, type: 'VIEWPOINT', coordinates: { lat: 0.01, lng: 0.01 }, estimatedTimeHours: 1.5 },
      ]
    };
  }
};

// 6. search_restaurants
export const SearchRestaurantsInputSchema = z.object({
  city: z.string().min(1),
  cuisinePreference: z.string().optional(),
  budgetLevel: z.enum(['ECONOMY', 'MODERATE', 'LUXURY']).default('MODERATE'),
});
export const searchRestaurantsTool: ToolDefinition<z.infer<typeof SearchRestaurantsInputSchema>> = {
  name: 'search_restaurants',
  description: 'Pesquisa opções gastronômicas respeitando preferências e orçamento.',
  inputSchema: SearchRestaurantsInputSchema,
  execute: async ({ city, cuisinePreference, budgetLevel }) => {
    return {
      city,
      restaurants: [
        { name: `Bistrô Tradicional ${city}`, cuisine: cuisinePreference || 'Local', budget: budgetLevel, priceRange: '$$' },
        { name: `Café Central ${city}`, cuisine: 'Café & Sobremesas', budget: 'ECONOMY', priceRange: '$' },
      ]
    };
  }
};

// 7. search_hotels
export const SearchHotelsInputSchema = z.object({
  city: z.string().min(1),
  budgetLevel: z.enum(['ECONOMY', 'MODERATE', 'LUXURY']).default('MODERATE'),
});
export const searchHotelsTool: ToolDefinition<z.infer<typeof SearchHotelsInputSchema>> = {
  name: 'search_hotels',
  description: 'Encontra hotéis e regiões seguras recomendadas para hospedagem.',
  inputSchema: SearchHotelsInputSchema,
  execute: async ({ city, budgetLevel }) => {
    return {
      city,
      recommendedNeighborhoods: ['Bairro Central', 'Distrito Histórico'],
      options: [
        { name: `Hotel Boutique ${city}`, neighborhood: 'Bairro Central', category: budgetLevel, rating: 4.8 }
      ]
    };
  }
};

// 8. get_transport_options
export const GetTransportOptionsInputSchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
});
export const getTransportOptionsTool: ToolDefinition<z.infer<typeof GetTransportOptionsInputSchema>> = {
  name: 'get_transport_options',
  description: 'Informa meios de transporte entre duas cidades ou pontos (trem, voo, carro).',
  inputSchema: GetTransportOptionsInputSchema,
  execute: async ({ origin, destination }) => {
    return {
      origin,
      destination,
      options: [
        { mode: 'TRAIN', estimatedDuration: '2h 15m', convenienceScore: 9, notes: 'Trem de alta velocidade com saídas horárias.' },
        { mode: 'FLIGHT', estimatedDuration: '1h 00m', convenienceScore: 7, notes: 'Voo direto.' }
      ]
    };
  }
};

// 9. get_entry_requirements
export const GetEntryRequirementsInputSchema = z.object({
  destinationCountry: z.string().min(1),
  travelerNationality: z.string().default('Brasil'),
});
export const getEntryRequirementsTool: ToolDefinition<z.infer<typeof GetEntryRequirementsInputSchema>> = {
  name: 'get_entry_requirements',
  description: 'Verifica exigências de visto, passaporte e vacinas obrigatórias.',
  inputSchema: GetEntryRequirementsInputSchema,
  execute: async ({ destinationCountry, travelerNationality }) => {
    return {
      destination: destinationCountry,
      nationality: travelerNationality,
      visaRequired: false,
      maxStayDays: 90,
      passportValidityMonths: 6,
      mandatoryVaccines: ['Febre Amarela (se aplicável)'],
      source: 'Consulado Geral / IATA Travel Centre'
    };
  }
};

// 10. get_trip_events
export const GetTripEventsInputSchema = z.object({
  city: z.string().min(1),
  month: z.number().int().min(1).max(12).optional(),
});
export const getTripEventsTool: ToolDefinition<z.infer<typeof GetTripEventsInputSchema>> = {
  name: 'get_trip_events',
  description: 'Identifica festivais, feriados e eventos culturais na localidade.',
  inputSchema: GetTripEventsInputSchema,
  execute: async ({ city, month }) => {
    return {
      city,
      events: [
        { name: `Festival Cultural de ${city}`, month: month || 5, description: 'Exposições a céu aberto e música local.' }
      ]
    };
  }
};

export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  constructor() {
    this.register(searchWebTool);
    this.register(getCountryInfoTool);
    this.register(getWeatherTool);
    this.register(getExchangeRateTool);
    this.register(searchPlacesTool);
    this.register(searchRestaurantsTool);
    this.register(searchHotelsTool);
    this.register(getTransportOptionsTool);
    this.register(getEntryRequirementsTool);
    this.register(getTripEventsTool);
  }

  public register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  public listToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  public async executeTool(name: string, inputArgs: unknown): Promise<{ success: boolean; data?: unknown; error?: string }> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { success: false, error: `Ferramenta '${name}' não encontrada no registry.` };
    }

    try {
      const validatedInput = tool.inputSchema.parse(inputArgs);
      const data = await tool.execute(validatedInput);
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Falha na execução da ferramenta.' };
    }
  }
}
