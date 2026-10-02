'use client';

import { useMemo } from 'react';
import { Attraction } from '@/lib/types';
import { getNearby, formatDistance } from '@/lib/proximity';
import { X, MapPin, ArrowLeft, Clock, Info, Navigation, Plus } from 'lucide-react';
import { MOCK_ATTRACTIONS, MOCK_CITIES, MOCK_COUNTRIES } from '@/data/mock';

interface Props {
  attraction: Attraction;
  onClose: () => void;
  onSelectAttraction: (a: Attraction) => void;
  onAddPlace?: (type: 'DESTINATION', id: string, status: 'PLANNED') => void;
}

export default function DestinationPanel({ attraction, onClose, onSelectAttraction, onAddPlace }: Props) {
  const city = useMemo(() => MOCK_CITIES.find(c => c.id === attraction.cityId), [attraction.cityId]);
  const country = useMemo(() => MOCK_COUNTRIES.find(c => c.id === attraction.countryId), [attraction.countryId]);
  
  // Proximity Engine memoized
  const allCityAttractions = useMemo(() => {
    return MOCK_ATTRACTIONS.filter(a => a.cityId === attraction.cityId && a.id !== attraction.id);
  }, [attraction.cityId, attraction.id]);

  const nearbyPlaces = useMemo(() => {
    return getNearby(allCityAttractions, attraction.coordinates, 10);
  }, [allCityAttractions, attraction.coordinates]);

  return (
    <div className="h-full flex flex-col text-white bg-[#050515]/95 backdrop-blur-3xl border-l border-white/10 w-full md:w-[400px] shadow-2xl animate-fade-in relative z-30">
      
      {/* HEADER VISUAL */}
      <div className="relative h-44 sm:h-56 shrink-0 bg-[#000010]">
        {attraction.image ? (
          <img src={attraction.image} alt={attraction.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-900/40 to-[#000010] opacity-60 flex items-center justify-center">
             <div className="w-full h-full opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050515] to-transparent z-10" />
        
        <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-20">
          <button 
            onClick={onClose} 
            className="min-h-[42px] bg-black/60 hover:bg-black/80 active:scale-95 text-white px-3.5 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider touch-manipulation shadow-lg border border-white/15"
          >
            <ArrowLeft size={15} /> Voltar para {city?.name || 'Cidade'}
          </button>
        </div>

        <button 
          onClick={onClose} 
          className="min-h-[42px] min-w-[42px] absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 bg-black/60 hover:bg-black/80 active:scale-95 text-white rounded-full backdrop-blur-md transition-all flex items-center justify-center touch-manipulation shadow-lg border border-white/15"
          aria-label="Fechar painel"
        >
          <X size={18} />
        </button>
        
        <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-6 right-4 sm:right-6 z-20">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <span className="text-[10px] uppercase tracking-widest text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">{attraction.category}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-lg leading-tight">{attraction.name}</h2>
          <div className="flex items-center gap-1 text-[10px] text-gray-300 mt-1 sm:mt-2 uppercase tracking-widest">
             <MapPin size={10} /> {city?.name}, {country?.name}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 custom-scrollbar">
        
        {onAddPlace && (
          <div className="flex gap-2">
            <button 
              onClick={() => onAddPlace('DESTINATION', attraction.id, 'PLANNED')}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Adicionar à Viagem
            </button>
          </div>
        )}

        <section>
          <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Info size={12} /> Descrição</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{attraction.description}</p>
        </section>

        <section className="flex gap-4 border-y border-white/10 py-4">
           <div>
             <div className="text-[9px] text-gray-500 uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> Tempo Estimado</div>
             <div className="text-sm font-bold mt-1 text-white">{attraction.estimatedDuration}</div>
           </div>
           {attraction.tags && attraction.tags.length > 0 && (
             <div>
               <div className="text-[9px] text-gray-500 uppercase tracking-widest flex items-center gap-1"><MapPin size={10}/> Perfil</div>
               <div className="text-xs text-white mt-1.5 flex gap-1 flex-wrap">
                 {attraction.tags.map(t => <span key={t} className="bg-white/10 px-1.5 py-0.5 rounded">{t}</span>)}
               </div>
             </div>
           )}
        </section>

        {attraction.guide && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={12} /> Guia de Viagem</h3>
            
            {attraction.guide.localHistory && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-[10px] uppercase tracking-widest text-yellow-500 mb-2 font-bold">História e Curiosidades</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{attraction.guide.localHistory}</p>
              </div>
            )}

            {attraction.guide.bestTime && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-[10px] uppercase tracking-widest text-green-400 mb-2 font-bold">Dicas de Ouro e Melhor Época</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{attraction.guide.bestTime}</p>
              </div>
            )}

            {attraction.guide.mustSee && attraction.guide.mustSee.length > 0 && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-[10px] uppercase tracking-widest text-blue-400 mb-2 font-bold">O Que Fazer / Imperdíveis</h4>
                <ul className="text-xs text-gray-300 space-y-2">
                  {attraction.guide.mustSee.map((place, i) => (
                    <li key={i} className="flex gap-2"><span className="text-blue-500">•</span> {place}</li>
                  ))}
                </ul>
              </div>
            )}

            {attraction.guide.visitationTips && attraction.guide.visitationTips.length > 0 && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-[10px] uppercase tracking-widest text-green-400 mb-2 font-bold">Dicas de Visitação</h4>
                <ul className="text-xs text-gray-300 space-y-2">
                  {attraction.guide.visitationTips.map((tip, i) => (
                    <li key={i} className="flex gap-2"><span className="text-green-500">•</span> {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {attraction.guide.safetyTips && attraction.guide.safetyTips.length > 0 && (
              <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                <h4 className="text-[10px] uppercase tracking-widest text-red-400 mb-2 font-bold flex items-center gap-2"><Info size={12}/> O que tomar cuidado</h4>
                <ul className="text-xs text-red-200/80 space-y-2">
                  {attraction.guide.safetyTips.map((tip, i) => (
                    <li key={i} className="flex gap-2"><span className="text-red-500">•</span> {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {nearbyPlaces.length > 0 && (
          <section>
            <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Navigation size={12} /> Perto Daqui (Onde Ir Depois)</h3>
            <div className="space-y-2">
              {nearbyPlaces.map(nearby => (
                <div key={nearby.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">{nearby.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{nearby.category}</p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-300 bg-white/10 px-2 py-1 rounded">{formatDistance(nearby.distanceKm)}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                    <button onClick={() => onSelectAttraction(nearby)} className="flex-1 text-[9px] uppercase tracking-widest font-bold text-gray-400 hover:text-white transition-colors">Ver Detalhes</button>
                    <button className="flex-1 text-[9px] uppercase tracking-widest font-bold text-green-400 hover:text-green-300 transition-colors border-l border-white/10">+ Roteiro</button>
                  </div>
                </div>
              ))}
            </div>
            
            {nearbyPlaces.length > 1 && (
              <button className="w-full mt-3 py-3 border border-green-500/30 text-green-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-green-500/10 transition-colors flex items-center justify-center gap-2">
                 <Navigation size={12} /> Sugerir Melhor Rota
              </button>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
