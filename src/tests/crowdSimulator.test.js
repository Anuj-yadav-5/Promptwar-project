import { describe, it, expect } from 'vitest';
import {
  generateZoneData,
  generateQueueData,
  generateFlowHistory,
  getActivityFeed,
  getPredictions,
  getCurrentPhase,
  STADIUM_ZONES,
  QUEUE_POINTS,
} from '../services/crowdSimulator';

describe('Crowd Simulator — Zone Data', () => {
  it('generateZoneData returns an array', () => {
    const zones = generateZoneData();
    expect(Array.isArray(zones)).toBe(true);
  });

  it('returns same number of zones as STADIUM_ZONES', () => {
    const zones = generateZoneData();
    expect(zones.length).toBe(STADIUM_ZONES.length);
  });

  it('each zone has required fields', () => {
    const zones = generateZoneData();
    zones.forEach(zone => {
      expect(zone).toHaveProperty('id');
      expect(zone).toHaveProperty('name');
      expect(zone).toHaveProperty('currentCount');
      expect(zone).toHaveProperty('occupancy');
      expect(zone).toHaveProperty('density');
      expect(zone).toHaveProperty('status');
      expect(zone).toHaveProperty('trend');
      expect(zone).toHaveProperty('lastUpdated');
    });
  });

  it('zone status is always a valid enum value', () => {
    const validStatuses = ['low', 'moderate', 'high', 'critical'];
    const zones = generateZoneData();
    zones.forEach(zone => {
      expect(validStatuses).toContain(zone.status);
    });
  });

  it('zone occupancy is between 0 and 100', () => {
    const zones = generateZoneData();
    zones.forEach(zone => {
      expect(zone.occupancy).toBeGreaterThanOrEqual(0);
      expect(zone.occupancy).toBeLessThanOrEqual(100);
    });
  });

  it('zone density is between 0 and 1', () => {
    const zones = generateZoneData();
    zones.forEach(zone => {
      expect(zone.density).toBeGreaterThanOrEqual(0);
      expect(zone.density).toBeLessThanOrEqual(1);
    });
  });

  it('currentCount does not exceed zone capacity', () => {
    const zones = generateZoneData();
    zones.forEach(zone => {
      expect(zone.currentCount).toBeLessThanOrEqual(zone.capacity);
      expect(zone.currentCount).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Crowd Simulator — Queue Data', () => {
  it('generateQueueData returns an array', () => {
    const queues = generateQueueData();
    expect(Array.isArray(queues)).toBe(true);
  });

  it('returns same number of queues as QUEUE_POINTS', () => {
    const queues = generateQueueData();
    expect(queues.length).toBe(QUEUE_POINTS.length);
  });

  it('each queue has required fields', () => {
    const queues = generateQueueData();
    queues.forEach(q => {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('name');
      expect(q).toHaveProperty('currentWait');
      expect(q).toHaveProperty('queueLength');
      expect(q).toHaveProperty('trend');
    });
  });

  it('currentWait is always at least 1', () => {
    const queues = generateQueueData();
    queues.forEach(q => {
      expect(q.currentWait).toBeGreaterThanOrEqual(1);
    });
  });

  it('queue trend is a valid value', () => {
    const queues = generateQueueData();
    queues.forEach(q => {
      expect(['increasing', 'decreasing']).toContain(q.trend);
    });
  });
});

describe('Crowd Simulator — Flow History', () => {
  it('generates correct number of data points', () => {
    const history = generateFlowHistory(10);
    expect(history.length).toBe(10);
  });

  it('each point has time, totalCrowd, gateFlow, avgWait, incidents', () => {
    const history = generateFlowHistory(5);
    history.forEach(point => {
      expect(point).toHaveProperty('time');
      expect(point).toHaveProperty('totalCrowd');
      expect(point).toHaveProperty('gateFlow');
      expect(point).toHaveProperty('avgWait');
      expect(point).toHaveProperty('incidents');
    });
  });

  it('avgWait is a positive number', () => {
    const history = generateFlowHistory(5);
    history.forEach(point => {
      expect(point.avgWait).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Crowd Simulator — Activity & Predictions', () => {
  it('getActivityFeed returns an array of activities', () => {
    const feed = getActivityFeed();
    expect(Array.isArray(feed)).toBe(true);
    expect(feed.length).toBeGreaterThan(0);
  });

  it('each activity has message, severity, and time', () => {
    const feed = getActivityFeed();
    feed.forEach(item => {
      expect(item).toHaveProperty('message');
      expect(item).toHaveProperty('severity');
      expect(item).toHaveProperty('time');
    });
  });

  it('getPredictions returns array of predictions', () => {
    const preds = getPredictions();
    expect(Array.isArray(preds)).toBe(true);
    expect(preds.length).toBeGreaterThan(0);
  });

  it('each prediction has message, confidence, and type', () => {
    const preds = getPredictions();
    preds.forEach(p => {
      expect(p).toHaveProperty('message');
      expect(p).toHaveProperty('confidence');
      expect(p).toHaveProperty('type');
      expect(p.confidence).toBeGreaterThan(0);
      expect(p.confidence).toBeLessThanOrEqual(100);
    });
  });

  it('getCurrentPhase returns a non-empty string', () => {
    const phase = getCurrentPhase();
    expect(typeof phase).toBe('string');
    expect(phase.length).toBeGreaterThan(0);
  });
});

describe('Crowd Simulator — Static Data', () => {
  it('STADIUM_ZONES has at least 10 entries', () => {
    expect(STADIUM_ZONES.length).toBeGreaterThanOrEqual(10);
  });

  it('each STADIUM_ZONE has lat/lng coordinates', () => {
    STADIUM_ZONES.forEach(zone => {
      expect(zone).toHaveProperty('lat');
      expect(zone).toHaveProperty('lng');
      expect(typeof zone.lat).toBe('number');
      expect(typeof zone.lng).toBe('number');
    });
  });

  it('QUEUE_POINTS has at least 5 entries', () => {
    expect(QUEUE_POINTS.length).toBeGreaterThanOrEqual(5);
  });

  it('each QUEUE_POINT has avgWait > 0', () => {
    QUEUE_POINTS.forEach(qp => {
      expect(qp.avgWait).toBeGreaterThan(0);
    });
  });
});
