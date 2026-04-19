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

function findBestResponse(input, userName) {
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
  if (/restroom|bathroom|toilet|washroom|loo/i.test(lower)) return KNOWLEDGE_BASE.directions.restroom;
  if (/food|eat|hungry|burger|pizza|biryani|snack/i.test(lower)) return KNOWLEDGE_BASE.directions.food;
  if (/exit|leave|go out|way out|gate/i.test(lower)) return KNOWLEDGE_BASE.directions.exit;
  if (/park|car|vehicle/i.test(lower)) return KNOWLEDGE_BASE.directions.parking;
  if (/medical|doctor|nurse|first.?aid|emergency|help/i.test(lower)) return KNOWLEDGE_BASE.directions.medical;
  if (/vip|lounge|premium|exclusive/i.test(lower)) return KNOWLEDGE_BASE.directions.vip;
  if (/merch|shop|store|buy|souvenir|jersey/i.test(lower)) return KNOWLEDGE_BASE.directions.merchandise;

  // Check info queries
  if (/wait|queue|line|how long/i.test(lower)) return KNOWLEDGE_BASE.waitTimes;
  if (/crowd|busy|density|packed|full|empty|capacity/i.test(lower)) return KNOWLEDGE_BASE.crowdStatus;
  if (/weather|temp|rain|sun|hot|cold/i.test(lower)) return KNOWLEDGE_BASE.weather;
  if (/schedule|event|time|program|match|game|start|when/i.test(lower)) return KNOWLEDGE_BASE.events;
  if (/tip|advice|suggest|recommend/i.test(lower)) return KNOWLEDGE_BASE.tips;

  // Fallback
  return KNOWLEDGE_BASE.fallback[Math.floor(Math.random() * KNOWLEDGE_BASE.fallback.length)];
}

export function getChatResponse(userMessage, userName = null) {
  return new Promise((resolve) => {
    // Simulate AI thinking time
    const delay = 500 + Math.random() * 1000;
    setTimeout(() => {
      resolve(findBestResponse(userMessage, userName));
    }, delay);
  });
}

export { QUICK_ACTIONS };
