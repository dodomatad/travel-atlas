'use client';

import { useState, useMemo, useEffect } from 'react';
import { Country, City, AdministrativeDivision } from '@/lib/types';
import { X, MapPin, CheckCircle2, ChevronRight, ArrowLeft, RefreshCw, AlertTriangle, ChevronDown, Sparkles } from 'lucide-react';
import { MOCK_DIVISIONS, MOCK_VISITED, MOCK_MEMORIES } from '@/data/mock';

interface Props {
  country: Country;
  onClose: () => void;
  onSelectCity: (c: City) => void;
  onSelectDivision: (d: AdministrativeDivision) => void;
  onFlyToCoordinates?: (coord: {lat: number, lng: number}) => void;
  onAddPlace?: (type: 'COUNTRY', id: string, status: 'PLANNED') => void;
  onOpenAIWithCountry?: (countryName: string) => void;
}

export default function CountryDossier({ country, onClose, onSelectCity, onSelectDivision, onFlyToCoordinates, onAddPlace, onOpenAIWithCountry }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'divisions' | 'experiences'>('overview');
  const isFallback = country.contentStatus === 'BASIC';

  const divisions = useMemo(() => MOCK_DIVISIONS.filter(d => d.countryId === country.id), [country.id]);
  const isVisited = useMemo(() => MOCK_VISITED.some(v => v.type === 'COUNTRY' && v.placeId === country.id && v.status === 'VISITED'), [country.id]);
  const visitedDivisions = useMemo(() => MOCK_VISITED.filter(v => v.type === 'DIVISION' && divisions.some(d => d.id === v.placeId)).length, [divisions]);
  
  const memories = useMemo(() => MOCK_MEMORIES.filter(m => m.countryId === country.id), [country.id]);
  const memoriesCount = memories.length;

  const [guideData, setGuideData] = useState<any>(country.guide || null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('history');

  const fetchEnrichedGuide = async (force = false) => {
    const cacheKey = `travel_atlas_guide_${country.id}`;
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setGuideData(JSON.parse(cached));
        return;
      }
    }
    
    setLoadingGuide(true);
    try {
      const res = await fetch(`/api/enrich?place=${encodeURIComponent(country.name)}&type=COUNTRY`);
      const data = await res.json();
      if (data.guide) {
        setGuideData(data.guide);
        localStorage.setItem(cacheKey, JSON.stringify(data.guide));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGuide(false);
    }
  };

  useEffect(() => {
    // Busca guia enriquecido ao abrir o componente (só bate na API se não tiver cache)
    fetchEnrichedGuide();
  }, [country.id]);

  return (
    <div className="h-full flex flex-col text-white bg-[#050515]/95 backdrop-blur-3xl border-l border-white/10 w-full md:w-[480px] shadow-2xl animate-fade-in relative z-30">
      
      {/* HEADER VISUAL */}
      <div className="relative h-52 sm:h-64 shrink-0 bg-[#000010]">
        {country.image ? (
          <img src={country.image} alt={country.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-900/40 to-[#000010] opacity-60 flex items-center justify-center">
             <div className="w-full h-full opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050515] via-[#050515]/50 to-transparent z-10" />
        
        <div className="absolute top-4 left-4 z-20">
          <button onClick={onClose} className="bg-black/40 hover:bg-black/80 text-white px-3 py-1.5 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
            <ArrowLeft size={14} /> Voltar ao Mapa
          </button>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all">
          <X size={16} />
        </button>
        
        <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-6 right-4 sm:right-6 z-20">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <span className="text-[10px] uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{country.continent || 'Global'}</span>
            <span className="text-[10px] font-bold text-gray-300">{country.iso3}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-lg flex items-center gap-2 sm:gap-3">
            {country.flag && <span>{country.flag}</span>}
            <span className="truncate">{country.name}</span>
          </h2>
          
          <div className="flex gap-2 mt-4">
            <button className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${isVisited ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'}`}>
              {isVisited ? <><CheckCircle2 size={14} /> Visitado</> : 'Marcar Visita'}
            </button>
            {onOpenAIWithCountry && (
              <button 
                onClick={() => onOpenAIWithCountry(country.name)}
                className="py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 text-white shadow-lg shadow-blue-500/20"
                title="Consultar inteligência do país com o Llama"
              >
                <Sparkles size={13} /> Assistente IA
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STATS BAR (Only if visited) */}
      {isVisited && (
        <div className="px-6 py-4 bg-green-500/5 border-b border-green-500/10 shrink-0">
           <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Seu Progresso</span>
              <span className="text-[10px] text-gray-400">{divisions.length > 0 ? Math.round((visitedDivisions / divisions.length) * 100) : 100}% Explorado</span>
           </div>
           <div className="w-full bg-black/50 rounded-full h-1.5 mb-3">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${divisions.length > 0 ? (visitedDivisions / divisions.length) * 100 : 100}%` }}></div>
           </div>
           <div className="flex gap-4">
             <div className="text-center flex-1"><div className="text-sm font-black text-white">{visitedDivisions} / {divisions.length || 1}</div><div className="text-[8px] text-gray-500 uppercase tracking-widest">Divisões</div></div>
             <div className="text-center flex-1"><div className="text-sm font-black text-white">{memoriesCount}</div><div className="text-[8px] text-gray-500 uppercase tracking-widest">Memórias</div></div>
           </div>
        </div>
      )}

      {/* TABS */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-white/10 shrink-0">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-3 border-b-2 font-bold text-[10px] uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Visão Geral</button>
        <button onClick={() => setActiveTab('divisions')} className={`px-4 py-3 border-b-2 font-bold text-[10px] uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === 'divisions' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Explorar ({divisions.length})</button>
        {memoriesCount > 0 && (
          <button onClick={() => setActiveTab('experiences')} className={`px-4 py-3 border-b-2 font-bold text-[10px] uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === 'experiences' ? 'border-green-500 text-green-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Diário Visual</button>
        )}
      </div>
      
      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {onAddPlace && (
              <button 
                onClick={() => onAddPlace('COUNTRY', country.id, 'PLANNED')}
                className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                + Adicionar à Viagem
              </button>
            )}

             <section>
              <p className="text-sm text-gray-300 leading-relaxed">{country.description}</p>
              {isFallback && (
                <div className="mt-4 p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg">
                  <p className="text-xs text-blue-300">Geometria disponível, mas o conteúdo detalhado deste destino ainda está sendo preparado.</p>
                </div>
              )}
            </section>

            {loadingGuide ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2"><RefreshCw size={12} className="animate-spin" /> Coletando Dados da Web...</h3>
                </div>
                <div className="space-y-3">
                  <div className="h-12 bg-white/5 animate-pulse rounded-xl" />
                  <div className="h-12 bg-white/5 animate-pulse rounded-xl" />
                  <div className="h-12 bg-white/5 animate-pulse rounded-xl" />
                </div>
              </section>
            ) : guideData ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2"><MapPin size={12} /> Guia de Viagem (Web)</h3>
                  <button onClick={() => fetchEnrichedGuide(true)} className="text-[9px] uppercase tracking-widest text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                    <RefreshCw size={10} /> Atualizar
                  </button>
                </div>
                
                <div className="space-y-2">
                  {/* História */}
                  <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                    <button onClick={() => setExpandedSection(expandedSection === 'history' ? null : 'history')} className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
                      <h4 className="text-[10px] uppercase tracking-widest text-yellow-500 font-bold flex items-center gap-2">📜 História e Cultura Local</h4>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedSection === 'history' ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedSection === 'history' && guideData.localHistory && (
                      <div className="p-4 pt-0 text-xs text-gray-300 leading-relaxed border-t border-white/5 mt-1">{guideData.localHistory}</div>
                    )}
                  </div>

                  {/* Imperdíveis */}
                  {guideData.mustSee && guideData.mustSee.length > 0 && (
                    <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                      <button onClick={() => setExpandedSection(expandedSection === 'mustsee' ? null : 'mustsee')} className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
                        <h4 className="text-[10px] uppercase tracking-widest text-blue-400 font-bold flex items-center gap-2">🌟 Destaques e Locais Imperdíveis</h4>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedSection === 'mustsee' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'mustsee' && (
                        <div className="p-4 pt-0 border-t border-white/5 mt-1">
                          <ul className="text-xs text-gray-300 space-y-2">
                            {guideData.mustSee.map((place: string, i: number) => (
                              <li key={i} className="flex gap-2"><span className="text-blue-500">•</span> {place}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dicas */}
                  {guideData.bestTime && (
                    <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                      <button onClick={() => setExpandedSection(expandedSection === 'tips' ? null : 'tips')} className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
                        <h4 className="text-[10px] uppercase tracking-widest text-green-400 font-bold flex items-center gap-2">💡 Dicas Práticas de Visitação</h4>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedSection === 'tips' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'tips' && (
                        <div className="p-4 pt-0 text-xs text-gray-300 leading-relaxed border-t border-white/5 mt-1">{guideData.bestTime}</div>
                      )}
                    </div>
                  )}

                  {/* Como Chegar e Acesso */}
                  {guideData.accessLevel && (
                    <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden mt-2">
                      <button onClick={() => setExpandedSection(expandedSection === 'access' ? null : 'access')} className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
                        <h4 className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-2">✈️ Como Chegar & Como Circular</h4>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedSection === 'access' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'access' && (
                        <div className="p-4 pt-0 text-xs leading-relaxed border-t border-white/5 mt-1">
                          <span className="inline-block px-2 py-1 bg-black/40 rounded border border-white/10 mb-2 font-bold text-[10px]">Classificação: {guideData.accessLevel}</span>
                          <p className="text-gray-300">{guideData.transportTips}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Segurança */}
                  {guideData.safetyTips && guideData.safetyTips.length > 0 && (
                    <div className="bg-amber-500/10 rounded-xl border border-amber-500/20 overflow-hidden">
                      <button onClick={() => setExpandedSection(expandedSection === 'safety' ? null : 'safety')} className="w-full p-4 flex items-center justify-between text-left hover:bg-amber-500/10 transition-colors">
                        <h4 className="text-[10px] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2"><AlertTriangle size={12} /> O que tomar cuidado</h4>
                        <ChevronDown size={14} className={`text-amber-400 transition-transform ${expandedSection === 'safety' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'safety' && (
                        <div className="p-4 pt-0 border-t border-amber-500/20 mt-1">
                          <ul className="text-xs text-amber-200/90 space-y-2">
                            {guideData.safetyTips.map((tip: string, i: number) => (
                              <li key={i} className="flex gap-2"><span className="text-amber-500">•</span> {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Próxima Parada (Simulada pelo Enrich) */}
                  {guideData.nextStop && (
                    <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                      <button onClick={() => setExpandedSection(expandedSection === 'next' ? null : 'next')} className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
                        <h4 className="text-[10px] uppercase tracking-widest text-purple-400 font-bold flex items-center gap-2">🧭 Próxima Parada Recomendada</h4>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${expandedSection === 'next' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'next' && (
                        <div className="p-4 pt-0 text-xs text-gray-300 leading-relaxed border-t border-white/5 mt-1">{guideData.nextStop}</div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            ) : null}
          </div>
        )}

        {/* DIVISIONS TAB */}
        {activeTab === 'divisions' && (
          <div className="space-y-6 animate-fade-in">
            <section>
              <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={12}/> Divisões Administrativas</h3>
              <div className="space-y-2">
                {divisions.map(div => {
                  const divVisited = MOCK_VISITED.some(v => v.type === 'DIVISION' && v.placeId === div.id && v.status === 'VISITED');
                  return (
                    <button key={div.id} onClick={() => onSelectDivision(div)} className="w-full text-left bg-white/5 hover:bg-white/10 p-4 rounded-xl flex items-center justify-between group transition-colors border border-transparent hover:border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          {divVisited ? <CheckCircle2 size={12} className="text-green-500" /> : <div className="w-2 h-2 rounded-full border border-gray-500"></div>}
                          <h4 className="text-sm font-bold text-white">{div.name}</h4>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{div.type}</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-600 group-hover:text-blue-400 transition-colors shrink-0" />
                    </button>
                  );
                })}
                {divisions.length === 0 && <p className="text-xs text-gray-500">Nenhuma divisão mapeada para este país.</p>}
              </div>
            </section>
          </div>
        )}

        {/* EXPERIENCES TAB */}
        {activeTab === 'experiences' && (
          <div className="space-y-6 animate-fade-in">
            <section>
              <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-3">Minhas Memórias</h3>
              <div className="space-y-4">
                {memories.map(mem => (
                  <div key={mem.id} className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-[10px] text-gray-400 mb-2">{mem.date}</div>
                    <p className="text-sm text-white font-medium">"{mem.caption}"</p>
                    {mem.notes && <p className="text-xs text-gray-400 mt-2">{mem.notes}</p>}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
        
      </div>
    </div>
  );
}
