'use client';

import { useMemo } from 'react';
import { AdministrativeDivision, City } from '@/lib/types';
import { X, MapPin, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { MOCK_CITIES, MOCK_COUNTRIES, MOCK_VISITED } from '@/data/mock';

interface Props {
  division: AdministrativeDivision;
  onClose: () => void;
  onSelectCity: (c: City) => void;
}

export default function DivisionPanel({ division, onClose, onSelectCity }: Props) {
  const country = useMemo(() => MOCK_COUNTRIES.find(c => c.id === division.countryId), [division.countryId]);
  const cities = useMemo(() => MOCK_CITIES.filter(c => c.divisionId === division.id), [division.id]);
  
  const isVisited = useMemo(() => MOCK_VISITED.some(v => v.type === 'DIVISION' && v.placeId === division.id && v.status === 'VISITED'), [division.id]);
  const visitedCities = useMemo(() => MOCK_VISITED.filter(v => v.type === 'CITY' && cities.some(c => c.id === v.placeId)).length, [cities]);

  return (
    <div className="h-full flex flex-col text-white bg-[#050515]/95 backdrop-blur-3xl border-l border-white/10 w-full md:w-[420px] shadow-2xl animate-fade-in relative z-30">
      
      {/* HEADER VISUAL */}
      <div className="relative h-44 sm:h-56 shrink-0 bg-[#000010]">
        {division.image ? (
          <img src={division.image} alt={division.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/40 to-[#000010] opacity-60 flex items-center justify-center">
             <div className="w-full h-full opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050515] to-transparent z-10" />
        
        <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-20">
          <button 
            onClick={onClose} 
            className="min-h-[42px] bg-black/60 hover:bg-black/80 active:scale-95 text-white px-3.5 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider touch-manipulation shadow-lg border border-white/15"
          >
            <ArrowLeft size={15} /> Voltar para {country?.name || 'País'}
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
            <span className="text-[10px] uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{division.type}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-lg leading-tight">{division.name}</h2>
          
          <div className="flex gap-2 mt-4">
            <button className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${isVisited ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}>
              {isVisited ? <><CheckCircle2 size={14} /> Já Estive Aqui</> : 'Registrar Visita'}
            </button>
          </div>
        </div>
      </div>

      {/* STATS BAR (Only if visited) */}
      {isVisited && (
        <div className="px-6 py-4 bg-green-500/5 border-b border-green-500/10 shrink-0 flex justify-between items-center">
           <div>
             <div className="text-sm font-black text-white">{visitedCities} / {cities.length || 1}</div>
             <div className="text-[8px] text-gray-500 uppercase tracking-widest">Cidades</div>
           </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        <section>
          <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3">Sobre</h3>
          <p className="text-sm text-gray-300 leading-relaxed">{division.description}</p>
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={12}/> Cidades</h3>
          <div className="space-y-2">
            {cities.map(c => {
              const cityVisited = MOCK_VISITED.some(v => v.type === 'CITY' && v.placeId === c.id && v.status === 'VISITED');
              return (
                <button key={c.id} onClick={() => onSelectCity(c)} className="w-full text-left bg-white/5 hover:bg-white/10 p-4 rounded-xl flex items-center justify-between group transition-colors border border-transparent hover:border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      {cityVisited ? <CheckCircle2 size={12} className="text-green-500" /> : <div className="w-2 h-2 rounded-full border border-gray-500"></div>}
                      <h4 className="text-sm font-bold text-white">{c.name}</h4>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-600 group-hover:text-purple-400 transition-colors shrink-0" />
                </button>
              );
            })}
            {cities.length === 0 && <p className="text-xs text-gray-500">Nenhuma cidade mapeada nesta divisão.</p>}
          </div>
        </section>

      </div>
    </div>
  );
}
