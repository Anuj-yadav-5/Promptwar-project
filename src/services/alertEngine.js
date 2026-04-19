// Alert Engine Service — Generates and manages real-time alerts

let alertIdCounter = 100;

const ALERT_TEMPLATES = [
  { category: 'crowd', title: 'High Density Alert', template: '{zone} has reached {pct}% capacity', priority: 'warning', icon: '👥' },
  { category: 'crowd', title: 'Critical Overcrowding', template: '{zone} at critical capacity — immediate action required', priority: 'critical', icon: '🚨' },
  { category: 'safety', title: 'Emergency Response', template: 'Medical team dispatched to {zone}', priority: 'critical', icon: '🏥' },
  { category: 'safety', title: 'Security Alert', template: 'Security sweep completed in {zone}', priority: 'info', icon: '🛡️' },
  { category: 'event', title: 'Schedule Update', template: 'Half-time break starting in 5 minutes', priority: 'info', icon: '📋' },
  { category: 'event', title: 'Gate Operation', template: '{zone} has been opened for crowd redistribution', priority: 'info', icon: '🚪' },
  { category: 'weather', title: 'Weather Advisory', template: 'Temperature rising to 34°C — extra hydration stations active', priority: 'warning', icon: '🌡️' },
  { category: 'weather', title: 'Rain Expected', template: 'Rain expected in 30 min — cover areas being prepared', priority: 'warning', icon: '🌧️' },
  { category: 'facility', title: 'Facility Closure', template: '{zone} temporarily closed for maintenance', priority: 'warning', icon: '🔧' },
  { category: 'facility', title: 'New Counter Opened', template: 'Additional food counter opened at {zone}', priority: 'info', icon: '🍔' },
  { category: 'crowd', title: 'Flow Normalized', template: '{zone} crowd density has returned to normal levels', priority: 'info', icon: '✅' },
  { category: 'crowd', title: 'Crowd Surge Predicted', template: 'AI predicts crowd surge at {zone} in 10 minutes', priority: 'warning', icon: '📊' },
];

const ZONES = ['Gate A', 'Gate B', 'Gate C', 'Gate D', 'North Stand', 'South Stand', 'East Stand', 'West Stand',
  'North Concourse', 'South Concourse', 'Food Court Alpha', 'Food Court Beta', 'VIP Lounge'];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates a single random stadium alert from the ALERT_TEMPLATES list.
 * @returns {{ id: number, category: string, title: string, message: string, priority: string, icon: string, timestamp: string, read: boolean, zone: string }}
 */
export function generateAlert() {
  const template = pickRandom(ALERT_TEMPLATES);
  const zone = pickRandom(ZONES);
  const pct = Math.floor(75 + Math.random() * 25);

  return {
    id: alertIdCounter++,
    ...template,
    message: template.template.replace('{zone}', zone).replace('{pct}', pct),
    timestamp: new Date().toLocaleTimeString(),
    read: false,
    zone,
  };
}

/**
 * Generates an initial batch of alerts for seeding the alert feed on startup.
 * @param {number} [count=12] - Number of alerts to generate.
 * @returns {Array<Object>} Array of alert objects with staggered past timestamps.
 */
export function generateInitialAlerts(count = 12) {
  const alerts = [];
  const minutesAgo = [1, 3, 5, 8, 12, 15, 20, 25, 30, 35, 40, 45];
  
  for (let i = 0; i < count; i++) {
    const alert = generateAlert();
    const d = new Date();
    d.setMinutes(d.getMinutes() - (minutesAgo[i] || i * 5));
    alert.timestamp = d.toLocaleTimeString();
    alert.read = i > 3;
    alerts.push(alert);
  }
  
  return alerts;
}

export const ALERT_CATEGORIES = ['crowd', 'safety', 'event', 'weather', 'facility'];
export const ALERT_PRIORITIES = ['info', 'warning', 'critical'];
