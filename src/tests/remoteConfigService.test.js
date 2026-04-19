import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock firebase service app export
vi.mock('../services/firebase', () => ({ app: {} }));

// Mock firebase/remote-config module
vi.mock('firebase/remote-config', () => {
  const mockValue = (val) => ({
    asBoolean: () => Boolean(val),
    asNumber: () => Number(val),
    asString: () => String(val),
  });

  return {
    getRemoteConfig: vi.fn(() => ({
      settings: { minimumFetchIntervalMillis: 3600000 },
      defaultConfig: {},
    })),
    fetchAndActivate: vi.fn().mockResolvedValue(true),
    getValue: vi.fn((rc, key) => {
      const defaults = {
        ai_features_enabled: mockValue(true),
        max_queue_size: mockValue(50),
        venue_mode: mockValue('standard'),
        alert_threshold: mockValue(80),
      };
      return defaults[key] ?? mockValue(null);
    }),
  };
});

import {
  syncRemoteConfig,
  getRemoteBool,
  getRemoteNumber,
  getRemoteString,
  getAllRemoteConfig,
} from '../services/remoteConfigService';

describe('remoteConfigService — syncRemoteConfig', () => {
  it('returns a boolean result (activated or cached)', async () => {
    const result = await syncRemoteConfig();
    expect(typeof result).toBe('boolean');
  });
});

describe('remoteConfigService — getRemoteBool', () => {
  it('returns true for ai_features_enabled', () => {
    const result = getRemoteBool('ai_features_enabled');
    expect(result).toBe(true);
  });
});

describe('remoteConfigService — getRemoteNumber', () => {
  it('returns 50 for max_queue_size', () => {
    const result = getRemoteNumber('max_queue_size');
    expect(result).toBe(50);
  });

  it('returns 80 for alert_threshold', () => {
    const result = getRemoteNumber('alert_threshold');
    expect(result).toBe(80);
  });
});

describe('remoteConfigService — getRemoteString', () => {
  it('returns "standard" for venue_mode', () => {
    const result = getRemoteString('venue_mode');
    expect(result).toBe('standard');
  });
});

describe('remoteConfigService — getAllRemoteConfig', () => {
  it('returns all 4 config values as a typed object', async () => {
    const config = await getAllRemoteConfig();
    expect(config).toHaveProperty('ai_features_enabled');
    expect(config).toHaveProperty('max_queue_size');
    expect(config).toHaveProperty('venue_mode');
    expect(config).toHaveProperty('alert_threshold');
  });

  it('ai_features_enabled is a boolean', async () => {
    const config = await getAllRemoteConfig();
    expect(typeof config.ai_features_enabled).toBe('boolean');
  });

  it('max_queue_size is a number', async () => {
    const config = await getAllRemoteConfig();
    expect(typeof config.max_queue_size).toBe('number');
  });

  it('venue_mode is a string', async () => {
    const config = await getAllRemoteConfig();
    expect(typeof config.venue_mode).toBe('string');
  });
});
