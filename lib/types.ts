export type ContentStatus = 'BASIC' | 'PARTIAL' | 'COMPLETE';
export type ExplorationLevel = 'WORLD' | 'COUNTRY' | 'DIVISION' | 'CITY' | 'LOCAL';
export type ExplorationMode = 'EXPLORE' | 'MY_WORLD' | 'MY_TRIPS';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Country {
  id: string;
  name: string;
  iso3: string;
  officialName?: string;
  flag?: string;
  capital?: string;
  continent?: string;
  region?: string;
  circuit?: string;
  currency?: string;
  languages: string[];
  timezone?: string;
  emergencyNumbers?: Record<string, string>;
  coordinates: Coordinates;
  description: string;
  image?: string;
  contentStatus: ContentStatus;
  guide?: GuideInfo;
}

export interface AdministrativeDivision {
  id: string;
  countryId: string;
  name: string;
  code: string;
  type: 'STATE' | 'PROVINCE' | 'REGION' | 'PREFECTURE' | 'DEPARTMENT' | 'TERRITORY' | 'OTHER';
  coordinates: Coordinates;
  description?: string;
  population?: number;
  image?: string;
}

export interface GuideInfo {
  nextStops?: string[];
  visitationTips?: string[];
  mustSee?: string[];
  localHistory?: string;
  bestTime?: string;
  safetyTips?: string[];
}

export interface City {
  id: string;
  countryId: string;
  divisionId?: string;
  name: string;
  coordinates: Coordinates;
  description: string;
  image?: string;
  bestTime?: string;
  guide?: GuideInfo;
}

export interface Attraction {
  id: string;
  cityId: string;
  countryId: string;
  divisionId?: string;
  name: string;
  coordinates: Coordinates;
  category: string;
  description: string;
  estimatedDuration?: string;
  image?: string;
  tags?: string[];
  guide?: GuideInfo;
}

export interface VisitedPlace {
  id: string;
  type: 'COUNTRY' | 'DIVISION' | 'CITY' | 'DESTINATION';
  placeId: string;
  status: 'VISITED' | 'PLANNED' | 'FAVORITE';
  firstVisitedAt?: string;
}

export interface TravelMemory {
  id: string;
  userId: string;
  date: string;
  photos: string[];
  caption?: string;
  notes?: string;
  rating?: number;
  tags: string[];
  coordinates?: Coordinates;
  countryId?: string;
  divisionId?: string;
  cityId?: string;
  destinationId?: string;
}

export interface TransportConnection {
  id: string;
  fromCityId: string;
  toCityId: string;
  fromCountryId?: string;
  toCountryId?: string;
  transportType: string;
  direct: boolean;
  duration: string;
  distance?: string;
}
