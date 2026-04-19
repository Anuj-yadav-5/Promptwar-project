/**
 * @fileoverview Gemini Insights Service — Uses Google Gemini 2.5 Flash to generate
 * AI-powered operational insights across multiple app workflows:
 *  1. Crowd flow analysis on the Dashboard
 *  2. Alert priority recommendation in the Alert Center
 *  3. Queue optimization suggestions in the Queue System
 *
 * All calls fail silently — never blocking the UI.
 */

import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/** @type {GoogleGenAI|null} */
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * Calls Gemini with a prompt, returns the text response or a fallback.
 * @param {string} prompt
 * @param {string} fallback
 * @returns {Promise<string>}
 */
async function callGemini(prompt, fallback) {
  if (!ai) return fallback;
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return result.text?.trim() || fallback;
  } catch (err) {
    console.warn('[PulseArena] Gemini Insights error (non-critical):', err.message);
    return fallback;
  }
}

/**
 * Generates an AI-powered crowd flow analysis summary for the Dashboard.
 * @param {{ zones: Array, avgWaitTime: number, crowdFlowScore: number, activeAlerts: number }} crowdData
 * @param {string} venueName
 * @returns {Promise<string>} A 1-2 sentence operational insight.
 */
export async function generateCrowdInsight(crowdData, venueName = 'the venue') {
  const criticalZones = crowdData.zones.filter(z => z.status === 'critical').map(z => z.name);
  const highZones = crowdData.zones.filter(z => z.status === 'high').map(z => z.name);

  const prompt = `You are an AI operations analyst for ${venueName}, a large stadium.
Current data: Crowd flow score ${crowdData.crowdFlowScore}/100, avg wait time ${crowdData.avgWaitTime} min, ${crowdData.activeAlerts} active alerts.
Critical zones: ${criticalZones.length > 0 ? criticalZones.join(', ') : 'none'}.
High-density zones: ${highZones.length > 0 ? highZones.join(', ') : 'none'}.
Write ONE concise operational insight (max 25 words) — a practical recommendation for the operations team right now.`;

  return callGemini(prompt,
    crowdData.crowdFlowScore > 75
      ? 'Crowd flow is efficient. Monitor entry gates for peak arrival surges.'
      : 'High density detected. Recommend activating crowd dispersal protocols in congested zones.'
  );
}

/**
 * Generates an AI-powered action recommendation for a specific alert.
 * @param {{ title: string, message: string, priority: string, category: string, zone: string }} alert
 * @returns {Promise<string>} A short recommended action (1 sentence).
 */
export async function generateAlertRecommendation(alert) {
  const prompt = `Stadium alert — Priority: ${alert.priority}, Category: ${alert.category}, Zone: ${alert.zone}.
Alert: "${alert.title}: ${alert.message}"
Provide ONE specific, actionable recommendation (max 20 words) for the operations team to respond to this alert.`;

  return callGemini(prompt,
    alert.priority === 'critical'
      ? 'Deploy staff immediately and initiate emergency protocol for this zone.'
      : 'Monitor the situation closely and prepare response team on standby.'
  );
}

/**
 * Generates an AI-powered queue optimization tip for the Queue System.
 * @param {Array<{ name: string, currentWait: number, queueLength: number }>} queues
 * @returns {Promise<string>} A queue management tip (1 sentence).
 */
export async function generateQueueTip(queues) {
  if (!queues?.length) return 'All queues are operating normally.';

  const longest = [...queues].sort((a, b) => b.currentWait - a.currentWait)[0];
  const prompt = `Stadium queue management: The longest queue is "${longest.name}" with ${longest.currentWait} min wait and ${longest.queueLength} people.
Write ONE practical tip (max 20 words) to help reduce wait time at this queue point.`;

  return callGemini(prompt,
    `Open additional lanes at ${longest.name} to reduce the ${longest.currentWait}-minute wait time.`
  );
}

/**
 * Service 10: Google Translate API (via Gemini)
 * Translates an alert message into a target language.
 * @param {string} text 
 * @param {string} targetLanguage 
 * @returns {Promise<string>}
 */
export async function translateText(text, targetLanguage = 'Spanish') {
  const prompt = `Translate the following stadium alert into ${targetLanguage}. Return ONLY the translated text without quotes or explanations.\n\nText: "${text}"`;
  return callGemini(prompt, `[Translation currently unavailable]`);
}
