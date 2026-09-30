import { NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/factory';
import { TripItinerarySchema } from '@/lib/ai/schemas';
import { optimizeRouteNearestNeighbor } from '@/lib/proximity';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { destination, days = 5, travelerProfile, budget = 'MODERATE', startDate } = await req.json();

    if (!destination) {
      return NextResponse.json({ error: 'Parâmetro destination é obrigatório.' }, { status: 400 });
    }

    const provider = getAIProvider();
    const effectiveStart = startDate || new Date().toISOString().split('T')[0];
    const endDateObj = new Date(effectiveStart);
    endDateObj.setDate(endDateObj.getDate() + Math.max(1, days - 1));
    const effectiveEnd = endDateObj.toISOString().split('T')[0];

    const prompt = `Monte um roteiro completo de ${days} dias para ${destination}.
Data de início: ${effectiveStart}, término: ${effectiveEnd}.
Orçamento: ${budget}.
Perfil do Viajante: ${JSON.stringify(travelerProfile || {})}.
Regras obrigatórias:
- Crie exatamente ${days} dias (dia 1 até dia ${days}).
- Cada dia deve conter entre 2 e 4 atividades com horários em formato HH:MM (ex: 09:00, 12:30).
- Horário final de cada atividade deve ser posterior ao inicial.
- Inclua coordenadas geográficas realistas (lat/lng numéricos) para cada atividade no destino.
- Responda estritamente no schema TripItinerarySchema.`;

    const itinerary = await provider.generateStructured({
      messages: [
        { role: 'system', content: 'Você é um planejador de viagens mestre, hiper-organizado e geograficamente preciso.' },
        { role: 'user', content: prompt }
      ],
      schema: TripItinerarySchema,
      schemaName: 'TripItinerarySchema',
      temperature: 0.2,
    });

    // Otimização Geográfica determinística com lib/proximity.ts em cada dia
    if (itinerary.days && Array.isArray(itinerary.days)) {
      itinerary.days = itinerary.days.map(day => {
        if (day.activities && day.activities.length > 1) {
          const optimized = optimizeRouteNearestNeighbor(day.activities);
          return { ...day, activities: optimized as any };
        }
        return day;
      });
    }

    return NextResponse.json(itinerary);
  } catch (error: any) {
    console.error('API /api/ai/planner error:', error);
    
    // Fallback defensivo determinístico
    const nowStr = new Date().toISOString().split('T')[0];
    return NextResponse.json({
      tripId: `trip-${Date.now()}`,
      destination: 'Destino Selecionado',
      startDate: nowStr,
      endDate: nowStr,
      totalEstimatedCost: 500,
      currency: 'USD',
      days: [
        {
          dayNumber: 1,
          date: nowStr,
          city: 'Centro',
          theme: 'Chegada e Boas-Vindas',
          estimatedBudget: 150,
          activities: [
            {
              startTime: '10:00',
              endTime: '12:00',
              title: 'Caminhada e Ambientação',
              type: 'ATTRACTION',
              location: 'Ponto Central',
              coordinates: { lat: 0, lng: 0 },
              durationMinutes: 120,
              estimatedCost: 0,
              currency: 'USD',
            },
            {
              startTime: '13:00',
              endTime: '14:30',
              title: 'Almoço Gastronômico Local',
              type: 'MEAL',
              location: 'Restaurante Tradicional',
              coordinates: { lat: 0.005, lng: 0.005 },
              durationMinutes: 90,
              estimatedCost: 35,
              currency: 'USD',
            }
          ]
        }
      ]
    });
  }
}
