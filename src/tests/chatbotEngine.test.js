import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock @google/genai to prevent real API calls in tests
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({ text: 'Mocked Gemini response' })
    }
  }))
}));

import { getChatResponse, QUICK_ACTIONS } from '../services/chatbotEngine';

describe('Chatbot Engine — Greetings', () => {
  it('returns a personalized greeting with the user name', async () => {
    const res = await getChatResponse('hi', 'John');
    expect(res).toMatch(/John|PulseArena AI/i);
  });

  it('works with various greeting forms', async () => {
    const forms = ['hello', 'hey', 'howdy', 'sup', 'yo'];
    for (const greet of forms) {
      const res = await getChatResponse(greet);
      expect(res).toMatch(/PulseArena AI|assistant|stadium/i);
    }
  });

  it('handles greeting without a user name', async () => {
    const res = await getChatResponse('hi');
    expect(typeof res).toBe('string');
    expect(res.length).toBeGreaterThan(10);
  });
});

describe('Chatbot Engine — Directions', () => {
  it('returns restroom directions for related queries', async () => {
    const res = await getChatResponse('where is the restroom');
    expect(res).toMatch(/restroom|North|Restrooms/i);
  });

  it('handles bathroom keyword', async () => {
    const res = await getChatResponse('i need the bathroom');
    expect(res).toMatch(/restroom|bathroom|North/i);
  });

  it('returns food court info for food queries', async () => {
    const res = await getChatResponse('where can I eat something?');
    expect(res).toMatch(/food|burger|pizza|court/i);
  });

  it('returns food info for burger keyword', async () => {
    const res = await getChatResponse('I want a burger');
    expect(res).toMatch(/Burger|food/i);
  });

  it('returns exit directions', async () => {
    const res = await getChatResponse('where is the exit');
    expect(res).toMatch(/exit|Gate/i);
  });

  it('returns parking info', async () => {
    const res = await getChatResponse('where can I park my car');
    expect(res).toMatch(/parking|Parking Zone/i);
  });

  it('returns medical center info', async () => {
    const res = await getChatResponse('I need a doctor');
    expect(res).toMatch(/Medical|emergency|helpline/i);
  });

  it('returns VIP lounge info', async () => {
    const res = await getChatResponse('where is the vip lounge');
    expect(res).toMatch(/VIP|lounge/i);
  });

  it('returns merchandise store info', async () => {
    const res = await getChatResponse('I want to buy a jersey');
    expect(res).toMatch(/merch|Merchandise|store/i);
  });
});

describe('Chatbot Engine — Info Queries', () => {
  it('returns wait time info', async () => {
    const res = await getChatResponse('what are the current wait times');
    expect(res).toMatch(/wait|queue|min/i);
  });

  it('returns crowd status info', async () => {
    const res = await getChatResponse('how crowded is the stadium');
    expect(res).toMatch(/crowd|density|status/i);
  });

  it('returns event schedule info', async () => {
    const res = await getChatResponse('what is the schedule today');
    expect(res).toMatch(/schedule|event|match|time/i);
  });

  it('returns tips info', async () => {
    const res = await getChatResponse('give me some tips');
    expect(res).toMatch(/tip|recommend|advice/i);
  });
});

describe('Chatbot Engine — Fallback Behavior', () => {
  it('returns a string for completely unknown queries without crashing', async () => {
    const res = await getChatResponse('what is the meaning of life');
    expect(typeof res).toBe('string');
    expect(res.length).toBeGreaterThan(5);
  });

  it('handles empty string gracefully', async () => {
    const res = await getChatResponse('');
    expect(typeof res).toBe('string');
  });

  it('handles null userName gracefully', async () => {
    const res = await getChatResponse('hi', null);
    expect(typeof res).toBe('string');
  });

  it('handles null venue gracefully', async () => {
    const res = await getChatResponse('weather', null, null);
    expect(typeof res).toBe('string');
  });

  it('handles venue object for weather query', async () => {
    const venue = { name: 'Test Arena', city: 'Mumbai', lat: 19.0, lng: 72.8 };
    const res = await getChatResponse('what is the weather like', null, venue);
    expect(typeof res).toBe('string');
    expect(res.length).toBeGreaterThan(10);
  });
});

describe('Chatbot Engine — Quick Actions', () => {
  it('should export QUICK_ACTIONS array with items', () => {
    expect(Array.isArray(QUICK_ACTIONS)).toBe(true);
    expect(QUICK_ACTIONS.length).toBeGreaterThan(0);
  });

  it('each quick action has a label and query', () => {
    QUICK_ACTIONS.forEach(action => {
      expect(action).toHaveProperty('label');
      expect(action).toHaveProperty('query');
      expect(typeof action.label).toBe('string');
      expect(typeof action.query).toBe('string');
    });
  });

  it('restroom quick action is present', () => {
    const restroom = QUICK_ACTIONS.find(a => a.label.toLowerCase().includes('restroom'));
    expect(restroom).toBeDefined();
  });
});
