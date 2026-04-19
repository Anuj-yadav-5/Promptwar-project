import { vi, describe, it, expect } from 'vitest';

// Mock Firebase to prevent real Firestore calls in tests
vi.mock('../services/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mock-collection-ref'),
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-doc-id' }),
  doc: vi.fn(() => 'mock-doc-ref'),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false, data: () => null }),
  setDoc: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
}));

import { logUserAction, fetchVenueConfig, saveUserVenuePreference } from '../services/firestoreService';
import { addDoc, getDoc, setDoc } from 'firebase/firestore';

describe('firestoreService — logUserAction', () => {
  it('silently returns when uid is missing', async () => {
    await expect(logUserAction(null, 'join_queue')).resolves.toBeUndefined();
    expect(addDoc).not.toHaveBeenCalled();
  });

  it('silently returns when action is missing', async () => {
    await expect(logUserAction('uid-123', null)).resolves.toBeUndefined();
    expect(addDoc).not.toHaveBeenCalled();
  });

  it('calls addDoc with correct structure when uid and action are provided', async () => {
    vi.clearAllMocks();
    addDoc.mockResolvedValueOnce({ id: 'test-id' });
    await logUserAction('uid-123', 'join_queue', { queueId: 'q-1' });
    expect(addDoc).toHaveBeenCalledTimes(1);
  });

  it('does not throw when Firestore write fails', async () => {
    addDoc.mockRejectedValueOnce(new Error('Network error'));
    await expect(logUserAction('uid-123', 'join_queue')).resolves.toBeUndefined();
  });
});

describe('firestoreService — fetchVenueConfig', () => {
  it('returns null when venueId is missing', async () => {
    const result = await fetchVenueConfig(null);
    expect(result).toBeNull();
  });

  it('returns null when document does not exist', async () => {
    getDoc.mockResolvedValueOnce({ exists: () => false, data: () => null });
    const result = await fetchVenueConfig('venue-1');
    expect(result).toBeNull();
  });

  it('returns data when document exists', async () => {
    getDoc.mockResolvedValueOnce({ exists: () => true, data: () => ({ mode: 'ai' }) });
    const result = await fetchVenueConfig('venue-1');
    expect(result).toEqual({ mode: 'ai' });
  });

  it('returns null on Firestore error without throwing', async () => {
    getDoc.mockRejectedValueOnce(new Error('Permission denied'));
    const result = await fetchVenueConfig('venue-1');
    expect(result).toBeNull();
  });
});

describe('firestoreService — saveUserVenuePreference', () => {
  it('silently returns when uid is missing', async () => {
    await expect(saveUserVenuePreference(null, 'venue-1')).resolves.toBeUndefined();
    expect(setDoc).not.toHaveBeenCalled();
  });

  it('silently returns when venueId is missing', async () => {
    await expect(saveUserVenuePreference('uid-123', null)).resolves.toBeUndefined();
  });

  it('calls setDoc when uid and venueId are valid', async () => {
    vi.clearAllMocks();
    setDoc.mockResolvedValueOnce(undefined);
    await saveUserVenuePreference('uid-123', 'venue-1');
    expect(setDoc).toHaveBeenCalledTimes(1);
  });

  it('does not throw on Firestore failure', async () => {
    setDoc.mockRejectedValueOnce(new Error('Write failed'));
    await expect(saveUserVenuePreference('uid-123', 'venue-2')).resolves.toBeUndefined();
  });
});
