import { z } from 'zod';

export const AIIntentSchema = z.enum([
  'ASK_COUNTRY',
  'BUILD_TRIP',
  'REPLAN',
  'TRIP_COMPANION',
  'COUNTRY_INFO',
]);
export type AIIntent = z.infer<typeof AIIntentSchema>;

export const BudgetLevelSchema = z.enum(['ECONOMY', 'MODERATE', 'COMFORTABLE', 'LUXURY']);
export type BudgetLevel = z.infer<typeof BudgetLevelSchema>;

export const TravelPaceSchema = z.enum(['RELAXED', 'BALANCED', 'INTENSE']);
export type TravelPace = z.infer<typeof TravelPaceSchema>;

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;

export const TravelerProfileSchema = z.object({
  originCountry: z.string().min(1).default('Brasil'),
  budgetLevel: BudgetLevelSchema.default('MODERATE'),
  pace: TravelPaceSchema.default('BALANCED'),
  interests: z.array(z.string()).default([]),
  foodPreferences: z.array(z.string()).default([]),
  foodRestrictions: z.array(z.string()).default([]),
  mobilityNeeds: z.string().optional(),
  companions: z.enum(['SOLO', 'COUPLE', 'FAMILY', 'FRIENDS']).default('SOLO'),
  morningPreference: z.boolean().default(true),
  nightlifeInterest: z.boolean().default(false),
});
export type TravelerProfile = z.infer<typeof TravelerProfileSchema>;

export const CountryIntelligenceSchema = z.object({
  countryName: z.string().min(1),
  iso3: z.string().min(2).max(3),
  overview: z.string().min(10),
  bestTime: z.string().min(5),
  cities: z.array(z.string()).min(1),
  culture: z.string().optional(),
  history: z.string().optional(),
  foodTips: z.array(z.string()).default([]),
  transportTips: z.string().min(5),
  accessLevel: z.enum(['EASY', 'MODERATE', 'COMPLEX']).default('EASY'),
  payments: z.object({
    currency: z.string(),
    cashRecommendation: z.string(),
    cardsAccepted: z.boolean().default(true),
    tipsHabit: z.string().optional(),
  }),
  safety: z.object({
    safetyScore: z.number().min(1).max(10).default(8),
    advisories: z.array(z.string()).default([]),
    emergencyNumbers: z.record(z.string(), z.string()).default({}),
  }),
  entryRequirements: z.object({
    visaRequiredForBrazilians: z.boolean().default(false),
    passportValidityMonths: z.number().min(0).default(6),
    mandatoryVaccines: z.array(z.string()).default([]),
  }),
  sources: z.array(z.object({
    sourceName: z.string(),
    sourceUrl: z.string().optional(),
  })).default([]),
});
export type CountryIntelligence = z.infer<typeof CountryIntelligenceSchema>;

const TimeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const IsoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const TripActivitySchema = z.object({
  startTime: z.string().regex(TimeRegex, 'Formato de hora deve ser HH:MM'),
  endTime: z.string().regex(TimeRegex, 'Formato de hora deve ser HH:MM'),
  title: z.string().min(1, 'Título da atividade é obrigatório'),
  type: z.enum(['ATTRACTION', 'MEAL', 'TRANSPORT', 'RELAX', 'CULTURE', 'NATURE', 'NIGHTLIFE', 'OTHER']),
  location: z.string().min(1, 'Localização é obrigatória'),
  coordinates: CoordinatesSchema,
  durationMinutes: z.number().positive('Duração deve ser positiva'),
  estimatedCost: z.number().min(0, 'Custo não pode ser negativo'),
  currency: z.string().min(1).default('USD'),
  transportFromPrevious: z.string().optional(),
  description: z.string().optional(),
}).refine(data => {
  const [startH, startM] = data.startTime.split(':').map(Number);
  const [endH, endM] = data.endTime.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  return endTotal >= startTotal;
}, {
  message: 'Horário final não pode ser anterior ao horário de início',
  path: ['endTime'],
});
export type TripActivity = z.infer<typeof TripActivitySchema>;

export const TripDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  date: z.string().regex(IsoDateRegex, 'Data deve estar no formato ISO YYYY-MM-DD'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  region: z.string().optional(),
  theme: z.string().optional(),
  activities: z.array(TripActivitySchema).min(1, 'Cada dia deve conter ao menos 1 atividade'),
  estimatedBudget: z.number().min(0),
  notes: z.string().optional(),
  sources: z.array(z.string()).default([]),
});
export type TripDay = z.infer<typeof TripDaySchema>;

export const TripItinerarySchema = z.object({
  tripId: z.string().min(1),
  destination: z.string().min(1),
  startDate: z.string().regex(IsoDateRegex, 'Data de início deve ser YYYY-MM-DD'),
  endDate: z.string().regex(IsoDateRegex, 'Data de término deve ser YYYY-MM-DD'),
  days: z.array(TripDaySchema).min(1, 'A viagem deve ter pelo menos um dia planejado'),
  totalEstimatedCost: z.number().min(0),
  currency: z.string().default('USD'),
  travelerProfile: TravelerProfileSchema.optional(),
  generatedAt: z.string().default(() => new Date().toISOString()),
}).refine(data => {
  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: 'Data de término não pode ser anterior à data de início',
  path: ['endDate'],
});
export type TripItinerary = z.infer<typeof TripItinerarySchema>;

export const AIResponseSchema = z.object({
  intent: AIIntentSchema,
  message: z.string().min(1),
  itinerary: TripItinerarySchema.optional(),
  countryIntelligence: CountryIntelligenceSchema.optional(),
  questionsForUser: z.array(z.string()).default([]),
  needsMoreInfo: z.boolean().default(false),
  sources: z.array(z.object({
    sourceName: z.string(),
    sourceUrl: z.string().optional(),
  })).default([]),
});
export type AIResponse = z.infer<typeof AIResponseSchema>;
