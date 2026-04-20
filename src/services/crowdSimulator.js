// Crowd Simulator Service — Generates realistic crowd movement data for stadium zones
const STADIUM_ZONES = [
  { id: 'gate-a', name: 'Gate A (North)', type: 'gate', capacity: 5000, lat: 23.0930, lng: 72.5970 },
  { id: 'gate-b', name: 'Gate B (East)', type: 'gate', capacity: 5000, lat: 23.0920, lng: 72.5985 },
  { id: 'gate-c', name: 'Gate C (South)', type: 'gate', capacity: 5000, lat: 23.0905, lng: 72.5970 },
  { id: 'gate-d', name: 'Gate D (West)', type: 'gate', capacity: 5000, lat: 23.0920, lng: 72.5955 },
  { id: 'stand-north', name: 'North Stand', type: 'stand', capacity: 20000, lat: 23.0932, lng: 72.5970 },
  { id: 'stand-east', name: 'East Stand', type: 'stand', capacity: 15000, lat: 23.0920, lng: 72.5988 },
  { id: 'stand-south', name: 'South Stand', type: 'stand', capacity: 20000, lat: 23.0908, lng: 72.5970 },
  { id: 'stand-west', name: 'West Stand', type: 'stand', capacity: 15000, lat: 23.0920, lng: 72.5952 },
  { id: 'concourse-n', name: 'North Concourse', type: 'concourse', capacity: 3000, lat: 23.0935, lng: 72.5970 },
  { id: 'concourse-s', name: 'South Concourse', type: 'concourse', capacity: 3000, lat: 23.0903, lng: 72.5970 },
  { id: 'food-court-1', name: 'Food Court Alpha', type: 'food', capacity: 800, lat: 23.0928, lng: 72.5960 },
  { id: 'food-court-2', name: 'Food Court Beta', type: 'food', capacity: 800, lat: 23.0912, lng: 72.5980 },
  { id: 'restroom-n', name: 'Restrooms North', type: 'restroom', capacity: 200, lat: 23.0933, lng: 72.5963 },
  { id: 'restroom-s', name: 'Restrooms South', type: 'restroom', capacity: 200, lat: 23.0907, lng: 72.5977 },
  { id: 'merch-store', name: 'Merchandise Store', type: 'merchandise', capacity: 500, lat: 23.0925, lng: 72.5958 },
  { id: 'medical', name: 'Medical Center', type: 'medical', capacity: 100, lat: 23.0915, lng: 72.5955 },
  { id: 'vip-lounge', name: 'VIP Lounge', type: 'vip', capacity: 300, lat: 23.0917, lng: 72.5950 },
  { id: 'parking-a', name: 'Parking Zone A', type: 'parking', capacity: 2000, lat: 23.0940, lng: 72.5960 },
];

const QUEUE_POINTS = [
  { id: 'q-food-1', name: 'Burger Station', category: 'food', zoneId: 'food-court-1', avgWait: 8, lat: 23.0929, lng: 72.5961 },
  { id: 'q-food-2', name: 'Pizza Corner', category: 'food', zoneId: 'food-court-1', avgWait: 12, lat: 23.0927, lng: 72.5959 },
  { id: 'q-food-3', name: 'Biryani Express', category: 'food', zoneId: 'food-court-2', avgWait: 15, lat: 23.0913, lng: 72.5981 },
  { id: 'q-drink-1', name: 'Drinks & Shakes', category: 'drinks', zoneId: 'food-court-1', avgWait: 5, lat: 23.0928, lng: 72.5962 },
  { id: 'q-drink-2', name: 'Chai & Coffee Bar', category: 'drinks', zoneId: 'food-court-2', avgWait: 7, lat: 23.0911, lng: 72.5979 },
  { id: 'q-restroom-1', name: 'North Restroom', category: 'restroom', zoneId: 'restroom-n', avgWait: 4, lat: 23.0933, lng: 72.5963 },
  { id: 'q-restroom-2', name: 'South Restroom', category: 'restroom', zoneId: 'restroom-s', avgWait: 6, lat: 23.0907, lng: 72.5977 },
  { id: 'q-merch-1', name: 'Official Merch Store', category: 'merchandise', zoneId: 'merch-store', avgWait: 10, lat: 23.0925, lng: 72.5958 },
  { id: 'q-entry-a', name: 'Gate A Entry', category: 'entry', zoneId: 'gate-a', avgWait: 3, lat: 23.0930, lng: 72.5970 },
  { id: 'q-entry-c', name: 'Gate C Entry', category: 'entry', zoneId: 'gate-c', avgWait: 5, lat: 23.0905, lng: 72.5970 },
];
export const DYNAMIC_ZONES = [...STADIUM_ZONES];
export const DYNAMIC_QUEUES = [...QUEUE_POINTS];

// Simulated event phases that affect crowd distribution
const EVENT_PHASES = [
  { name: 'Pre-Event', gateMultiplier: 1.5, standMultiplier: 0.3, concourseMultiplier: 1.2, foodMultiplier: 0.8 },
  { name: 'Event Active', gateMultiplier: 0.2, standMultiplier: 1.0, concourseMultiplier: 0.5, foodMultiplier: 0.4 },
  { name: 'Half-Time', gateMultiplier: 0.3, standMultiplier: 0.5, concourseMultiplier: 1.5, foodMultiplier: 1.8 },
  { name: 'Post-Event', gateMultiplier: 1.8, standMultiplier: 0.4, concourseMultiplier: 1.3, foodMultiplier: 0.6 },
];

let currentPhaseIndex = 1; // Start with Event Active
let tickCount = 0;

function getPhase() {
  return EVENT_PHASES[currentPhaseIndex];
}

function advancePhase() {
  currentPhaseIndex = (currentPhaseIndex + 1) % EVENT_PHASES.length;
}

function getMultiplier(type) {
  const phase = getPhase();
  switch (type) {
    case 'gate': return phase.gateMultiplier;
    case 'stand': return phase.standMultiplier;
    case 'concourse': return phase.concourseMultiplier;
    case 'food': case 'drinks': return phase.foodMultiplier;
    default: return 0.6;
  }
}

function randomFluctuation(base, variance = 0.15) {
  return base * (1 + (Math.random() - 0.5) * 2 * variance);
}

const BASE_TOTAL_CAPACITY = STADIUM_ZONES.reduce((acc, z) => acc + z.capacity, 0);

// Keep track of current occupancy so it doesn't jump randomly every tick
let zoneStates = {};

/**
 * Generates real-time crowd density data for all stadium zones.
 * Applies event phase multipliers and random fluctuations.
 * @param {number} venueCapacity - The total capacity of the active venue.
 * @returns {Array<Object>} Array of zone objects with occupancy, density, status, and trend.
 */
export function generateZoneData(venueCapacity = BASE_TOTAL_CAPACITY) {
  tickCount++;
  // Switch phase every ~40 ticks (~2 minutes at 3s intervals)
  if (tickCount % 40 === 0) {
    advancePhase();
  }

  const capacityScale = venueCapacity / BASE_TOTAL_CAPACITY;

  return DYNAMIC_ZONES.map(zone => {
    const multiplier = getMultiplier(zone.type);
    
    // Smooth random walk
    if (!zoneStates[zone.id]) {
      const baseOccupancy = 0.4 + Math.random() * 0.3;
      zoneStates[zone.id] = { occupancy: Math.min(1, baseOccupancy * multiplier) };
    }
    
    let currentOcc = zoneStates[zone.id].occupancy;
    const targetOcc = Math.min(1, (0.4 + Math.random() * 0.3) * multiplier);
    // Drift max 0.5% per tick towards target
    const drift = (targetOcc - currentOcc) * 0.05 + ((Math.random() - 0.5) * 0.005);
    currentOcc = Math.max(0, Math.min(1, currentOcc + drift));
    zoneStates[zone.id].occupancy = currentOcc;

    const scaledCapacity = Math.round(zone.capacity * capacityScale);
    const currentCount = Math.floor(scaledCapacity * currentOcc);
    const density = currentOcc;

    let status;
    if (density < 0.4) status = 'low';
    else if (density < 0.65) status = 'moderate';
    else if (density < 0.85) status = 'high';
    else status = 'critical';

    const trend = drift > 0 ? 'up' : 'down';

    return {
      ...zone,
      currentCount,
      occupancy: Math.round(currentOcc * 100),
      density,
      status,
      trend,
      lastUpdated: new Date().toLocaleTimeString(),
    };
  });
}

/**
 * Generates real-time queue wait time data for all queue points.
 * @returns {Array<Object>} Array of queue objects with currentWait, queueLength, and trend.
 */
export function generateQueueData() {
  return DYNAMIC_QUEUES.map(q => {
    const multiplier = getMultiplier(q.category);
    const waitVariance = randomFluctuation(q.avgWait * multiplier, 0.3);
    const currentWait = Math.max(1, Math.round(waitVariance));
    const queueLength = Math.round(currentWait * (2 + Math.random() * 3));

    return {
      ...q,
      currentWait,
      queueLength,
      trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
      lastUpdated: new Date().toLocaleTimeString(),
    };
  });
}

/**
 * Generates historical crowd flow data over a number of time points.
 * @param {number} [points=20] - Number of historical data points to generate.
 * @returns {Array<Object>} Array of time-series crowd flow records.
 */
export function generateFlowHistory(points = 20) {
  const history = [];
  for (let i = 0; i < points; i++) {
    history.push({
      time: `${String(Math.floor(i * 0.5 + 14)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
      totalCrowd: Math.floor(40000 + Math.random() * 30000),
      gateFlow: Math.floor(500 + Math.random() * 2000),
      avgWait: Math.round(3 + Math.random() * 12),
      incidents: Math.floor(Math.random() * 3),
    });
  }
  return history;
}

export function getActivityFeed() {
  const activities = [
    { type: 'crowd', message: 'North Stand density reached 78% — monitoring closely', severity: 'warning', time: '2 min ago' },
    { type: 'queue', message: 'Biryani Express wait time dropped to 8 min', severity: 'info', time: '4 min ago' },
    { type: 'gate', message: 'Gate D opened — crowd redirected from Gate A', severity: 'success', time: '6 min ago' },
    { type: 'alert', message: 'Medical team dispatched to South Stand', severity: 'critical', time: '8 min ago' },
    { type: 'crowd', message: 'East Concourse flow rate normalized', severity: 'success', time: '10 min ago' },
    { type: 'queue', message: 'New food counter opened at Food Court Alpha', severity: 'info', time: '12 min ago' },
    { type: 'weather', message: 'Temperature: 32°C — hydration stations activated', severity: 'warning', time: '15 min ago' },
    { type: 'gate', message: 'VIP entrance fast-track enabled', severity: 'info', time: '18 min ago' },
    { type: 'prediction', message: 'AI predicts concourse surge in 12 minutes', severity: 'warning', time: '20 min ago' },
    { type: 'crowd', message: 'Parking Zone A at 90% capacity', severity: 'warning', time: '22 min ago' },
  ];
  return activities;
}

export function getPredictions() {
  return [
    { message: 'North Concourse expected to peak in 15 min', confidence: 87, type: 'crowd' },
    { message: 'Food Court Beta queue will clear in 8 min', confidence: 73, type: 'queue' },
    { message: 'Gate C exit surge predicted at half-time', confidence: 91, type: 'flow' },
    { message: 'Restrooms South wait time rising — recommend North', confidence: 68, type: 'redirect' },
  ];
}

/**
 * Returns the name of the currently active event phase.
 * @returns {string} Phase name, e.g. 'Pre-Event', 'Half-Time'.
 */
export function getCurrentPhase() {
  return EVENT_PHASES[currentPhaseIndex].name;
}

export { STADIUM_ZONES, QUEUE_POINTS };
