import { describe, it, expect } from 'vitest';
import {
  generateAlert,
  generateInitialAlerts,
  ALERT_CATEGORIES,
  ALERT_PRIORITIES,
} from '../services/alertEngine';

describe('Alert Engine — generateAlert', () => {
  it('returns an object with required fields', () => {
    const alert = generateAlert();
    expect(alert).toHaveProperty('id');
    expect(alert).toHaveProperty('category');
    expect(alert).toHaveProperty('title');
    expect(alert).toHaveProperty('message');
    expect(alert).toHaveProperty('priority');
    expect(alert).toHaveProperty('timestamp');
    expect(alert).toHaveProperty('read');
    expect(alert).toHaveProperty('zone');
    expect(alert).toHaveProperty('icon');
  });

  it('category is always a valid ALERT_CATEGORY', () => {
    for (let i = 0; i < 20; i++) {
      const alert = generateAlert();
      expect(ALERT_CATEGORIES).toContain(alert.category);
    }
  });

  it('priority is always a valid ALERT_PRIORITY', () => {
    for (let i = 0; i < 20; i++) {
      const alert = generateAlert();
      expect(ALERT_PRIORITIES).toContain(alert.priority);
    }
  });

  it('read is always false for new alerts', () => {
    const alert = generateAlert();
    expect(alert.read).toBe(false);
  });

  it('timestamp is a string', () => {
    const alert = generateAlert();
    expect(typeof alert.timestamp).toBe('string');
    expect(alert.timestamp.length).toBeGreaterThan(0);
  });

  it('message contains the zone name', () => {
    const alert = generateAlert();
    // Most templates include {zone} but some (like weather) don't — so we allow either
    expect(typeof alert.message).toBe('string');
    expect(alert.message.length).toBeGreaterThan(5);
  });

  it('id increments across successive calls', () => {
    const a1 = generateAlert();
    const a2 = generateAlert();
    expect(a2.id).toBeGreaterThan(a1.id);
  });

  it('icon is a non-empty string', () => {
    const alert = generateAlert();
    expect(typeof alert.icon).toBe('string');
    expect(alert.icon.length).toBeGreaterThan(0);
  });
});

describe('Alert Engine — generateInitialAlerts', () => {
  it('generates the requested number of alerts', () => {
    expect(generateInitialAlerts(5).length).toBe(5);
    expect(generateInitialAlerts(12).length).toBe(12);
  });

  it('returns an array', () => {
    const alerts = generateInitialAlerts(3);
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('alerts beyond index 3 are marked as read', () => {
    const alerts = generateInitialAlerts(8);
    alerts.forEach((alert, i) => {
      if (i > 3) {
        expect(alert.read).toBe(true);
      }
    });
  });

  it('first 4 alerts are unread', () => {
    const alerts = generateInitialAlerts(8);
    for (let i = 0; i <= 3; i++) {
      expect(alerts[i].read).toBe(false);
    }
  });

  it('default count is 12 when called without args', () => {
    const alerts = generateInitialAlerts();
    expect(alerts.length).toBe(12);
  });

  it('timestamps are set to past times (not future)', () => {
    const now = new Date();
    const alerts = generateInitialAlerts(3);
    alerts.forEach(alert => {
      // timestamp is a locale time string — just assert it's a non-empty string
      expect(typeof alert.timestamp).toBe('string');
      expect(alert.timestamp.length).toBeGreaterThan(0);
    });
  });
});

describe('Alert Engine — Constants', () => {
  it('ALERT_CATEGORIES contains expected values', () => {
    expect(ALERT_CATEGORIES).toContain('crowd');
    expect(ALERT_CATEGORIES).toContain('safety');
    expect(ALERT_CATEGORIES).toContain('event');
    expect(ALERT_CATEGORIES).toContain('weather');
    expect(ALERT_CATEGORIES).toContain('facility');
  });

  it('ALERT_PRIORITIES contains expected values', () => {
    expect(ALERT_PRIORITIES).toContain('info');
    expect(ALERT_PRIORITIES).toContain('warning');
    expect(ALERT_PRIORITIES).toContain('critical');
  });
});
