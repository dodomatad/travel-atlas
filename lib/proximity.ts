import { Coordinates } from './types';

// Retorna a distância em quilômetros usando a fórmula de Haversine com validação defensiva
export function getDistance(coord1?: Coordinates | null, coord2?: Coordinates | null): number {
  if (!coord1 || !coord2 || typeof coord1.lat !== 'number' || typeof coord1.lng !== 'number' || typeof coord2.lat !== 'number' || typeof coord2.lng !== 'number') {
    return Infinity;
  }

  const R = 6371; // Raio da Terra em km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  return R * c;
}

export function formatDistance(km: number): string {
  if (!Number.isFinite(km) || km < 0) return '0 m';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

// Retorna lugares próximos ordenados por distância real
export function getNearby<T extends { coordinates?: Coordinates }>(
  places: T[] = [], 
  center?: Coordinates | null, 
  maxRadiusKm: number = 50
): (T & { distanceKm: number })[] {
  if (!Array.isArray(places) || !center || typeof center.lat !== 'number' || typeof center.lng !== 'number') {
    return [];
  }

  return places
    .filter((p): p is T & { coordinates: Coordinates } => Boolean(p && p.coordinates && typeof p.coordinates.lat === 'number' && typeof p.coordinates.lng === 'number'))
    .map(p => ({
      ...p,
      distanceKm: getDistance(center, p.coordinates)
    }))
    .filter(p => Number.isFinite(p.distanceKm) && p.distanceKm <= maxRadiusKm && p.distanceKm > 0)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

// Algoritmo de Nearest Neighbor para Roteirização defensiva
export function optimizeRouteNearestNeighbor<T extends { coordinates?: Coordinates }>(
  places: T[] = [],
  startPoint?: Coordinates | null
): T[] {
  if (!Array.isArray(places) || places.length <= 1) return places || [];
  
  const unvisited = [...places].filter(p => Boolean(p && p.coordinates && typeof p.coordinates.lat === 'number' && typeof p.coordinates.lng === 'number'));
  if (unvisited.length <= 1) return unvisited;

  const route: T[] = [];
  
  let current: T = (startPoint && typeof startPoint.lat === 'number' && typeof startPoint.lng === 'number')
    ? { coordinates: startPoint } as T 
    : unvisited.shift()!;
    
  if (!startPoint) route.push(current);

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      if (!current.coordinates || !unvisited[i].coordinates) continue;
      const dist = getDistance(current.coordinates, unvisited[i].coordinates);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    if (minDistance === Infinity) {
      route.push(...unvisited);
      break;
    }

    current = unvisited.splice(nearestIdx, 1)[0];
    route.push(current);
  }

  return route;
}
