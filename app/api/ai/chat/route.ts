import { NextResponse } from 'next/server';
import { AIOrchestrator } from '@/lib/ai/orchestrator';
import { getAIProvider } from '@/lib/ai/factory';
import { ToolRegistry } from '@/lib/ai/tools';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Parâmetro message obrigatório.' }, { status: 400 });
    }

    const provider = getAIProvider();
    const tools = new ToolRegistry();
    const orchestrator = new AIOrchestrator(provider, tools);

    const response = await orchestrator.processRequest({
      userMessage: message,
      context,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('API /api/ai/chat error:', error);
    return NextResponse.json({
      intent: 'COUNTRY_INFO',
      message: 'Ocorreu uma falha temporária ao consultar o assistente de IA. Tente novamente em instantes.',
      questionsForUser: [],
      needsMoreInfo: false,
      sources: [],
    }, { status: 500 });
  }
}
