'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw, AlertCircle } from 'lucide-react';

const GlobeView = dynamic(() => import('./GlobeView'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#000010] flex flex-col items-center justify-center text-white gap-3">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] tracking-widest uppercase text-gray-400">Carregando Motor 3D...</span>
    </div>
  ),
});

export default function GlobeWrapper(props: any) {
  const [geoJson, setGeoJson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGeoJson = useCallback(() => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();

    // Utilizando um dataset GeoJSON muito mais leve (110m) para melhorar a performance
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson', { signal: controller.signal })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Falha ao carregar dataset geográfico (Status ${res.status})`);
        }
        return res.json();
      })
      .then(data => {
        setGeoJson(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Erro ao carregar dataset do globo:', err);
          setError(err.message || 'Erro ao carregar mapa.');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const cleanup = fetchGeoJson();
    return cleanup;
  }, [fetchGeoJson]);

  if (error) {
    return (
      <div className="absolute inset-0 bg-[#000010] flex flex-col items-center justify-center p-6 text-white text-center gap-4">
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-400">
          <AlertCircle size={24} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Não foi possível carregar os dados do mapa</p>
          <p className="text-xs text-gray-400 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchGeoJson}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <RefreshCw size={14} /> Tentar Novamente
        </button>
      </div>
    );
  }

  if (loading || !geoJson) {
    return (
      <div className="absolute inset-0 bg-[#000010] flex flex-col items-center justify-center text-white gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] tracking-widest uppercase text-gray-300 font-medium">
          Carregando Atlas Interativo...
        </span>
      </div>
    );
  }

  return <GlobeView geoJson={geoJson} {...props} />;
}
