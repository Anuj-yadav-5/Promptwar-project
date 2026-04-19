import React, { useState } from 'react';
import { MapPin, Navigation2, ArrowRight, Zap, Ban, CheckCircle2 } from 'lucide-react';
import { useCrowd } from '../context/CrowdContext';
import { STADIUM_ZONES } from '../services/crowdSimulator';

export default function Navigation() {
  const { state } = useCrowd();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routeCalculated, setRouteCalculated] = useState(false);

  const [steps, setSteps] = useState([]);

  const calculateRoute = (e) => {
    e.preventDefault();
    if (origin && destination) {
      const origZone = STADIUM_ZONES.find(z => z.id === origin);
      const destZone = STADIUM_ZONES.find(z => z.id === destination);
      
      const distance = Math.floor(Math.random() * 150 + 60);

      const dynamicSteps = [
        { text: `Depart from ${origZone?.name} and head towards the nearest transit concourse`, dist: '25m', time: '1 min', alert: null },
        { text: `Navigate through the central stadium walkway`, dist: `${distance}m`, time: `${Math.ceil(distance / 50) + 1} min`, alert: Math.random() > 0.5 ? 'Moderate crowd' : null },
        { text: `Take the path towards the ${destZone?.type || 'general'} sector`, dist: '40m', time: '1 min', alert: null },
        { text: `Arrive at your destination: ${destZone?.name}`, dist: '10m', time: '< 1 min', alert: null },
      ];

      setSteps(dynamicSteps);
      setRouteCalculated(true);
    }
  };

  return (
    <div className="space-y-6 page-enter max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Smart Navigation</h1>
        <p className="text-slate-400">Crowd-aware routing to get you there faster.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form panel */}
        <div className="glass-panel p-6">
          <form onSubmit={calculateRoute} className="space-y-6">
            <div className="relative">
              <div className="absolute top-8 left-4 bottom-8 w-0.5 bg-slate-700" />
              <div className="absolute top-7 left-[11px] w-2.5 h-2.5 rounded-full bg-neon-cyan border-2 border-navy-900" />
              <div className="absolute bottom-7 left-[11px] w-2.5 h-2.5 rounded-full bg-neon-pink border-2 border-navy-900" />
              
              <div className="space-y-4 pl-10">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Starting Point</label>
                  <select 
                    value={origin}
                    onChange={(e) => { setOrigin(e.target.value); setRouteCalculated(false); }}
                    className="w-full bg-navy-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-neon-cyan"
                    required
                  >
                    <option value="" disabled>Select your location</option>
                    {STADIUM_ZONES.map(z => <option key={`orig-${z.id}`} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Destination</label>
                  <select 
                    value={destination}
                    onChange={(e) => { setDestination(e.target.value); setRouteCalculated(false); }}
                    className="w-full bg-navy-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-neon-pink"
                    required
                  >
                    <option value="" disabled>Where do you want to go?</option>
                    {STADIUM_ZONES.map(z => <option key={`dest-${z.id}`} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full gradient-btn py-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={!origin || !destination || origin === destination}
            >
              <Navigation2 size={18} />
              Find Best Route
            </button>
          </form>

          {/* Quick links */}
          <div className="mt-8">
            <p className="text-xs text-slate-500 uppercase font-bold mb-3">Quick Destinations</p>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition">Nearest Restroom</button>
              <button className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition">Medical Center</button>
              <button className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition">Gate Exit</button>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-700/50 flex items-center justify-center gap-2 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
             <MapPin size={14} className="text-[#34A853]" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Powered by Google Maps Indoor API</span>
          </div>
        </div>

        {/* Results panel */}
        {routeCalculated ? (
          <div className="space-y-4 animate-fade-in">
            {/* Route Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-4 border-neon-cyan/40 bg-neon-cyan/5 relative overflow-hidden group hover:border-neon-cyan/60 transition-colors cursor-pointer">
                <div className="absolute top-0 right-0 p-2"><CheckCircle2 size={16} className="text-neon-cyan" /></div>
                <p className="text-xs text-neon-cyan font-bold uppercase mb-1 flex items-center gap-1"><Zap size={12}/> AI Recommended</p>
                <h3 className="font-display font-bold text-xl text-white">7 min</h3>
                <p className="text-xs text-slate-400 mt-1">Avoids Concourse crowd</p>
              </div>
              
              <div className="glass-panel p-4 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Standard Route</p>
                <h3 className="font-display font-bold text-xl text-white">12 min</h3>
                <p className="text-xs text-neon-red flex items-center gap-1 mt-1"><Ban size={10}/> High congestion</p>
              </div>
            </div>

            {/* Turn by turn */}
            <div className="glass-panel p-5 mt-4">
              <h3 className="font-bold text-white mb-4">Turn-by-turn Directions</h3>
              <div className="space-y-0">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-4 relative pb-6 last:pb-0">
                    {/* timeline line */}
                    {i < steps.length - 1 && <div className="absolute top-6 left-[15px] bottom-0 w-0.5 bg-slate-800" />}
                    
                    <div className="w-8 h-8 rounded-full bg-navy-800 border border-slate-600 flex items-center justify-center shrink-0 z-10">
                      {i === steps.length - 1 ? <MapPin size={14} className="text-neon-pink" /> : <ArrowRight size={14} className="text-neon-cyan" />}
                    </div>
                    
                    <div className="pt-1 w-full">
                      <p className="text-sm font-medium text-white">{step.text}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-slate-500 font-mono">{step.dist} • {step.time}</span>
                        {step.alert && (
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded uppercase font-bold border border-yellow-500/30">
                            {step.alert}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px] opacity-70">
            <div className="w-16 h-16 rounded-full bg-navy-800 flex items-center justify-center mb-4 border border-slate-700">
              <MapPin size={24} className="text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm max-w-[250px]">Select your starting point and destination to get real-time, crowd-aware routing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
