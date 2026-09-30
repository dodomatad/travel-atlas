import { describe, it, expect } from 'vitest';
import { 
  TripActivitySchema, 
  TripItinerarySchema, 
  TravelerProfileSchema,
  CountryIntelligenceSchema 
} from '@/lib/ai/schemas';

describe('Zod Schemas Quality Gate', () => {
  describe('TripActivitySchema', () => {
    it('deve aprovar uma atividade válida com horários e custos corretos', () => {
      const validActivity = {
        startTime: '09:00',
        endTime: '11:30',
        title: 'Visita ao Coliseu',
        type: 'ATTRACTION',
        location: 'Piazza del Colosseo, 1',
        coordinates: { lat: 41.8902, lng: 12.4922 },
        durationMinutes: 150,
        estimatedCost: 18.5,
        currency: 'EUR',
      };

      const result = TripActivitySchema.safeParse(validActivity);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar horário em formato inválido', () => {
      const invalidTime = {
        startTime: '9:00', // falta o 0 na frente
        endTime: '11:00',
        title: 'Museu',
        type: 'CULTURE',
        location: 'Centro',
        coordinates: { lat: 0, lng: 0 },
        durationMinutes: 120,
        estimatedCost: 10,
      };

      const result = TripActivitySchema.safeParse(invalidTime);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar atividade com horário final anterior ao inicial', () => {
      const invertedTimes = {
        startTime: '14:00',
        endTime: '12:00', // anterior!
        title: 'Almoço',
        type: 'MEAL',
        location: 'Restaurante',
        coordinates: { lat: 0, lng: 0 },
        durationMinutes: 60,
        estimatedCost: 25,
      };

      const result = TripActivitySchema.safeParse(invertedTimes);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Horário final não pode ser anterior');
      }
    });

    it('deve rejeitar custo negativo', () => {
      const negativeCost = {
        startTime: '10:00',
        endTime: '12:00',
        title: 'Passeio',
        type: 'RELAX',
        location: 'Praça',
        coordinates: { lat: 0, lng: 0 },
        durationMinutes: 120,
        estimatedCost: -50,
      };

      const result = TripActivitySchema.safeParse(negativeCost);
      expect(result.success).toBe(false);
    });
  });

  describe('TripItinerarySchema', () => {
    it('deve rejeitar itinerário com data de término anterior à de início', () => {
      const invalidDates = {
        tripId: 'trip-1',
        destination: 'Roma, Itália',
        startDate: '2026-10-15',
        endDate: '2026-10-10', // anterior ao início!
        totalEstimatedCost: 1200,
        currency: 'EUR',
        days: [
          {
            dayNumber: 1,
            date: '2026-10-15',
            city: 'Roma',
            estimatedBudget: 300,
            activities: [
              {
                startTime: '09:00',
                endTime: '12:00',
                title: 'Centro Histórico',
                type: 'ATTRACTION',
                location: 'Roma Centro',
                coordinates: { lat: 41.9, lng: 12.5 },
                durationMinutes: 180,
                estimatedCost: 0,
              }
            ]
          }
        ]
      };

      const result = TripItinerarySchema.safeParse(invalidDates);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar itinerário sem nenhum dia', () => {
      const emptyDays = {
        tripId: 'trip-2',
        destination: 'Tóquio',
        startDate: '2026-11-01',
        endDate: '2026-11-07',
        totalEstimatedCost: 2000,
        days: [], // vazio!
      };

      const result = TripItinerarySchema.safeParse(emptyDays);
      expect(result.success).toBe(false);
    });
  });

  describe('TravelerProfileSchema', () => {
    it('deve preencher valores padrão seguros para o perfil', () => {
      const parsed = TravelerProfileSchema.parse({});
      expect(parsed.originCountry).toBe('Brasil');
      expect(parsed.budgetLevel).toBe('MODERATE');
      expect(parsed.pace).toBe('BALANCED');
    });
  });
});
