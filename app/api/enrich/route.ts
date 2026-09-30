import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeName = searchParams.get('place') || '';
  const type = searchParams.get('type') || 'COUNTRY';

  if (!placeName) {
    return NextResponse.json({ error: 'Missing place name' }, { status: 400 });
  }

  try {
    // Busca real na Wikipedia (REST API)
    const wikiRes = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(placeName)}`);
    const wikiData = await wikiRes.json();
    const summary = wikiData?.extract || `Informações históricas sobre ${placeName} estão sendo atualizadas pela nossa curadoria.`;

    // Como não temos a API Key real do Gemini/Groq aqui no backend estático,
    // usamos o dado real da Wiki + curadoria inteligente simulada baseada no local.
    
    // Definir classificação de acesso dinamicamente (simulada via heurística do local)
    let accessLevel = '🟢 Fácil Acesso';
    let transportTips = 'Voos diretos frequentes e malha de transporte público moderna.';
    
    const moderateAccess = ['Bolívia', 'Peru', 'Colômbia', 'México', 'Marrocos', 'Islândia', 'Turquia', 'Egito', 'Lençóis Maranhenses', 'Salar de Uyuni'];
    const complexAccess = ['Maldivas', 'Filipinas', 'Indonésia', 'Lapônia', 'El Nido', 'Boracay'];
    
    if (complexAccess.some(a => placeName.includes(a))) {
      accessLevel = '🔴 Acesso Logístico Complexo';
      transportTips = 'Múltiplas conexões, possíveis exigências de autorizações especiais ou uso de hidroaviões/barcos. Planeje a logística com antecedência.';
    } else if (moderateAccess.some(a => placeName.includes(a))) {
      accessLevel = '🟡 Acesso Moderado';
      transportTips = 'Exige pelo menos uma escala de voo e transfer terrestre organizado. Aluguel de 4x4 ou tours oficiais são recomendados.';
    } else {
      if (['Estados Unidos', 'Nova York', 'Paris', 'Inglaterra', 'Alemanha', 'França', 'Londres', 'Dubai', 'Amsterdã', 'Holanda', 'Japão', 'China', 'Itália', 'Espanha'].some(a => placeName.includes(a))) {
        accessLevel = '🟢 Fácil Acesso';
        transportTips = 'Hub aéreo global. Voos diretos diários, acesso via trem de alta velocidade (bullet train / Eurostar) ou metrôs eficientes.';
      }
    }

    // Gerar um guia enriquecido formatado
    const guide = {
      localHistory: summary,
      bestTime: type === 'COUNTRY' 
        ? `A melhor época para visitar ${placeName} depende da região. Evite os meses de chuvas extremas ou frio severo. Verifique a necessidade de vistos e vacinas (ex: febre amarela).`
        : `Recomendamos visitar ${placeName} durante as estações de transição para fugir de multidões e preços altos.`,
      mustSee: [
        `Centro Histórico e Patrimônios de ${placeName}`,
        'Experiências Gastronômicas Locais',
        'Mirantes e Áreas Naturais'
      ],
      safetyTips: [
        'Atenção aos batedores de carteira em áreas muito turísticas e transportes públicos.',
        'Respeite as leis e normas de vestimentas locais, especialmente ao visitar centros religiosos.',
        'Verifique esquemas e golpes comuns com táxis locais.'
      ],
      nextStop: 'A próxima parada sugerida na rota contínua do seu planejamento.',
      accessLevel,
      transportTips
    };

    return NextResponse.json({ guide, imageUrl: wikiData?.thumbnail?.source || null });

  } catch (error) {
    console.error('Enrichment Error:', error);
    return NextResponse.json({ error: 'Failed to enrich data' }, { status: 500 });
  }
}
