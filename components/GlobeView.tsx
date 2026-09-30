'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { Country, City, Attraction, VisitedPlace, ExplorationMode } from '@/lib/types';

interface Props {
  geoJson: any;
  countries: Country[];
  cities: City[];
  attractions: Attraction[];
  visitedPlaces: VisitedPlace[];
  explorationMode: ExplorationMode;
  selectedCountry: Country | null;
  selectedCity: City | null;
  selectedAttraction: Attraction | null;
  focusCoordinate?: { lat: number; lng: number } | null;
  onSelectCountry: (c: Country | null) => void;
  onSelectCity: (c: City | null) => void;
  onSelectAttraction: (a: Attraction | null) => void;
}

export default function GlobeView({
  geoJson,
  countries = [],
  cities = [],
  attractions = [],
  visitedPlaces = [],
  explorationMode,
  selectedCountry,
  selectedCity,
  selectedAttraction,
  focusCoordinate,
  onSelectCountry,
  onSelectCity,
  onSelectAttraction,
}: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [dim, setDim] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (typeof window !== 'undefined') {
          setDim({ w: window.innerWidth, h: window.innerHeight });
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Hierarchical Fly-To com proteção contra métodos indefinidos
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;

    try {
      const controls = typeof globe.controls === 'function' ? globe.controls() : null;

      if (focusCoordinate && typeof focusCoordinate.lat === 'number' && typeof focusCoordinate.lng === 'number') {
        if (controls) controls.autoRotate = false;
        if (typeof globe.pointOfView === 'function') {
          globe.pointOfView({ lat: focusCoordinate.lat, lng: focusCoordinate.lng, altitude: 0.2 }, 1200);
        }
      } else if (selectedAttraction?.coordinates && typeof selectedAttraction.coordinates.lat === 'number') {
        if (controls) controls.autoRotate = false;
        if (typeof globe.pointOfView === 'function') {
          globe.pointOfView(
            { lat: selectedAttraction.coordinates.lat, lng: selectedAttraction.coordinates.lng, altitude: 0.1 },
            1200
          );
        }
      } else if (selectedCity?.coordinates && typeof selectedCity.coordinates.lat === 'number') {
        if (controls) controls.autoRotate = false;
        if (typeof globe.pointOfView === 'function') {
          globe.pointOfView(
            { lat: selectedCity.coordinates.lat, lng: selectedCity.coordinates.lng, altitude: 0.3 },
            1200
          );
        }
      } else if (selectedCountry?.coordinates && typeof selectedCountry.coordinates.lat === 'number') {
        if (controls) controls.autoRotate = false;
        const microstates = ['VAT', 'MCO', 'SGP', 'SMR', 'LIE', 'MLT', 'AND'];
        const alt = microstates.includes(selectedCountry.iso3) ? 0.3 : 1.0;
        if (typeof globe.pointOfView === 'function') {
          globe.pointOfView(
            { lat: selectedCountry.coordinates.lat, lng: selectedCountry.coordinates.lng, altitude: alt },
            1200
          );
        }
      } else {
        if (controls) controls.autoRotate = true;
      }
    } catch (err) {
      console.warn('Globe pointOfView notice:', err);
    }
  }, [selectedCountry, selectedCity, selectedAttraction, focusCoordinate]);

  const polygons = useMemo(() => {
    return Array.isArray(geoJson?.features) ? geoJson.features : [];
  }, [geoJson]);

  const getPolygonColor = useCallback(
    (feat: any) => {
      if (!feat?.properties) return 'rgba(255, 255, 255, 0.05)';
      const iso3 = feat.properties['ISO3166-1-Alpha-3'] || feat.properties['SU_A3'] || feat.properties['ADM0_A3'];
      const featName = feat.properties.name || feat.properties.NAME || feat.properties.ADMIN;
      const dbCountry = countries.find(
        c => c.iso3 === iso3 || (c.iso3 === 'FRA' && featName === 'France') || (c.iso3 === 'NOR' && featName === 'Norway')
      );

      if (dbCountry && selectedCountry?.id === dbCountry.id) return 'rgba(59, 130, 246, 0.4)';

      const isVisited =
        dbCountry && visitedPlaces.some(v => v.type === 'COUNTRY' && v.placeId === dbCountry.id && v.status === 'VISITED');
      if (isVisited) return 'rgba(34, 197, 94, 0.4)';

      const isPlanned =
        dbCountry && visitedPlaces.some(v => v.type === 'COUNTRY' && v.placeId === dbCountry.id && v.status === 'PLANNED');
      if (isPlanned) return 'rgba(239, 68, 68, 0.4)';

      if (!dbCountry) return 'rgba(255, 255, 255, 0.05)';

      switch (dbCountry.contentStatus) {
        case 'COMPLETE':
          return 'rgba(59, 130, 246, 0.2)';
        case 'PARTIAL':
          return 'rgba(59, 130, 246, 0.1)';
        default:
          return 'rgba(255, 255, 255, 0.05)';
      }
    },
    [countries, selectedCountry, explorationMode, visitedPlaces]
  );

  const handlePolygonClick = useCallback(
    (feat: any, event: any) => {
      if (!feat?.properties) return;
      const iso3 = feat.properties['ISO3166-1-Alpha-3'] || feat.properties['SU_A3'] || feat.properties['ADM0_A3'];
      const featName = feat.properties.name || feat.properties.NAME || feat.properties.ADMIN;
      let dbCountry = countries.find(
        c => c.iso3 === iso3 || (c.iso3 === 'FRA' && featName === 'France') || (c.iso3 === 'NOR' && featName === 'Norway')
      );

      if (!dbCountry && iso3 && iso3 !== '-99') {
        dbCountry = {
          id: `generated-${iso3}`,
          iso3: iso3,
          name: featName || 'Região Desconhecida',
          languages: [],
          coordinates: { lat: event?.lat ?? 0, lng: event?.lng ?? 0 },
          description: 'Região geográfica presente no mapa global, mas sem dados turísticos registrados no atlas.',
          contentStatus: 'BASIC',
        };
      }

      if (dbCountry) onSelectCountry(dbCountry);
    },
    [countries, onSelectCountry]
  );

  const visibleCities = useMemo(() => {
    if (selectedCountry) return cities.filter(c => c.countryId === selectedCountry.id);
    if (explorationMode === 'MY_WORLD')
      return cities.filter(c => visitedPlaces.some(v => v.type === 'CITY' && v.placeId === c.id && v.status === 'VISITED'));
    if (explorationMode === 'MY_TRIPS')
      return cities.filter(c => visitedPlaces.some(v => v.type === 'CITY' && v.placeId === c.id && v.status === 'PLANNED'));
    return [];
  }, [cities, selectedCountry, explorationMode, visitedPlaces]);

  const visibleAttractions = useMemo(() => {
    if (selectedCity) return attractions.filter(a => a.cityId === selectedCity.id);
    if (explorationMode === 'MY_WORLD')
      return attractions.filter(a => visitedPlaces.some(v => v.type === 'DESTINATION' && v.placeId === a.id && v.status === 'VISITED'));
    if (explorationMode === 'MY_TRIPS')
      return attractions.filter(a => visitedPlaces.some(v => v.type === 'DESTINATION' && v.placeId === a.id && v.status === 'PLANNED'));
    return [];
  }, [attractions, selectedCity, explorationMode, visitedPlaces]);

  const allMarkers = useMemo(() => [...visibleCities, ...visibleAttractions], [visibleCities, visibleAttractions]);

  const renderHtmlMarker = useCallback(
    (d: any) => {
      if (!d) return document.createElement('div');
      
      const el = document.createElement('div');
      
      // Se for uma cidade ou atração
      const isCity = 'bestTime' in d;
      const isSelected = isCity ? selectedCity?.id === d.id : selectedAttraction?.id === d.id;

      const isVisited = isCity
        ? visitedPlaces.some(v => v.type === 'CITY' && v.placeId === d.id && v.status === 'VISITED')
        : visitedPlaces.some(v => v.type === 'DESTINATION' && v.placeId === d.id && v.status === 'VISITED');

      const isPlannedObj = isCity
        ? visitedPlaces.some(v => v.type === 'CITY' && v.placeId === d.id && v.status === 'PLANNED')
        : visitedPlaces.some(v => v.type === 'DESTINATION' && v.placeId === d.id && v.status === 'PLANNED');

      const colorClass = isVisited ? 'bg-green-500' : isPlannedObj ? 'bg-red-500' : isCity ? 'bg-yellow-400' : 'bg-blue-400';
      const shadowClass = isVisited
        ? 'shadow-[0_0_15px_rgba(34,197,94,0.8)]'
        : isPlannedObj
        ? 'shadow-[0_0_15px_rgba(239,68,68,0.8)]'
        : isCity
        ? 'shadow-[0_0_15px_rgba(250,204,21,0.8)]'
        : 'shadow-[0_0_10px_rgba(59,130,246,0.6)]';

      el.innerHTML = `
      <div class="flex flex-col items-center cursor-pointer transition-transform hover:scale-125 ${
        isSelected ? 'scale-125' : ''
      }">
        <div class="px-2 py-0.5 rounded text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm border border-white/20 whitespace-nowrap mb-1 pointer-events-auto">
          ${isVisited ? '✓ ' : isPlannedObj ? '📅 ' : ''}${d.name}
        </div>
        <div class="w-3 h-3 ${colorClass} rounded-full border-2 border-white ${shadowClass}"></div>
      </div>
    `;

      el.onclick = e => {
        e.stopPropagation();
        if (isCity) onSelectCity(d);
        else onSelectAttraction(d);
      };
      return el;
    },
    [selectedCity, selectedAttraction, visitedPlaces, onSelectCity, onSelectAttraction, countries]
  );

  const getPolygonAltitude = useCallback(
    (d: any) => {
      if (!d?.properties) return 0.01;
      const iso3 = d.properties['ISO3166-1-Alpha-3'] || d.properties['SU_A3'] || d.properties['ADM0_A3'];
      const featName = d.properties.name || d.properties.NAME || d.properties.ADMIN;
      const dbCountry = countries.find(c => c.iso3 === iso3 || (c.iso3 === 'FRA' && featName === 'France'));
      if (dbCountry && selectedCountry?.id === dbCountry.id) return 0.04;
      if (dbCountry && visitedPlaces.some(v => v.type === 'COUNTRY' && v.placeId === dbCountry.id && v.status === 'VISITED'))
        return 0.02;
      if (dbCountry && visitedPlaces.some(v => v.type === 'COUNTRY' && v.placeId === dbCountry.id && v.status === 'PLANNED'))
        return 0.02;
      return 0.01;
    },
    [countries, selectedCountry, explorationMode, visitedPlaces]
  );

  const getPolygonSideColor = useCallback((feat: any) => {
    if (!feat?.properties) return 'rgba(59, 130, 246, 0.1)';
    const iso3 = feat.properties['ISO3166-1-Alpha-3'] || feat.properties['SU_A3'] || feat.properties['ADM0_A3'];
    const dbCountry = countries.find(c => c.iso3 === iso3);
    if (dbCountry && visitedPlaces.some(v => v.type === 'COUNTRY' && v.placeId === dbCountry.id && v.status === 'VISITED')) return 'rgba(34, 197, 94, 0.1)';
    if (dbCountry && visitedPlaces.some(v => v.type === 'COUNTRY' && v.placeId === dbCountry.id && v.status === 'PLANNED')) return 'rgba(239, 68, 68, 0.1)';
    return 'rgba(59, 130, 246, 0.1)';
  }, [countries, visitedPlaces]);

  const getPolygonStrokeColor = useCallback((feat: any) => {
    if (!feat?.properties) return 'rgba(255, 255, 255, 0.1)';
    const iso3 = feat.properties['ISO3166-1-Alpha-3'] || feat.properties['SU_A3'] || feat.properties['ADM0_A3'];
    const dbCountry = countries.find(c => c.iso3 === iso3);
    if (dbCountry && visitedPlaces.some(v => v.type === 'COUNTRY' && v.placeId === dbCountry.id && v.status === 'VISITED')) return 'rgba(34, 197, 94, 0.2)';
    if (dbCountry && visitedPlaces.some(v => v.type === 'COUNTRY' && v.placeId === dbCountry.id && v.status === 'PLANNED')) return 'rgba(239, 68, 68, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  }, [countries, visitedPlaces]);

  const handlePolygonHover = useCallback(
    (feat: any) => {
      try {
        if (globeRef.current?.controls) {
          const controls = globeRef.current.controls();
          if (controls) {
            controls.autoRotate =
              !feat && !selectedCountry && !selectedCity && !selectedAttraction && !focusCoordinate;
          }
        }
      } catch {
        // Safe catch for hover transitions
      }
    },
    [selectedCountry, selectedCity, selectedAttraction, focusCoordinate]
  );

  return (
    <Globe
      ref={globeRef}
      width={dim.w}
      height={dim.h}
      backgroundColor="rgba(0,0,0,0)"
      rendererConfig={{ antialias: false, powerPreference: "high-performance" }}
      globeImageUrl="/textures/earth-dark.jpg"
      bumpImageUrl="/textures/earth-topology.png"
      polygonsData={polygons}
      polygonAltitude={getPolygonAltitude}
      polygonCapColor={getPolygonColor}
      polygonSideColor={getPolygonSideColor}
      polygonStrokeColor={getPolygonStrokeColor}
      polygonsTransitionDuration={0}
      onPolygonClick={handlePolygonClick}
      onPolygonHover={handlePolygonHover}
      labelsData={polygons}
      labelLat={(d: any) => {
        const iso3 = d.properties?.['ISO3166-1-Alpha-3'] || d.properties?.['SU_A3'];
        const dbCountry = countries.find(c => c.iso3 === iso3);
        if (dbCountry) return dbCountry.coordinates.lat;
        return d.bbox ? (d.bbox[1] + d.bbox[3]) / 2 : 0;
      }}
      labelLng={(d: any) => {
        const iso3 = d.properties?.['ISO3166-1-Alpha-3'] || d.properties?.['SU_A3'];
        const dbCountry = countries.find(c => c.iso3 === iso3);
        if (dbCountry) return dbCountry.coordinates.lng;
        return d.bbox ? (d.bbox[0] + d.bbox[2]) / 2 : 0;
      }}
      labelText={(d: any) => {
        const iso3 = d.properties?.['ISO3166-1-Alpha-3'] || d.properties?.['SU_A3'] || d.properties?.['ADM0_A3'] || '';
        const featName = d.properties?.name || d.properties?.NAME || d.properties?.ADMIN;
        const dbCountry = countries.find(
          c => c.iso3 === iso3 || (c.iso3 === 'FRA' && featName === 'France') || (c.iso3 === 'NOR' && featName === 'Norway')
        );

        let label = iso3;
        
        if (dbCountry) {
          const isPlanned = visitedPlaces.some(v => v.type === 'COUNTRY' && v.placeId === dbCountry.id && v.status === 'PLANNED');
          if (isPlanned) {
            const LOGICAL_ROUTE_ORDER = [
              'Brasil', 'Bolívia', 'Argentina', 'Chile', 'Peru', 'Colômbia',
              'México', 'Estados Unidos', 
              'Marrocos', 'Reino Unido', 'Inglaterra', 'Escócia', 'França', 'Mônaco', 'Itália', 'Alemanha', 'Suíça', 'Holanda', 'Países Baixos', 'Grécia',
              'Noruega', 'Suécia', 'Finlândia', 'Islândia',
              'Turquia', 'Israel', 'Egito', 'Emirados Árabes Unidos',
              'Maldivas', 'Tailândia', 'Indonésia', 'Filipinas', 'China', 'Japão'
            ];

            const plannedCountries = visitedPlaces
              .filter(v => v.type === 'COUNTRY' && v.status === 'PLANNED')
              .map(v => countries.find(c => c.id === v.placeId))
              .filter(Boolean) as Country[];

            const sorted = plannedCountries.sort((a, b) => {
              let idxA = LOGICAL_ROUTE_ORDER.findIndex(name => a.name.includes(name) || name.includes(a.name));
              let idxB = LOGICAL_ROUTE_ORDER.findIndex(name => b.name.includes(name) || name.includes(b.name));
              if (idxA === -1) idxA = 999;
              if (idxB === -1) idxB = 999;
              if (idxA !== idxB) return idxA - idxB;
              return 0; 
            });

            const indexInRoute = sorted.findIndex(c => c.id === dbCountry.id);
            if (indexInRoute !== -1) {
              label = `${indexInRoute + 1}. ${iso3}`;
            }
          }
        }
        
        return label;
      }}
      labelSize={0.9}
      labelAltitude={(d: any) => getPolygonAltitude(d) + 0.002}
      labelDotRadius={0}
      labelColor={(d: any) => {
        const iso3 = d.properties?.['ISO3166-1-Alpha-3'] || d.properties?.['SU_A3'];
        const dbCountry = countries.find(c => c.iso3 === iso3);
        const isPlanned = dbCountry && visitedPlaces.some(v => v.type === 'COUNTRY' && v.placeId === dbCountry.id && v.status === 'PLANNED');
        // Usar cores sólidas para leitura máxima em 3D, mas sem estourar a tela
        return isPlanned ? 'rgba(255, 50, 50, 1)' : 'rgba(255, 255, 255, 0.7)';
      }}
      labelResolution={5}
      htmlElementsData={allMarkers}
      htmlLat={(d: any) => d?.coordinates?.lat ?? 0}
      htmlLng={(d: any) => d?.coordinates?.lng ?? 0}
      htmlElement={renderHtmlMarker}
      htmlTransitionDuration={0}
    />
  );
}
