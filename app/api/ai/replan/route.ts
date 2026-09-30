import { NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/factory';
import { TripItinerarySchema } from '@/lib/ai/schemas';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const itinerary = body.itinerary || body.originalItinerary;
    const reason = body.reason || body.event || 'Alteração solicitada pelo usuário';

    if (!itinerary || !itinerary.days) {
      return NextResponse.json({ error: 'Itinerário válido é obrigatório para replanejamento.' }, { status: 400 });
    }

    const provider = getAIProvider();

    const prompt = `Replaneje o seguinte roteiro com base nesta necessidade: "${reason}".
Itinerário atual: ${JSON.stringify(itinerary)}.
Ajuste as atividades do dia afetado de forma lógica e equilibrada, preservando os dias que não precisam de alteração.
Responda estritamente no schema TripItinerarySchema.`;

    const updatedItinerary = await provider.generateStructured({
      messages: [
        { role: 'system', content: 'Você é um assistente de replanejamento ágil de viagens, adaptando atividades a clima e preferências.' },
        { role: 'user', content: prompt }
      ],
      schema: TripItinerarySchema,
      schemaName: 'TripItinerarySchema',
      temperature: 0.3,
    });

    return NextResponse.json(updatedItinerary);
  } catch (error: any) {
    console.error('API /api/ai/replan error:', error);
    return NextResponse.json({ error: 'Não foi possível replanejar no momento.' }, { status: 500 });
  }
}
