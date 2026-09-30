import { AdministrativeDivision, VisitedPlace, TravelMemory, Country, City, Attraction, TransportConnection } from '@/lib/types';

export const MOCK_COUNTRIES: Country[] = [
  { id: 'bra', name: 'Brasil', iso3: 'BRA', officialName: 'República Federativa do Brasil', flag: '🇧🇷', capital: 'Brasília', continent: 'América do Sul', circuit: 'Circuito Américas', currency: 'Real (BRL)', languages: ['Português'], timezone: 'BRT (UTC-3)', coordinates: { lat: -14.2350, lng: -51.9253 }, description: 'Um país de dimensões continentais...', contentStatus: 'COMPLETE', guide: { localHistory: 'Descoberto em 1500 por Pedro Álvares Cabral.', bestTime: 'De setembro a março para evitar o inverno chuvoso do nordeste (Lençóis Maranhenses: junho a setembro).', mustSee: ['Cristo Redentor', 'Lençóis Maranhenses', 'Cataratas do Iguaçu'], safetyTips: ['Fique atento a furtos em áreas muito turísticas.', 'Evite andar com celular na mão na rua.'] } },
  { id: 'fra', name: 'França', iso3: 'FRA', officialName: 'République Française', flag: '🇫🇷', capital: 'Paris', continent: 'Europa', circuit: 'Circuito Europa Clássica & Mediterrâneo', currency: 'Euro (EUR)', languages: ['Francês'], timezone: 'CET (UTC+1)', coordinates: { lat: 46.2276, lng: 2.2137 }, description: 'Berço da arte, moda e gastronomia...', contentStatus: 'COMPLETE', guide: { localHistory: 'Revolução Francesa em 1789 mudou o curso da história moderna.', bestTime: 'Primavera (abril-junho) e outono (setembro-novembro).', mustSee: ['Torre Eiffel', 'Museu do Louvre', 'Saint-Tropez'], safetyTips: ['Cuidado com golpes de assinatura em pontos turísticos.', 'Batedores de carteira no metrô de Paris.'] } },
  { id: 'jpn', name: 'Japão', iso3: 'JPN', capital: 'Tóquio', circuit: 'Circuito Ásia', currency: 'Iene', languages: ['Japonês'], timezone: 'JST', coordinates: { lat: 36.2048, lng: 138.2529 }, description: 'Tradição milenar encontra tecnologia.', contentStatus: 'PARTIAL', guide: { localHistory: 'Nação insular com rica história samurai.', bestTime: 'Fim de março para a florada das cerejeiras (Sakura).', mustSee: ['Monte Fuji', 'Templo Senso-ji', 'Cruzamento de Shibuya'], safetyTips: ['Leis rígidas sobre drogas.', 'Tirar sapatos ao entrar em casas e alguns restaurantes.'] } },
  
  // Circuito Europa Clássica & Mediterrâneo
  { id: 'mco', name: 'Mônaco', iso3: 'MCO', flag: '🇲🇨', capital: 'Mônaco', circuit: 'Circuito Europa Clássica & Mediterrâneo', languages: ['Francês'], coordinates: { lat: 43.7384, lng: 7.4246 }, description: 'O principado do luxo e dos cassinos.', contentStatus: 'PARTIAL' },
  { id: 'ita', name: 'Itália', iso3: 'ITA', flag: '🇮🇹', capital: 'Roma', circuit: 'Circuito Europa Clássica & Mediterrâneo', languages: ['Italiano'], coordinates: { lat: 41.8719, lng: 12.5674 }, description: 'O berço do império romano.', contentStatus: 'PARTIAL', guide: { mustSee: ['Coliseu de Roma', 'Sicília'] } },
  { id: 'grc', name: 'Grécia', iso3: 'GRC', flag: '🇬🇷', capital: 'Atenas', circuit: 'Circuito Europa Clássica & Mediterrâneo', languages: ['Grego'], coordinates: { lat: 39.0742, lng: 21.8243 }, description: 'A origem da filosofia ocidental.', contentStatus: 'PARTIAL', guide: { mustSee: ['Acrópole de Atenas'] } },
  { id: 'deu', name: 'Alemanha', iso3: 'DEU', flag: '🇩🇪', capital: 'Berlim', circuit: 'Circuito Europa Clássica & Mediterrâneo', languages: ['Alemão'], coordinates: { lat: 51.1657, lng: 10.4515 }, description: 'História rica, engenharia e cerveja.', contentStatus: 'PARTIAL', guide: { mustSee: ['Castelos da Baviera'] } },
  { id: 'nld', name: 'Holanda', iso3: 'NLD', flag: '🇳🇱', capital: 'Amsterdã', circuit: 'Circuito Europa Clássica & Mediterrâneo', languages: ['Holandês'], coordinates: { lat: 52.1326, lng: 5.2913 }, description: 'Terra dos moinhos e das tulipas.', contentStatus: 'PARTIAL', guide: { mustSee: ['Campos de Flores (Keukenhof)'] } },
  { id: 'gbr', name: 'Reino Unido', iso3: 'GBR', flag: '🇬🇧', capital: 'Londres', circuit: 'Circuito Europa Clássica & Mediterrâneo', languages: ['Inglês'], coordinates: { lat: 55.3781, lng: -3.4360 }, description: 'A terra da realeza britânica.', contentStatus: 'PARTIAL', guide: { mustSee: ['Londres, Inglaterra', 'Terras Altas, Escócia'] } },
  
  // Circuito Nórdico & Aurora Boreal
  { id: 'nor', name: 'Noruega', iso3: 'NOR', flag: '🇳🇴', capital: 'Oslo', circuit: 'Circuito Nórdico & Aurora Boreal', languages: ['Norueguês'], coordinates: { lat: 60.4720, lng: 8.4689 }, description: 'Famosa pelos seus fiordes e montanhas.', contentStatus: 'PARTIAL', guide: { bestTime: 'Inverno para Aurora Boreal.' } },
  { id: 'swe', name: 'Suécia', iso3: 'SWE', flag: '🇸🇪', capital: 'Estocolmo', circuit: 'Circuito Nórdico & Aurora Boreal', languages: ['Sueco'], coordinates: { lat: 60.1282, lng: 18.6435 }, description: 'Natureza intocada e design minimalista.', contentStatus: 'PARTIAL' },
  { id: 'fin', name: 'Finlândia', iso3: 'FIN', flag: '🇫🇮', capital: 'Helsinque', circuit: 'Circuito Nórdico & Aurora Boreal', languages: ['Finlandês'], coordinates: { lat: 61.9241, lng: 25.7482 }, description: 'A terra dos mil lagos.', contentStatus: 'PARTIAL' },
  { id: 'isl', name: 'Islândia', iso3: 'ISL', flag: '🇮🇸', capital: 'Reykjavik', circuit: 'Circuito Nórdico & Aurora Boreal', languages: ['Islandês'], coordinates: { lat: 64.9631, lng: -19.0208 }, description: 'Terra do gelo e do fogo.', contentStatus: 'PARTIAL', guide: { mustSee: ['Praias de Areia Preta'] } },

  // Circuito Oriente Médio & Norte da África
  { id: 'egy', name: 'Egito', iso3: 'EGY', flag: '🇪🇬', capital: 'Cairo', circuit: 'Circuito Oriente Médio & Norte da África', languages: ['Árabe'], coordinates: { lat: 26.8206, lng: 30.8025 }, description: 'O mistério dos faraós.', contentStatus: 'PARTIAL', guide: { mustSee: ['Pirâmides de Gizé'] } },
  { id: 'isr', name: 'Israel', iso3: 'ISR', flag: '🇮🇱', capital: 'Jerusalém', circuit: 'Circuito Oriente Médio & Norte da África', languages: ['Hebraico'], coordinates: { lat: 31.0461, lng: 34.8516 }, description: 'Terra santa e tecnologia.', contentStatus: 'PARTIAL' },
  { id: 'are', name: 'Emirados Árabes', iso3: 'ARE', flag: '🇦🇪', capital: 'Abu Dhabi', circuit: 'Circuito Oriente Médio & Norte da África', languages: ['Árabe'], coordinates: { lat: 23.4241, lng: 53.8478 }, description: 'Luxo no deserto.', contentStatus: 'PARTIAL', guide: { mustSee: ['Dubai'] } },
  { id: 'tur', name: 'Turquia', iso3: 'TUR', flag: '🇹🇷', capital: 'Ancara', circuit: 'Circuito Oriente Médio & Norte da África', languages: ['Turco'], coordinates: { lat: 38.9637, lng: 35.2433 }, description: 'Ponte entre Europa e Ásia.', contentStatus: 'PARTIAL', guide: { mustSee: ['Balões da Capadócia'] } },
  { id: 'mar', name: 'Marrocos', iso3: 'MAR', flag: '🇲🇦', capital: 'Rabat', circuit: 'Circuito Oriente Médio & Norte da África', languages: ['Árabe'], coordinates: { lat: 31.7917, lng: -7.0926 }, description: 'As cores vibrantes do norte da África.', contentStatus: 'PARTIAL' },

  // Circuito Ásia (Japão já adicionado no topo)
  { id: 'tha', name: 'Tailândia', iso3: 'THA', flag: '🇹🇭', capital: 'Bangkok', circuit: 'Circuito Ásia', languages: ['Tailandês'], coordinates: { lat: 15.8700, lng: 100.9925 }, description: 'O país dos sorrisos e dos templos.', contentStatus: 'PARTIAL', guide: { bestTime: 'Novembro para o Festival das Luzes (Loy Krathong).' } },
  { id: 'idn', name: 'Indonésia', iso3: 'IDN', flag: '🇮🇩', capital: 'Jacarta', circuit: 'Circuito Ásia', languages: ['Indonésio'], coordinates: { lat: -0.7893, lng: 113.9213 }, description: 'O maior arquipélago do mundo.', contentStatus: 'PARTIAL', guide: { mustSee: ['Bali'] } },
  { id: 'phl', name: 'Filipinas', iso3: 'PHL', flag: '🇵🇭', capital: 'Manila', circuit: 'Circuito Ásia', languages: ['Filipino'], coordinates: { lat: 12.8797, lng: 121.7740 }, description: 'Mais de 7 mil ilhas paradisíacas.', contentStatus: 'PARTIAL' },
  { id: 'mdv', name: 'Maldivas', iso3: 'MDV', flag: '🇲🇻', capital: 'Malé', circuit: 'Circuito Ásia', languages: ['Divehi'], coordinates: { lat: 3.2028, lng: 73.2207 }, description: 'Paraíso de atóis e águas cristalinas.', contentStatus: 'PARTIAL' },
  { id: 'chn', name: 'China', iso3: 'CHN', flag: '🇨🇳', capital: 'Pequim', circuit: 'Circuito Ásia', languages: ['Mandarim'], coordinates: { lat: 35.8617, lng: 104.1954 }, description: 'A gigante milenar do leste.', contentStatus: 'PARTIAL', guide: { mustSee: ['Templos Antigos', 'Muralha da China'] } },

  // Circuito Américas (Brasil já adicionado no topo)
  { id: 'usa', name: 'Estados Unidos', iso3: 'USA', flag: '🇺🇸', capital: 'Washington, D.C.', circuit: 'Circuito Américas', languages: ['Inglês'], coordinates: { lat: 37.0902, lng: -95.7129 }, description: 'A terra das oportunidades.', contentStatus: 'PARTIAL', guide: { mustSee: ['Nova York', 'Esqui em Aspen'] } },
  { id: 'mex', name: 'México', iso3: 'MEX', flag: '🇲🇽', capital: 'Cidade do México', circuit: 'Circuito Américas', languages: ['Espanhol'], coordinates: { lat: 23.6345, lng: -102.5528 }, description: 'Rica cultura asteca e praias quentes.', contentStatus: 'PARTIAL', guide: { mustSee: ['Cancún'] } },
  { id: 'col', name: 'Colômbia', iso3: 'COL', flag: '🇨🇴', capital: 'Bogotá', circuit: 'Circuito Américas', languages: ['Espanhol'], coordinates: { lat: 4.5709, lng: -74.2973 }, description: 'Ritmo, café e praias do Caribe.', contentStatus: 'PARTIAL', guide: { mustSee: ['San Andrés'] } },
  { id: 'per', name: 'Peru', iso3: 'PER', flag: '🇵🇪', capital: 'Lima', circuit: 'Circuito Américas', languages: ['Espanhol'], coordinates: { lat: -9.1900, lng: -75.0152 }, description: 'Lar dos Andes e dos Incas.', contentStatus: 'PARTIAL', guide: { mustSee: ['Machu Picchu (Império Inca)'] } },
  { id: 'bol', name: 'Bolívia', iso3: 'BOL', flag: '🇧🇴', capital: 'Sucre', circuit: 'Circuito Américas', languages: ['Espanhol'], coordinates: { lat: -16.2902, lng: -63.5887 }, description: 'Belezas no coração da América do Sul.', contentStatus: 'PARTIAL' },
  { id: 'chl', name: 'Chile', iso3: 'CHL', flag: '🇨🇱', capital: 'Santiago', circuit: 'Circuito Américas', languages: ['Espanhol'], coordinates: { lat: -35.6751, lng: -71.5430 }, description: 'Deserto árido e geleiras ao sul.', contentStatus: 'PARTIAL' },
  { id: 'arg', name: 'Argentina', iso3: 'ARG', flag: '🇦🇷', capital: 'Buenos Aires', circuit: 'Circuito Américas', languages: ['Espanhol'], coordinates: { lat: -38.4161, lng: -63.6167 }, description: 'Tango, vinho e patagônia.', contentStatus: 'PARTIAL' }
];

export const MOCK_DIVISIONS: AdministrativeDivision[] = [
  { id: 'div-sp', countryId: 'bra', name: 'São Paulo', code: 'SP', type: 'STATE', coordinates: { lat: -23.5505, lng: -46.6333 }, description: 'O motor econômico do Brasil.' },
  { id: 'div-rj', countryId: 'bra', name: 'Rio de Janeiro', code: 'RJ', type: 'STATE', coordinates: { lat: -22.9068, lng: -43.1729 }, description: 'Natureza exuberante e cultura vibrante.' },
  { id: 'div-mg', countryId: 'bra', name: 'Minas Gerais', code: 'MG', type: 'STATE', coordinates: { lat: -18.5122, lng: -44.5550 }, description: 'História, montanhas e a melhor culinária.' },
  { id: 'div-ba', countryId: 'bra', name: 'Bahia', code: 'BA', type: 'STATE', coordinates: { lat: -12.9714, lng: -38.5014 }, description: 'Onde o Brasil nasceu.' },
  
  { id: 'div-idf', countryId: 'fra', name: 'Île-de-France', code: 'IDF', type: 'REGION', coordinates: { lat: 48.8499, lng: 2.6370 }, description: 'Coração cultural e político da França.' },
  
  { id: 'div-tokyo', countryId: 'jpn', name: 'Tokyo Prefecture', code: '13', type: 'PREFECTURE', coordinates: { lat: 35.6895, lng: 139.6917 }, description: 'Metrópole global ininterrupta.' }
];

export const MOCK_CITIES: City[] = [
  { id: 'paris', countryId: 'fra', divisionId: 'div-idf', name: 'Paris', coordinates: { lat: 48.8566, lng: 2.3522 }, description: 'A Cidade Luz.', guide: { nextStops: ['a1', 'a2'], visitationTips: ['Compre o Paris Pass para economizar.'], localHistory: 'Fundada no século 3 a.C. por uma tribo celta chamada Parisii.', safetyTips: ['Cuidado com batedores de carteira no metrô.'] } },
  { id: 'sp-city', countryId: 'bra', divisionId: 'div-sp', name: 'São Paulo', coordinates: { lat: -23.5505, lng: -46.6333 }, description: 'Metrópole global.', guide: { nextStops: ['a3'], visitationTips: ['Use o metrô, o trânsito é intenso.'], localHistory: 'Fundada em 1554 por padres jesuítas.', safetyTips: ['Evite andar com o celular na mão no centro.'] } },
  { id: 'santos', countryId: 'bra', divisionId: 'div-sp', name: 'Santos', coordinates: { lat: -23.9618, lng: -46.3322 }, description: 'Maior porto da América Latina e jardins na praia.' },
  { id: 'rio', countryId: 'bra', divisionId: 'div-rj', name: 'Rio de Janeiro', coordinates: { lat: -22.9068, lng: -43.1729 }, description: 'A Cidade Maravilhosa.', guide: { visitationTips: ['Visite o Cristo de manhã cedo.'], safetyTips: ['Fique atento aos seus pertences na praia.'] } },
  { id: 'tokyo', countryId: 'jpn', divisionId: 'div-tokyo', name: 'Tóquio', coordinates: { lat: 35.6762, lng: 139.6503 }, description: 'Metrópole vibrante.' }
];

export const MOCK_ATTRACTIONS: Attraction[] = [
  { id: 'a1', cityId: 'paris', countryId: 'fra', divisionId: 'div-idf', name: 'Torre Eiffel', coordinates: { lat: 48.8584, lng: 2.2945 }, category: 'Ponto Turístico', description: 'O ícone de ferro de Paris.', guide: { nextStops: ['a2'], visitationTips: ['Compre ingressos online com meses de antecedência.'], mustSee: ['Restaurante Le Jules Verne', 'Champs de Mars para piquenique'], localHistory: 'Construída para a Exposição Universal de 1889.', safetyTips: ['Cuidado com golpes de assinaturas ao redor da torre.'] } },
  { id: 'a2', cityId: 'paris', countryId: 'fra', divisionId: 'div-idf', name: 'Museu do Louvre', coordinates: { lat: 48.8606, lng: 2.3376 }, category: 'Cultura', description: 'Maior museu de arte do mundo.', guide: { nextStops: ['a1'], visitationTips: ['Use a entrada do Carrousel du Louvre para filas menores.'], localHistory: 'Originalmente uma fortaleza construída no século 12.' } },
  { id: 'a3', cityId: 'sp-city', countryId: 'bra', divisionId: 'div-sp', name: 'Avenida Paulista', coordinates: { lat: -23.5615, lng: -46.6560 }, category: 'Cultura', description: 'Coração financeiro e cultural.', guide: { visitationTips: ['Aos domingos a avenida é fechada para carros.'], mustSee: ['MASP', 'Japan House', 'Parque Trianon'] } },
  { id: 'a4', cityId: 'santos', countryId: 'bra', divisionId: 'div-sp', name: 'Jardins da Orla', coordinates: { lat: -23.9700, lng: -46.3200 }, category: 'Natureza', description: 'Maior jardim frontal de praia do mundo.' },
  { id: 'a6', cityId: 'tokyo', countryId: 'jpn', divisionId: 'div-tokyo', name: 'Cruzamento de Shibuya', coordinates: { lat: 35.6595, lng: 139.7001 }, category: 'Cultura', description: 'Cruzamento mais movimentado.' }
];

// USER EXPLORATION DATA
export const MOCK_VISITED: VisitedPlace[] = [
  { id: 'v1', type: 'COUNTRY', placeId: 'bra', status: 'VISITED', firstVisitedAt: '1995-01-01' },
  { id: 'v2', type: 'COUNTRY', placeId: 'fra', status: 'VISITED', firstVisitedAt: '2019-05-10' },
  { id: 'v3', type: 'COUNTRY', placeId: 'prt', status: 'VISITED', firstVisitedAt: '2023-09-12' },

  { id: 'v4', type: 'DIVISION', placeId: 'div-sp', status: 'VISITED', firstVisitedAt: '2010-02-15' },
  { id: 'v5', type: 'DIVISION', placeId: 'div-rj', status: 'VISITED', firstVisitedAt: '2015-07-20' },
  { id: 'v6', type: 'DIVISION', placeId: 'div-mg', status: 'VISITED', firstVisitedAt: '2022-10-05' },
  
  { id: 'v7', type: 'CITY', placeId: 'sp-city', status: 'VISITED' },
  { id: 'v8', type: 'CITY', placeId: 'paris', status: 'VISITED' },
  
  { id: 'v9', type: 'DESTINATION', placeId: 'a1', status: 'VISITED' }, // Torre Eiffel
  { id: 'v10', type: 'DESTINATION', placeId: 'a3', status: 'VISITED' }, // Av. Paulista
  
  // Viagens Planejadas (MY_TRIPS)
  { id: 'v11', type: 'COUNTRY', placeId: 'jpn', status: 'PLANNED' },
  { id: 'v12', type: 'DIVISION', placeId: 'div-tokyo', status: 'PLANNED' },
  { id: 'v13', type: 'CITY', placeId: 'tokyo', status: 'PLANNED' },
  { id: 'v14', type: 'DESTINATION', placeId: 'a6', status: 'PLANNED' },

  // Europa Clássica
  { id: 'v-fra', type: 'COUNTRY', placeId: 'fra', status: 'PLANNED' },
  { id: 'v-mco', type: 'COUNTRY', placeId: 'mco', status: 'PLANNED' },
  { id: 'v-ita', type: 'COUNTRY', placeId: 'ita', status: 'PLANNED' },
  { id: 'v-grc', type: 'COUNTRY', placeId: 'grc', status: 'PLANNED' },
  { id: 'v-deu', type: 'COUNTRY', placeId: 'deu', status: 'PLANNED' },
  { id: 'v-nld', type: 'COUNTRY', placeId: 'nld', status: 'PLANNED' },
  { id: 'v-gbr', type: 'COUNTRY', placeId: 'gbr', status: 'PLANNED' },

  // Nórdico
  { id: 'v-nor', type: 'COUNTRY', placeId: 'nor', status: 'PLANNED' },
  { id: 'v-swe', type: 'COUNTRY', placeId: 'swe', status: 'PLANNED' },
  { id: 'v-fin', type: 'COUNTRY', placeId: 'fin', status: 'PLANNED' },
  { id: 'v-isl', type: 'COUNTRY', placeId: 'isl', status: 'PLANNED' },

  // Oriente Médio
  { id: 'v-egy', type: 'COUNTRY', placeId: 'egy', status: 'PLANNED' },
  { id: 'v-isr', type: 'COUNTRY', placeId: 'isr', status: 'PLANNED' },
  { id: 'v-are', type: 'COUNTRY', placeId: 'are', status: 'PLANNED' },
  { id: 'v-tur', type: 'COUNTRY', placeId: 'tur', status: 'PLANNED' },
  { id: 'v-mar', type: 'COUNTRY', placeId: 'mar', status: 'PLANNED' },

  // Ásia
  { id: 'v-tha', type: 'COUNTRY', placeId: 'tha', status: 'PLANNED' },
  { id: 'v-idn', type: 'COUNTRY', placeId: 'idn', status: 'PLANNED' },
  { id: 'v-phl', type: 'COUNTRY', placeId: 'phl', status: 'PLANNED' },
  { id: 'v-mdv', type: 'COUNTRY', placeId: 'mdv', status: 'PLANNED' },
  { id: 'v-chn', type: 'COUNTRY', placeId: 'chn', status: 'PLANNED' },

  // Américas
  { id: 'v-usa', type: 'COUNTRY', placeId: 'usa', status: 'PLANNED' },
  { id: 'v-mex', type: 'COUNTRY', placeId: 'mex', status: 'PLANNED' },
  { id: 'v-col', type: 'COUNTRY', placeId: 'col', status: 'PLANNED' },
  { id: 'v-per', type: 'COUNTRY', placeId: 'per', status: 'PLANNED' },
  { id: 'v-bol', type: 'COUNTRY', placeId: 'bol', status: 'PLANNED' },
  { id: 'v-chl', type: 'COUNTRY', placeId: 'chl', status: 'PLANNED' },
  { id: 'v-arg', type: 'COUNTRY', placeId: 'arg', status: 'PLANNED' },
  { id: 'v-bra-planned', type: 'COUNTRY', placeId: 'bra', status: 'PLANNED' },
];

export const MOCK_MEMORIES: TravelMemory[] = [
  { id: 'm1', userId: 'u1', date: '2026-09-15', photos: [], caption: 'Fim de semana em SP!', notes: 'Avenida Paulista estava cheia e incrível.', tags: ['cidade', 'cultura'], countryId: 'bra', divisionId: 'div-sp', cityId: 'sp-city', destinationId: 'a3', coordinates: { lat: -23.5615, lng: -46.6560 } },
  { id: 'm2', userId: 'u1', date: '2019-05-12', photos: [], caption: 'Primeira vez vendo a Torre', tags: ['romântico'], countryId: 'fra', divisionId: 'div-idf', cityId: 'paris', destinationId: 'a1', coordinates: { lat: 48.8584, lng: 2.2945 } }
];

export const MOCK_CONNECTIONS: TransportConnection[] = [];
