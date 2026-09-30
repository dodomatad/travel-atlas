'use client';

import { useState, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import GlobeWrapper from '@/components/GlobeWrapper';
import ErrorBoundary from '@/components/ErrorBoundary';
import { MOCK_COUNTRIES, MOCK_DIVISIONS, MOCK_CITIES, MOCK_ATTRACTIONS, MOCK_VISITED } from '@/data/mock';
import type { Country, AdministrativeDivision, City, Attraction, ExplorationLevel, ExplorationMode } from '@/lib/types';
import { Compass, Map, Plus, Minus, Sparkles, Globe, Trophy, Plane } from 'lucide-react';

const CountryDossier = lazy(() => import('@/components/CountryDossier'));
const DivisionPanel = lazy(() => import('@/components/DivisionPanel'));
const CityPanel = lazy(() => import('@/components/CityPanel'));
const DestinationPanel = lazy(() => import('@/components/DestinationPanel'));
const TripsPlannerPanel = lazy(() => import('@/components/TripsPlannerPanel'));
const AIAssistantPanel = lazy(() => import('@/components/AIAssistantPanel'));

function PanelSkeleton() {
  return (
    <div className="h-full w-full md:w-[420px] bg-[#050515]/95 backdrop-blur-3xl border-l border-white/10 p-6 flex flex-col justify-center items-center gap-3 text-white">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] uppercase tracking-widest text-gray-400">Carregando painel...</span>
    </div>
  );
}

export default function TravelAtlasApp() {
  const [level, setLevel] = useState<ExplorationLevel>('WORLD');
  const [mode, setMode] = useState<ExplorationMode>('EXPLORE');
  
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<AdministrativeDivision | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  
  const [focusCoordinate, setFocusCoordinate] = useState<{lat: number, lng: number} | null>(null);
  
  const [userPlaces, setUserPlaces] = useState(MOCK_VISITED);
  const [globeScale, setGlobeScale] = useState(1);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  const handleApplyItinerary = useCallback((itinerary: any) => {
    if (!itinerary?.destination) return;
    const dest = itinerary.destination.toLowerCase();
    const match = MOCK_COUNTRIES.find(c => dest.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(dest));
    if (match) {
      setUserPlaces(prev => {
        if (prev.some(p => p.placeId === match.id && p.type === 'COUNTRY')) return prev;
        return [...prev, { id: `v-${Date.now()}`, type: 'COUNTRY', placeId: match.id, status: 'PLANNED' }];
      });
      setSelectedCountry(match);
      setLevel('COUNTRY');
      if (match.coordinates) setFocusCoordinate(match.coordinates);
    }
    setMode('MY_TRIPS');
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { 
    setMounted(true); 
    const saved = localStorage.getItem('travel_atlas_globe_scale');
    if (saved) setGlobeScale(parseFloat(saved));
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem('travel_atlas_globe_scale', globeScale.toString());
  }, [globeScale, mounted]);

  const handleSelectCountry = useCallback((c: Country | null) => {
    setSelectedCountry(c);
    setSelectedDivision(null);
    setSelectedCity(null);
    setSelectedAttraction(null);
    setFocusCoordinate(null);
    setLevel(c ? 'COUNTRY' : 'WORLD');
  }, []);

  const handleSelectDivision = useCallback((d: AdministrativeDivision | null) => {
    setSelectedDivision(d);
    setSelectedCity(null);
    setSelectedAttraction(null);
    setFocusCoordinate(null);
    setLevel(d ? 'DIVISION' : 'COUNTRY');
  }, []);

  const handleSelectCity = useCallback((c: City | null) => {
    setSelectedCity(c);
    setSelectedAttraction(null);
    setFocusCoordinate(null);
    setLevel(c ? 'CITY' : (selectedDivision ? 'DIVISION' : 'COUNTRY'));
  }, [selectedDivision]);

  const handleSelectAttraction = useCallback((a: Attraction | null) => {
    setSelectedAttraction(a);
    setFocusCoordinate(null);
    setLevel(a ? 'LOCAL' : 'CITY');
  }, []);

  const handleAddPlace = useCallback((placeType: 'COUNTRY' | 'DIVISION' | 'CITY' | 'DESTINATION', placeId: string, status: 'VISITED' | 'PLANNED') => {
    setUserPlaces(prev => {
      if (prev.some(p => p.placeId === placeId && p.type === placeType)) return prev;
      return [...prev, { id: `v-${Date.now()}`, type: placeType, placeId, status }];
    });
  }, []);

  // Stats para "Meu Mundo" memoizados
  const visitedCountriesCount = useMemo(() => {
    return userPlaces.filter(v => v.type === 'COUNTRY' && v.status === 'VISITED').length;
  }, [userPlaces]);

  if (!mounted) return <div className="h-screen w-screen bg-[#000010]" />;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#000010] text-white font-sans selection:bg-blue-500/30">
      
      {/* Header Contexto / Breadcrumbs */}
      <header className="absolute top-0 left-0 right-0 z-40 p-3 sm:p-6 pointer-events-none flex justify-between items-start">
        <div className="flex items-center gap-2.5 sm:gap-3 max-w-[calc(100vw-64px)] sm:max-w-none">
          <img 
            src="/logo.png" 
            alt="Travel Globe Logo" 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-lg border border-white/20 shadow-blue-500/20 hover:scale-105 transition-transform pointer-events-auto shrink-0" 
          />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black tracking-widest uppercase text-white drop-shadow-md truncate">
              {mode === 'MY_WORLD' ? 'My Travel Atlas' : mode === 'MY_TRIPS' ? 'Planejador de Viagens' : 'Travel Atlas'}
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 text-[9px] font-bold tracking-widest uppercase drop-shadow-md overflow-x-auto no-scrollbar whitespace-nowrap pr-2">
              <span className={`pointer-events-auto cursor-pointer transition-colors ${level === 'WORLD' ? 'text-white' : 'text-gray-400 hover:text-white'}`} onClick={() => handleSelectCountry(null)}>Mundo</span>
              
              {selectedCountry && (
                <>
                  <span className="text-gray-600">/</span>
                  <span className={`pointer-events-auto cursor-pointer transition-colors ${level === 'COUNTRY' ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`} onClick={() => handleSelectCountry(selectedCountry)}>{selectedCountry.name}</span>
                </>
              )}

              {selectedDivision && (
                <>
                  <span className="text-gray-600">/</span>
                  <span className={`pointer-events-auto cursor-pointer transition-colors ${level === 'DIVISION' ? 'text-purple-400' : 'text-gray-400 hover:text-purple-400'}`} onClick={() => handleSelectDivision(selectedDivision)}>{selectedDivision.name}</span>
                </>
              )}
              
              {selectedCity && (
                <>
                  <span className="text-gray-600">/</span>
                  <span className={`pointer-events-auto cursor-pointer transition-colors ${level === 'CITY' ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} onClick={() => handleSelectCity(selectedCity)}>{selectedCity.name}</span>
                </>
              )}
              
              {selectedAttraction && (
                <>
                  <span className="text-gray-600">/</span>
                  <span className="text-green-400">{selectedAttraction.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Mobile AI Button */}
        <div className="pointer-events-auto flex items-center md:hidden">
          <button 
            onClick={() => setIsAIAssistantOpen(prev => !prev)}
            className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
              isAIAssistantOpen 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/40' 
                : 'bg-black/50 backdrop-blur-md text-blue-400 border border-white/10 hover:bg-white/10'
            }`}
            aria-label="Assistente de Inteligência Turística"
          >
            <Sparkles size={16} />
          </button>
        </div>

        {/* Toggle Mode Desktop */}
        <div className="pointer-events-auto hidden md:flex bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
          <button 
            onClick={() => setMode('EXPLORE')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${mode === 'EXPLORE' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Explorar O Mundo
          </button>
          <button 
            onClick={() => setMode('MY_WORLD')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 ${mode === 'MY_WORLD' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Meu Mundo <span className="ml-1 px-1.5 py-0.5 bg-black/30 rounded text-[8px]">{visitedCountriesCount}</span>
          </button>
          <button 
            onClick={() => setMode('MY_TRIPS')}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 ${mode === 'MY_TRIPS' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Minhas Viagens
          </button>
          <button 
            onClick={() => setIsAIAssistantOpen(prev => !prev)}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${
              isAIAssistantOpen ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' : 'bg-black/40 hover:bg-white/10 text-blue-400 border border-blue-500/30'
            }`}
          >
            <Sparkles size={12} /> Assistente IA
          </button>
        </div>
      </header>

      {/* Interactive Globe */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          transform: `scale(${globeScale})`, 
          transformOrigin: 'center center', 
          transition: 'transform 0.2s ease-out' 
        }}
      >
        <GlobeWrapper
          countries={MOCK_COUNTRIES}
          cities={MOCK_CITIES}
          attractions={MOCK_ATTRACTIONS}
          selectedCountry={selectedCountry}
          selectedCity={selectedCity}
          selectedAttraction={selectedAttraction}
          onSelectCountry={handleSelectCountry}
          onSelectCity={handleSelectCity}
          onSelectAttraction={handleSelectAttraction}
          focusCoordinate={focusCoordinate}
          explorationMode={mode}
          visitedPlaces={userPlaces}
        />
      </div>

      {/* Planner Panel */}
      {mode === 'MY_TRIPS' && (
        <Suspense fallback={null}>
          <TripsPlannerPanel
            userPlaces={userPlaces}
            onSelectCountry={handleSelectCountry}
            onSelectCity={handleSelectCity}
            onSelectAttraction={handleSelectAttraction}
            onClose={() => setMode('EXPLORE')}
            onOpenAITripPlanner={() => setIsAIAssistantOpen(true)}
          />
        </Suspense>
      )}

      {/* Contextual Panels */}
      <div className="fixed inset-0 sm:absolute sm:inset-auto sm:top-0 sm:right-0 sm:bottom-0 pointer-events-none flex justify-end z-30">
        <div className="pointer-events-auto flex w-full sm:w-auto h-full">
          <ErrorBoundary>
            <Suspense fallback={<PanelSkeleton />}>
              {level === 'COUNTRY' && selectedCountry && (
                <CountryDossier 
                  country={selectedCountry} 
                  onClose={() => handleSelectCountry(null)} 
                  onSelectCity={handleSelectCity}
                  onSelectDivision={handleSelectDivision}
                  onFlyToCoordinates={setFocusCoordinate}
                  onAddPlace={handleAddPlace}
                  onOpenAIWithCountry={(name) => setIsAIAssistantOpen(true)}
                />
              )}
              {level === 'DIVISION' && selectedDivision && (
                <DivisionPanel 
                  division={selectedDivision} 
                  onClose={() => handleSelectCountry(selectedCountry)} 
                  onSelectCity={handleSelectCity} 
                />
              )}
              {level === 'CITY' && selectedCity && (
                <CityPanel 
                  city={selectedCity} 
                  attractions={MOCK_ATTRACTIONS.filter(a => a.cityId === selectedCity.id)} 
                  onClose={() => selectedDivision ? handleSelectDivision(selectedDivision) : handleSelectCountry(selectedCountry)} 
                  onSelectAttraction={handleSelectAttraction} 
                  onAddPlace={handleAddPlace}
                />
              )}
              {level === 'LOCAL' && selectedAttraction && (
                <DestinationPanel 
                  attraction={selectedAttraction}
                  onClose={() => handleSelectCity(selectedCity)}
                  onSelectAttraction={handleSelectAttraction}
                  onAddPlace={handleAddPlace}
                />
              )}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* Globe Scale Control (Desktop only) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-30 bg-[#0B0F17]/80 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 items-center gap-3 shadow-xl">
        <button 
          onClick={() => setGlobeScale(prev => Math.max(0.5, prev - 0.1))}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Minus size={16} />
        </button>
        <input 
          type="range" 
          min="0.5" 
          max="2.5" 
          step="0.05" 
          value={globeScale}
          onChange={(e) => setGlobeScale(parseFloat(e.target.value))}
          className="w-24 accent-blue-500"
        />
        <button 
          onClick={() => setGlobeScale(prev => Math.min(2.5, prev + 0.1))}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Plus size={16} />
        </button>
        <span className="text-[10px] font-bold text-gray-300 w-8 text-right">{Math.round(globeScale * 100)}%</span>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#050515]/95 backdrop-blur-2xl border-t border-white/10 px-3 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button 
          onClick={() => { setMode('EXPLORE'); setIsAIAssistantOpen(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            mode === 'EXPLORE' && !isAIAssistantOpen ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Globe size={18} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Explorar</span>
        </button>

        <button 
          onClick={() => { setMode('MY_WORLD'); setIsAIAssistantOpen(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
            mode === 'MY_WORLD' && !isAIAssistantOpen ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Trophy size={18} />
            {visitedCountriesCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-emerald-500 text-black text-[8px] font-black px-1 rounded-full">
                {visitedCountriesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Meu Mundo</span>
        </button>

        <button 
          onClick={() => { setMode('MY_TRIPS'); setIsAIAssistantOpen(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            mode === 'MY_TRIPS' && !isAIAssistantOpen ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Plane size={18} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Viagens</span>
        </button>

        <button 
          onClick={() => setIsAIAssistantOpen(prev => !prev)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            isAIAssistantOpen ? 'text-indigo-400 bg-indigo-500/20 shadow-inner' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles size={18} className={isAIAssistantOpen ? 'animate-pulse text-indigo-400' : ''} />
          <span className="text-[10px] font-bold uppercase tracking-wider">IA Llama</span>
        </button>
      </nav>

      {/* AI Travel Assistant Panel */}
      <Suspense fallback={null}>
        <AIAssistantPanel
          isOpen={isAIAssistantOpen}
          onClose={() => setIsAIAssistantOpen(false)}
          contextCountry={selectedCountry?.name}
          onApplyItinerary={handleApplyItinerary}
          onFlyToCoordinates={setFocusCoordinate}
        />
      </Suspense>
    </div>
  );
}
