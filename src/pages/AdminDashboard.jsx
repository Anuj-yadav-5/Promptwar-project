import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useCrowd } from '../context/CrowdContext';
import { Settings, ShieldAlert, Cpu, Users } from 'lucide-react';
import { DYNAMIC_ZONES } from '../services/crowdSimulator';

export default function AdminDashboard() {
  const { state, dispatch } = useCrowd();
  const [controlMode, setControlMode] = useState('ai'); // 'ai' or 'manual'
  const [overrides, setOverrides] = useState({});
  const [saving, setSaving] = useState(false);

  // Load manual overrides from Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "stadium_control"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setControlMode(data.mode || 'ai');
        setOverrides(data.zoneOverrides || {});
        // Dispatch to context so map respects it (we'll update context next)
        dispatch({ type: 'SET_ADMIN_OVERRIDES', payload: data });
      }
    });
    return () => unsub();
  }, [dispatch]);

  const updateMode = async (mode) => {
    setControlMode(mode);
    await setDoc(doc(db, "settings", "stadium_control"), { mode, zoneOverrides: overrides }, { merge: true });
  };

  const updateZoneDensity = async (zoneId, density) => {
    const newOverrides = { ...overrides, [zoneId]: parseFloat(density) };
    setOverrides(newOverrides);
    await setDoc(doc(db, "settings", "stadium_control"), { zoneOverrides: newOverrides }, { merge: true });
  };

  const triggerManualAlert = async () => {
    const alertTitle = prompt("Enter Alert Title (e.g. Security Breach):");
    if (!alertTitle) return;
    
    // Create an override alert in Firebase (to broadcast to all sessions)
    const alertPayload = {
      id: Date.now().toString(),
      title: alertTitle,
      message: "SYSTEM OVERRIDE: Admin broadcast sent successfully.",
      priority: "critical",
      timestamp: Date.now()
    };
    
    await setDoc(doc(db, "settings", "broadcast_alert"), alertPayload);
  };

  return (
    <div className="space-y-6 page-enter max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white uppercase text-neon-orange drop-shadow-[0_0_10px_rgba(255,140,0,0.5)]">System Override Console</h1>
          <p className="text-slate-400 mt-2">Manual Data Management and AI Simulation Control.</p>
        </div>
        <div className="glass-panel p-2 flex gap-2">
          <button 
            onClick={() => updateMode('ai')}
            className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-all ${controlMode === 'ai' ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Cpu size={16} /> AI Simulated
          </button>
          <button 
            onClick={() => updateMode('manual')}
            className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-all ${controlMode === 'manual' ? 'bg-neon-orange/20 text-neon-orange border border-neon-orange/50' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Settings size={16} /> Manual Control
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 glass-panel p-6">
          <div className="flex justify-between border-b border-white/10 pb-4 mb-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2"><Users size={18} className="text-neon-cyan"/> Zone Crowd Adjustments</h3>
            {controlMode === 'ai' && <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded">Switch to Manual mode to edit</span>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {DYNAMIC_ZONES.map(z => {
              // Current active value (either from AI state or manual override)
              const aiZoneState = state.zones.find(sz => sz.id === z.id);
              const currentDensity = (overrides[z.id] !== undefined && controlMode === 'manual') 
                ? overrides[z.id] 
                : (aiZoneState ? aiZoneState.density : 0);

              return (
                <div key={z.id} className="bg-navy-800 p-4 rounded-lg border border-slate-700">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-slate-200">{z.name}</span>
                    <span className="text-neon-cyan font-mono">{Math.round(currentDensity * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.05"
                    value={currentDensity}
                    disabled={controlMode === 'ai'}
                    onChange={(e) => updateZoneDensity(z.id, e.target.value)}
                    className="w-full accent-neon-cyan bg-slate-700 rounded-lg appearance-none h-2 opacity-70 disabled:opacity-30 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 border-neon-red/30 bg-neon-red/5">
            <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2"><ShieldAlert size={18} className="text-neon-red"/> Emergency Broadcast</h3>
            <p className="text-sm text-slate-400 mb-6">Instantly push a critical alert to all dashboard users connected to Firebase.</p>
            <button 
              onClick={triggerManualAlert}
              className="w-full bg-neon-red/20 text-neon-red hover:bg-neon-red/30 border border-neon-red/50 py-3 rounded-lg font-bold transition-colors"
            >
              Trigger Core Alert
            </button>
          </div>

          <div className="glass-panel p-6">
            <h3 className="font-bold text-white mb-2">Database Status</h3>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Firebase Connection</span>
                <span className="flex items-center gap-1 text-neon-green"><span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span> Active</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Current Mode</span>
                <span className="text-white capitalize">{controlMode}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Total Active Overrides</span>
                <span className="text-neon-orange font-bold text-lg">{Object.keys(overrides).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
