// Chatbot Engine Service — Context-aware AI assistant for venue queries

const KNOWLEDGE_BASE = {
  greetings: [
    "Hey there! 👋 Welcome to PulseArena AI. I'm your smart stadium assistant. How can I help you today?",
    "Hello! I'm your PulseArena AI assistant. I can help you with directions, wait times, crowd info, and more!",
    "Hi! 🏟️ Ready to make your stadium experience amazing. What do you need?"
  ],
  
  directions: {
    restroom: "🚻 The nearest restroom is **Restrooms North** — about a 2 min walk from the North Concourse. Current wait: ~4 minutes. Alternatively, **Restrooms South** has a 6 min wait but is less crowded right now.",
    food: "🍔 The closest food options are:\n\n1. **Food Court Alpha** (North side) — Burger Station (~8 min wait), Pizza Corner (~12 min)\n2. **Food Court Beta** (South side) — Biryani Express (~15 min wait)\n\nI'd recommend **Burger Station** right now — shortest wait!",
    exit: "🚪 The nearest exits are:\n\n- **Gate A** (North) — Currently moderate traffic\n- **Gate D** (West) — Low traffic, recommended!\n\nGate D will save you about 5 minutes compared to Gate A.",
    parking: "🅿️ **Parking Zone A** is located north of the stadium. Current occupancy is around 85%. I'd recommend using the **Gate A exit** for the fastest route to parking.",
    medical: "🏥 The **Medical Center** is located on the west side of the stadium, near Gate D. For emergencies, call the stadium helpline at **1800-VENUE-HELP**.",
    vip: "✨ The **VIP Lounge** is located at the center of the stadium, accessible from both North and South concourses. Please have your VIP pass ready for entry.",
    merchandise: "🛍️ The **Official Merchandise Store** is on the west side near Gate D. Current wait time is about 10 minutes. Pro tip: Visit during the event (not halftime) for shorter queues!"
  },

  waitTimes: "⏱️ Here are the current estimated wait times:\n\n| Location | Wait Time |\n|---|---|\n| Burger Station | ~8 min |\n| Pizza Corner | ~12 min |\n| Biryani Express | ~15 min |\n| Drinks & Shakes | ~5 min |\n| North Restroom | ~4 min |\n| South Restroom | ~6 min |\n| Merch Store | ~10 min |\n\n💡 **Tip**: Food Court Alpha has shorter wait times right now!",

  crowdStatus: "📊 Current crowd status across the stadium:\n\n- 🟢 **Low**: Gate D, Medical Center, VIP Lounge\n- 🟡 **Moderate**: North Stand, East Stand, Parking\n- 🟠 **High**: South Stand, Food Courts\n- 🔴 **Critical**: North Concourse (monitoring closely)\n\nI recommend avoiding the North Concourse for the next 10 minutes.",

  weather: "🌤️ Current conditions at the stadium:\n\n- **Temperature**: 32°C (feels like 35°C)\n- **Humidity**: 65%\n- **Wind**: 12 km/h NW\n- **UV Index**: High\n\n☀️ Don't forget sunscreen and stay hydrated! Free water stations are available at all concourses.",

  events: "📅 Today's Event Schedule:\n\n- **14:00** — Gates Open\n- **15:00** — Opening Ceremony\n- **15:30** — Match Begins (1st Half)\n- **16:15** — Half-Time Break (20 min)\n- **16:35** — 2nd Half Begins\n- **17:20** — Match Ends\n- **17:30** — Post-Match Celebrations\n- **18:00** — Stadium Exit Begins",

  tips: "💡 **Pro Tips for Today's Event**:\n\n1. 🚶 Use **Gate D** for entry/exit — it's the least crowded\n2. 🍕 Visit food courts during the match, not halftime\n3. 🚻 North restrooms have shorter wait times\n4. 📱 Keep this app open for real-time alerts\n5. 🅿️ Leave 15 min early to avoid parking rush\n6. 💧 Stay hydrated — free water at concourses",

  fallback: [
    "I'm not sure about that, but I can help you with directions, wait times, crowd info, schedules, and more! What would you like to know?",
    "Hmm, I don't have info on that specifically. Try asking about restrooms, food, exits, wait times, or crowd status!",
    "That's outside my expertise, but I'm great at stadium navigation! Ask me about directions, queues, or the event schedule."
  ]
};

const QUICK_ACTIONS = [
  { label: "🚻 Nearest restroom?", query: "restroom" },
  { label: "🍔 Where to eat?", query: "food" },
  { label: "⏱️ Wait times", query: "wait times" },
  { label: "📊 Crowd status", query: "crowd status" },
  { label: "🚪 Nearest exit?", query: "exit" },
  { label: "📅 Event schedule", query: "schedule" },
  { label: "💡 Tips", query: "tips" },
  { label: "🌤️ Weather", query: "weather" },
];
async function fetchRealWeather(venue) {
  if (!venue) return KNOWLEDGE_BASE.weather;

  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${venue.lat}&longitude=${venue.lng}&current_weather=true&timezone=auto`);
    if (!res.ok) throw new Error('API down');
    const data = await res.json();
    const w = data.current_weather;
    
    let condition = 'Clear ☀️';
    if (w.weathercode >= 1 && w.weathercode <= 3) condition = 'Partly Cloudy ⛅';
    if (w.weathercode >= 45 && w.weathercode <= 48) condition = 'Foggy 🌫️';
    if (w.weathercode >= 51 && w.weathercode <= 67) condition = 'Rain 🌧️';
    if (w.weathercode >= 71 && w.weathercode <= 82) condition = 'Snow 🌨️';
    if (w.weathercode >= 95) condition = 'Thunderstorms ⛈️';
    
    return `🌤️ **Live Weather at ${venue.name}** (${venue.city}):\n\n- **Condition**: ${condition}\n- **Temperature**: ${w.temperature}°C\n- **Wind**: ${w.windspeed} km/h\n\n💧 Remember to stay hydrated! Free water stations are available at all concourses.`;
  } catch (error) {
    console.warn("Weather fetch failed, utilizing fallback:", error);
    return KNOWLEDGE_BASE.weather;
  }
}

async function findBestResponse(input, userName, activeVenue) {
  const lower = input.toLowerCase();
  
  const greetName = userName ? ` ${userName.split(' ')[0]}` : '';

  // Check greetings
  if (/^(hi|hello|hey|howdy|sup|yo|greetings)/i.test(lower)) {
    const customizedGreetings = [
      `Hey${greetName}! 👋 Welcome to PulseArena AI. I'm your smart stadium assistant. How can I help you today?`,
      `Hello${greetName}! I'm your PulseArena AI assistant. I can help you with directions, wait times, crowd info, and more!`,
      `Hi${greetName}! 🏟️ Ready to make your stadium experience amazing. What do you need?`
    ];
    return customizedGreetings[Math.floor(Math.random() * customizedGreetings.length)];
  }

  // Check directions
  if (/\b(restroom|bathroom|toilet|washroom|loo)\b/i.test(lower)) return KNOWLEDGE_BASE.directions.restroom;
  if (/\b(food|eat|eating|hungry|burger|pizza|biryani|snack)\b/i.test(lower)) return KNOWLEDGE_BASE.directions.food;
  if (/\b(exit|leave|go out|way out|gate)\b/i.test(lower)) return KNOWLEDGE_BASE.directions.exit;
  if (/\b(park|parking|car|vehicle)\b/i.test(lower)) return KNOWLEDGE_BASE.directions.parking;
  if (/\b(medical|doctor|nurse|first.?aid|emergency|help)\b/i.test(lower)) return KNOWLEDGE_BASE.directions.medical;
  if (/\b(vip|lounge|premium|exclusive)\b/i.test(lower)) return KNOWLEDGE_BASE.directions.vip;
  if (/\b(merch|shop|store|buy|souvenir|jersey)\b/i.test(lower)) return KNOWLEDGE_BASE.directions.merchandise;

  // Check info queries
  if (/\b(wait|queue|line|how long)\b/i.test(lower)) return KNOWLEDGE_BASE.waitTimes;
  if (/\b(crowd|busy|density|packed|full|empty|capacity|status)\b/i.test(lower)) return KNOWLEDGE_BASE.crowdStatus;
  if (/\b(weather|temp|temperature|rain|sun|hot|cold|forecast)\b/i.test(lower)) {
    return await fetchRealWeather(activeVenue);
  }
  if (/\b(schedule|event|time|program|match|game|start|when)\b/i.test(lower)) return KNOWLEDGE_BASE.events;
  if (/\b(tip|tips|advice|suggest|recommend)\b/i.test(lower)) return KNOWLEDGE_BASE.tips;

  // Fallback
  return KNOWLEDGE_BASE.fallback[Math.floor(Math.random() * KNOWLEDGE_BASE.fallback.length)];
}

export async function getChatResponse(userMessage, userName = null, activeVenue = null) {
  const response = await findBestResponse(userMessage, userName, activeVenue);
  
  // Simulate AI thinking time
  return new Promise((resolve) => {
    const delay = 300 + Math.random() * 800;
    setTimeout(() => resolve(response), delay);
  });
}

export { QUICK_ACTIONS };
