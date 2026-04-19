import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import { generateZoneData, generateQueueData, generateFlowHistory, getActivityFeed, getPredictions, getCurrentPhase } from '../services/crowdSimulator';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { generateInitialAlerts, generateAlert } from '../services/alertEngine';
import { VENUES } from '../constants/venues';

const CrowdContext = createContext();

const initialState = {
  zones: [],
  queues: [],
  flowHistory: [],
  activityFeed: [],
  predictions: [],
  alerts: [],
  currentPhase: 'Event Active',
  totalAttendance: 0,
  avgWaitTime: 0,
  activeAlerts: 0,
  crowdFlowScore: 0,
  userQueues: [],
  toasts: [],
  adminSettings: { mode: 'ai', zoneOverrides: {} },
  activeVenue: VENUES[0]
};

function crowdReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_CROWD_DATA': {
      const mode = state.adminSettings?.mode || 'ai';
      const overrides = state.adminSettings?.zoneOverrides || {};
      
      const processedZones = action.payload.zones.map(z => {
        if (mode === 'manual' && overrides[z.id] !== undefined) {
          const density = overrides[z.id];
          let status;
          if (density < 0.4) status = 'low';
          else if (density < 0.65) status = 'moderate';
          else if (density < 0.85) status = 'high';
          else status = 'critical';
          
          return { ...z, density, occupancy: Math.round(density*100), status };
        }
        return z;
      });

      return {
        ...state,
        zones: processedZones,
        queues: action.payload.queues,
        currentPhase: action.payload.currentPhase,
        totalAttendance: processedZones.reduce((sum, z) => sum + z.currentCount, 0),
        avgWaitTime: Math.round(action.payload.queues.reduce((sum, q) => sum + q.currentWait, 0) / action.payload.queues.length),
        crowdFlowScore: Math.round(100 - processedZones.filter(z => z.status === 'critical' || z.status === 'high').length * 8),
      };
    }
    case 'SET_ADMIN_OVERRIDES':
      return { ...state, adminSettings: action.payload };
    case 'SET_INITIAL_DATA':
      return { ...state, ...action.payload };
    case 'SET_VENUE':
      return { ...state, activeVenue: action.payload };
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [action.payload, ...state.alerts],
        activeAlerts: state.alerts.filter(a => !a.read).length + 1,
      };
    case 'MARK_ALERT_READ':
      return {
        ...state,
        alerts: state.alerts.map(a => a.id === action.payload ? { ...a, read: true } : a),
        activeAlerts: state.alerts.filter(a => !a.read && a.id !== action.payload).length,
      };
    case 'MARK_ALL_ALERTS_READ':
      return {
        ...state,
        alerts: state.alerts.map(a => ({ ...a, read: true })),
        activeAlerts: 0,
      };
    case 'JOIN_QUEUE':
      return {
        ...state,
        userQueues: [...state.userQueues, { ...action.payload, joinedAt: new Date(), position: Math.floor(Math.random() * 10) + 3 }],
      };
    case 'LEAVE_QUEUE':
      return {
        ...state,
        userQueues: state.userQueues.filter(q => q.id !== action.payload),
      };
    case 'UPDATE_USER_QUEUES':
      return {
        ...state,
        userQueues: state.userQueues.map(q => ({
          ...q,
          position: Math.max(0, q.position - 1),
        })).filter(q => q.position > 0),
      };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    default:
      return state;
  }
}

export function CrowdProvider({ children }) {
  const [state, dispatch] = useReducer(crowdReducer, initialState);
  const [isReady, setIsReady] = useState(false);

  // Initialize data
  useEffect(() => {
    // Generate initial dynamic frame based on mock locations
    const zones = generateZoneData();
    const queues = generateQueueData();
    const flowHistory = generateFlowHistory();
    const activityFeed = getActivityFeed();
    const predictions = getPredictions();
    const alerts = generateInitialAlerts();
    const currentPhase = getCurrentPhase();

    dispatch({
      type: 'SET_INITIAL_DATA',
      payload: {
        zones, queues, flowHistory, activityFeed, predictions, alerts, currentPhase,
        totalAttendance: zones.reduce((sum, z) => sum + z.currentCount, 0),
        avgWaitTime: Math.round(queues.reduce((sum, q) => sum + q.currentWait, 0) / queues.length),
        activeAlerts: alerts.filter(a => !a.read).length,
        crowdFlowScore: Math.round(100 - zones.filter(z => z.status === 'critical' || z.status === 'high').length * 8),
      },
    });
    setIsReady(true);
  }, []);

  const addToast = useCallback((toast) => {
    const toastId = Date.now();
    dispatch({ type: 'ADD_TOAST', payload: { id: toastId, ...toast } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: toastId }), 5000);
  }, []);

  // Real-time crowd simulation — stable interval, no dependency on state.alerts
  useEffect(() => {
    if (!isReady) return;
    const interval = setInterval(() => {
      const zones = generateZoneData();
      const queues = generateQueueData();
      const currentPhase = getCurrentPhase();
      dispatch({ type: 'UPDATE_CROWD_DATA', payload: { zones, queues, currentPhase } });
      dispatch({ type: 'UPDATE_USER_QUEUES' });

      // Random alert every ~45 seconds (5% chance per 3s tick)
      if (Math.random() < 0.05) {
        const alert = generateAlert();
        dispatch({ type: 'ADD_ALERT', payload: alert });
        if (alert.priority === 'critical' || alert.priority === 'warning') {
          const toastId = Date.now();
          dispatch({ type: 'ADD_TOAST', payload: { id: toastId, ...alert } });
          setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: toastId }), 5000);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isReady]); // ✅ Stable — only runs once when ready

  // Firebase listeners — mounted once, never torn down unnecessarily
  useEffect(() => {
    if (!isReady) return;

    const unsubBroadcast = onSnapshot(doc(db, 'settings', 'broadcast_alert'), (docSnap) => {
      if (docSnap.exists()) {
        const payload = docSnap.data();
        if (payload.timestamp > Date.now() - 5000) {
          dispatch({ type: 'ADD_ALERT', payload });
          const toastId = Date.now();
          dispatch({ type: 'ADD_TOAST', payload: { id: toastId, ...payload } });
          setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: toastId }), 5000);
        }
      }
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'stadium_control'), (docSnap) => {
      if (docSnap.exists()) {
        dispatch({ type: 'SET_ADMIN_OVERRIDES', payload: docSnap.data() });
      }
    });

    return () => {
      unsubBroadcast();
      unsubSettings();
    };
  }, [isReady]); // ✅ Stable — Firebase listeners live for the full session

  if (!isReady) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
        <p className="text-neon-cyan mt-6 font-display tracking-widest text-sm uppercase">Initializing System...</p>
      </div>
    );
  }

  return (
    <CrowdContext.Provider value={{ state, dispatch, addToast }}>
      {children}
    </CrowdContext.Provider>
  );
}

export function useCrowd() {
  const context = useContext(CrowdContext);
  if (!context) throw new Error('useCrowd must be used within CrowdProvider');
  return context;
}
