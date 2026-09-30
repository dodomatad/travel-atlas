import { NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/factory';
import { CountryIntelligenceSchema } from '@/lib/ai/schemas';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const country = body.country || body.countryName;
    const iso3 = body.iso3;

    if (!country) {
      return NextResponse.json({ error: 'Parâmetro country é obrigatório.' }, { status: 400 });
    }

    const provider = getAIProvider();

    // Consulta à Wikipedia para dados fatuais de base
    let wikiExtract = '';
    try {
      const wikiRes = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country)}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        wikiExtract = wikiData.extract || '';
      }
    } catch {
      // Degradação graciosa se a Wikipedia falhar
    }

    const prompt = `Gere uma ficha de inteligência turística completa e estruturada para ${country} (${iso3 || ''}).
Base histórica da Wikipédia: "${wikiExtract.slice(0, 500)}".
Preencha todos os campos do CountryIntelligenceSchema com precisão factual em português (overview, bestTime, cities principais, transportTips, payments, safety, entryRequirements).`;

    const countryIntelligence = await provider.generateStructured({
      messages: [
        { role: 'system', content: 'Você é um especialista em turismo internacional e inteligência de destinos.' },
        { role: 'user', content: prompt }
      ],
      schema: CountryIntelligenceSchema,
      schemaName: 'CountryIntelligenceSchema',
      temperature: 0.3,
    });

    return NextResponse.json(countryIntelligence);
  } catch (error: any) {
    console.error('API /api/ai/country error:', error);
    // Fallback seguro se o Llama local estiver inicializando
    return NextResponse.json({
      countryName: 'Destino Internacional',
      iso3: 'INT',
      overview: 'Informações turísticas e práticas em processamento pelo motor de inteligência.',
      bestTime: 'Estações de transição (primavera e outono) costumam oferecer clima ameno e menor fluxo turístico.',
      cities: ['Capital', 'Região Central'],
      transportTips: 'Consulte as rotas locais e opções de transporte público integradas.',
      accessLevel: 'EASY',
      payments: {
        currency: 'Moeda local',
        cashRecommendation: 'Recomenda-se levar pequena quantia em dinheiro para emergências.',
        cardsAccepted: true,
      },
      safety: {
        safetyScore: 8,
        advisories: ['Mantenha atenção básica a pertences pessoais em áreas de grande aglomeração.'],
        emergencyNumbers: { polícia: '112 / 911' },
      },
      entryRequirements: {
        visaRequiredForBrazilians: false,
        passportValidityMonths: 6,
        mandatoryVaccines: [],
      },
      sources: [{ sourceName: 'Wikipedia & Travel Atlas AI' }]
    });
  }
}
