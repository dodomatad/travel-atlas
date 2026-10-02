'use client';

import { useMemo } from 'react';
import { Country, City, Attraction, VisitedPlace } from '@/lib/types';
import { optimizeRouteNearestNeighbor, formatDistance, getDistance } from '@/lib/proximity';
import { MOCK_COUNTRIES, MOCK_CITIES, MOCK_ATTRACTIONS } from '@/data/mock';
import { Navigation, Calendar, MapPin, Map, Route, Sparkles, X } from 'lucide-react';

interface Props {
  userPlaces: VisitedPlace[];
  onSelectCountry: (c: Country) => void;
  onSelectCity: (c: City) => void;
  onSelectAttraction: (a: Attraction) => void;
  onClose: () => void;
  onOpenAITripPlanner?: () => void;
}

export default function TripsPlannerPanel({ userPlaces, onSelectCountry, onSelectCity, onSelectAttraction, onClose, onOpenAITripPlanner }: Props) {
  
  const plannedCountries = useMemo(() => {
    const planned = userPlaces.filter(v => v.type === 'COUNTRY' && v.status === 'PLANNED');
    return planned.map(p => MOCK_COUNTRIES.find(c => c.id === p.placeId)).filter(Boolean) as Country[];
  }, [userPlaces]);

  // Criação de Rota Contínua Global (Hop-by-hop a partir do Brasil)
  const continuousRoute = useMemo(() => {
    // Ordem exata estipulada pelo roteiro logístico perfeito
    const LOGICAL_ROUTE_ORDER = [
      'Brasil', 'Bolívia', 'Argentina', 'Chile', 'Peru', 'Colômbia',
      'México', 'Estados Unidos', 
      'Marrocos', 'Reino Unido', 'Inglaterra', 'Escócia', 'França', 'Mônaco', 'Itália', 'Alemanha', 'Suíça', 'Holanda', 'Países Baixos', 'Grécia',
      'Noruega', 'Suécia', 'Finlândia', 'Islândia',
      'Turquia', 'Israel', 'Egito', 'Emirados Árabes Unidos',
      'Maldivas', 'Tailândia', 'Indonésia', 'Filipinas', 'China', 'Japão'
    ];

    const sorted = [...plannedCountries].sort((a, b) => {
      let idxA = LOGICAL_ROUTE_ORDER.findIndex(name => a.name.includes(name) || name.includes(a.name));
      let idxB = LOGICAL_ROUTE_ORDER.findIndex(name => b.name.includes(name) || name.includes(b.name));
      
      if (idxA === -1) idxA = 999;
      if (idxB === -1) idxB = 999;

      if (idxA !== idxB) return idxA - idxB;
      
      // Desempate por distância geométrica do Brasil se não estiverem na lista principal
      const distA = getDistance({ lat: -14.235, lng: -51.925 }, a.coordinates);
      const distB = getDistance({ lat: -14.235, lng: -51.925 }, b.coordinates);
      return distA - distB;
    });

    return sorted;
  }, [plannedCountries]);

  return (
    <div className="fixed inset-x-2 top-16 bottom-20 sm:inset-auto sm:top-24 sm:left-6 sm:bottom-6 sm:w-[360px] bg-[#050515]/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col text-white shadow-2xl z-30 animate-fade-in custom-scrollbar overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
            <Calendar size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-widest uppercase text-white">Minhas Viagens</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Roteiro Contínuo (A partir do Brasil)</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="min-h-[40px] px-3.5 py-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl transition-all border border-white/15 text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-1.5 touch-manipulation shadow-md"
          aria-label="Fechar painel de viagens"
        >
          <X size={15} /> Fechar
        </button>
      </div>

      {onOpenAITripPlanner && (
        <button
          onClick={onOpenAITripPlanner}
          className="w-full mb-4 min-h-[44px] py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-white shadow-lg shadow-blue-500/25 touch-manipulation"
        >
          <Sparkles size={14} /> Montar Roteiro com IA
        </button>
      )}
      
      {plannedCountries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <Map size={32} className="text-gray-600 mb-3" />
          <p className="text-xs text-gray-400">Nenhum país planejado ainda.</p>
          <p className="text-[10px] text-gray-500 mt-2">Navegue pelo mapa e clique em "+ Adicionar à Viagem" nos destinos que deseja conhecer.</p>
        </div>
      ) : (
        <div className="space-y-6 mt-2 relative before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-white/10">
          {continuousRoute.map((country, idx) => {
            let distanceLabel = '';
            let travelTime = '';
            
            if (idx === 0) {
              const dist = getDistance({ lat: -14.235, lng: -51.925 }, country.coordinates);
              distanceLabel = `a ${formatDistance(dist)} do Brasil`;
              travelTime = `~${Math.max(1, Math.round(dist / 800))}h de voo`;
            } else {
              const prevCountry = continuousRoute[idx - 1];
              const dist = getDistance(prevCountry.coordinates, country.coordinates);
              distanceLabel = `a ${formatDistance(dist)} de ${prevCountry.name}`;
              if (dist < 800) {
                travelTime = `~${Math.max(1, Math.round(dist / 120))}h (Trem/Carro)`;
              } else {
                travelTime = `~${Math.max(1, Math.round(dist / 800))}h (Voo)`;
              }
            }

            return (
              <div key={country.id} className="relative pl-7 flex flex-col group cursor-pointer" onClick={() => onSelectCountry(country)}>
                  <div className="absolute left-[3px] top-1.5 w-[18px] h-[18px] rounded-full bg-[#050515] border-2 border-red-500 flex items-center justify-center group-hover:scale-110 transition-transform z-10">
                    <span className="text-[8px] font-bold text-red-500">{idx + 1}</span>
                  </div>
                  <div className="bg-white/5 group-hover:bg-white/10 p-3 rounded-xl border border-white/5 group-hover:border-white/20 transition-all flex items-center justify-between ml-2">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-2">
                        <span className="text-base">{country.flag}</span> 
                        <span>{country.name}</span>
                      </h4>
                    {distanceLabel && (
                       <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
                         <Navigation size={8} /> {distanceLabel} • {travelTime}
                       </p>
                    )}
                  </div>
                  <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest bg-white/5 px-2 py-1 rounded">Ver Guia</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
