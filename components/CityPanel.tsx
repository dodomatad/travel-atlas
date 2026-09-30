'use client';

import { useMemo } from 'react';
import { City, Attraction } from '@/lib/types';
import { X, MapPin, Navigation, ArrowLeft } from 'lucide-react';
import { MOCK_CONNECTIONS, MOCK_COUNTRIES } from '@/data/mock';

interface Props {
  city: City;
  attractions: Attraction[];
  onClose: () => void;
  onSelectAttraction: (a: Attraction) => void;
  onAddPlace?: (type: 'CITY', id: string, status: 'PLANNED') => void;
}

export default function CityPanel({ city, attractions, onClose, onSelectAttraction, onAddPlace }: Props) {
  const country = useMemo(() => MOCK_COUNTRIES.find(c => c.id === city.countryId), [city.countryId]);
  const connections = useMemo(() => MOCK_CONNECTIONS.filter(c => c.fromCityId === city.id), [city.id]);

  return (
    <div className="h-full flex flex-col text-white bg-[#050515]/95 backdrop-blur-3xl border-l border-white/10 w-full md:w-[400px] shadow-2xl animate-fade-in relative z-30">
      
      {/* HEADER VISUAL */}
      <div className="relative h-44 sm:h-48 shrink-0 bg-[#000010]">
        {city.image ? (
          <img src={city.image} alt={city.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-yellow-900/40 to-[#000010] opacity-60 flex items-center justify-center">
             <div className="w-full h-full opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050515] to-transparent z-10" />
        
        <div className="absolute top-4 left-4 z-20">
          <button onClick={onClose} className="bg-black/40 hover:bg-black/80 text-white px-3 py-1.5 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <ArrowLeft size={14} /> Voltar para {country?.name || 'País'}
          </button>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all">
          <X size={16} />
        </button>
        
        <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-6 right-4 sm:right-6 z-20">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <span className="text-[10px] uppercase tracking-widest text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20"><MapPin size={10} className="inline mr-1 mb-0.5"/>Cidade</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-lg">{city.name}</h2>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 custom-scrollbar">
        
        {onAddPlace && (
          <button 
            onClick={() => onAddPlace('CITY', city.id, 'PLANNED')}
            className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            + Adicionar à Viagem
          </button>
        )}

        <section>
          <h3 className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-3">Visão Geral</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{city.description}</p>
        </section>

        {city.guide && (
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={12} /> Guia de Viagem</h3>
            
            {city.guide.localHistory && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-[10px] uppercase tracking-widest text-yellow-500 mb-2 font-bold">História e Curiosidades</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{city.guide.localHistory}</p>
              </div>
            )}

            {city.guide.bestTime && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-[10px] uppercase tracking-widest text-green-400 mb-2 font-bold">Dicas de Ouro e Melhor Época</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{city.guide.bestTime}</p>
              </div>
            )}

            {city.guide.mustSee && city.guide.mustSee.length > 0 && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-[10px] uppercase tracking-widest text-blue-400 mb-2 font-bold">O Que Fazer / Imperdíveis</h4>
                <ul className="text-xs text-gray-300 space-y-2">
                  {city.guide.mustSee.map((place, i) => (
                    <li key={i} className="flex gap-2"><span className="text-blue-500">•</span> {place}</li>
                  ))}
                </ul>
              </div>
            )}

            {city.guide.visitationTips && city.guide.visitationTips.length > 0 && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-[10px] uppercase tracking-widest text-green-400 mb-2 font-bold">Dicas de Visitação</h4>
                <ul className="text-xs text-gray-300 space-y-2">
                  {city.guide.visitationTips.map((tip, i) => (
                    <li key={i} className="flex gap-2"><span className="text-green-500">•</span> {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {city.guide.safetyTips && city.guide.safetyTips.length > 0 && (
              <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                <h4 className="text-[10px] uppercase tracking-widest text-red-400 mb-2 font-bold">O que tomar cuidado</h4>
                <ul className="text-xs text-red-200/80 space-y-2">
                  {city.guide.safetyTips.map((tip, i) => (
                    <li key={i} className="flex gap-2"><span className="text-red-500">•</span> {tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {attractions.length > 0 && (
          <section>
            <h3 className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-3 flex items-center gap-2">O Que Fazer</h3>
            <div className="space-y-2">
              {attractions.map(a => (
                <button key={a.id} onClick={() => onSelectAttraction(a)} className="w-full text-left bg-white/5 hover:bg-white/10 p-4 rounded-xl flex items-center justify-between group transition-colors border border-transparent hover:border-white/10">
                  <div>
                    <h4 className="text-sm font-bold text-white">{a.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">{a.category} • {a.estimatedDuration}</p>
                  </div>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest group-hover:text-yellow-400">Ver Local</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {connections.length > 0 && (
          <section>
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Navigation size={12}/> Para Onde Posso Ir?</h3>
            <div className="space-y-2">
              {connections.map(c => (
                <div key={c.id} className="bg-white/5 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{c.fromCityId} → <span className="text-blue-400">{c.toCityId}</span></div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{c.transportType} {c.direct ? '• Direto' : ''} • {c.duration}</div>
                  </div>
                  <button className="text-[9px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded uppercase font-bold tracking-widest hover:bg-blue-500/40 transition-colors">Detalhes</button>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
