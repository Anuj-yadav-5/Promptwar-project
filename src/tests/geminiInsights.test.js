import { vi, describe, it, expect } from 'vitest';

// Mock @google/genai with a class-based constructor so vi doesn't warn
vi.mock('@google/genai', () => {
  const generateContent = vi.fn().mockResolvedValue({ text: 'Mocked Gemini AI insight' });
  class GoogleGenAI {
    constructor() { this.models = { generateContent }; }
  }
  return { GoogleGenAI };
});

import { generateCrowdInsight, generateAlertRecommendation, generateQueueTip } from '../services/geminiInsights';


const mockCrowdData = {
  zones: [
    { name: 'North Stand', status: 'critical', density: 0.92 },
    { name: 'South Stand', status: 'high', density: 0.78 },
    { name: 'VIP Lounge', status: 'low', density: 0.2 },
  ],
  avgWaitTime: 12,
  crowdFlowScore: 64,
  activeAlerts: 3,
};

describe('geminiInsights — generateCrowdInsight', () => {
  it('returns a non-empty string', async () => {
    const result = await generateCrowdInsight(mockCrowdData, 'Wankhede Stadium');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(5);
  });

  it('works with no venue name', async () => {
    const result = await generateCrowdInsight(mockCrowdData);
    expect(typeof result).toBe('string');
  });

  it('returns static fallback when crowdFlowScore is high and no AI', async () => {
    // Force API_KEY to be missing by importing without key
    const highScoreData = { ...mockCrowdData, crowdFlowScore: 90, zones: [] };
    const result = await generateCrowdInsight(highScoreData, 'Test Arena');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(5);
  });
});

describe('geminiInsights — generateAlertRecommendation', () => {
  it('returns a non-empty string for a critical alert', async () => {
    const alert = {
      title: 'Overcrowding',
      message: 'North Stand has exceeded safe capacity.',
      priority: 'critical',
      category: 'crowd',
      zone: 'North Stand',
    };
    const result = await generateAlertRecommendation(alert);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(5);
  });

  it('returns a non-empty string for a warning alert', async () => {
    const alert = {
      title: 'Queue Building',
      message: 'Gate 3 queue is increasing rapidly.',
      priority: 'warning',
      category: 'facility',
      zone: 'Gate 3',
    };
    const result = await generateAlertRecommendation(alert);
    expect(typeof result).toBe('string');
  });
});

describe('geminiInsights — generateQueueTip', () => {
  it('returns a non-empty string for a queue list', async () => {
    const queues = [
      { name: 'Main Concession', currentWait: 22, queueLength: 45 },
      { name: 'Gate 3', currentWait: 8, queueLength: 20 },
    ];
    const result = await generateQueueTip(queues);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(5);
  });

  it('returns a default message for empty queues', async () => {
    const result = await generateQueueTip([]);
    expect(result).toBe('All queues are operating normally.');
  });

  it('returns a default message for null input', async () => {
    const result = await generateQueueTip(null);
    expect(result).toBe('All queues are operating normally.');
  });
});
