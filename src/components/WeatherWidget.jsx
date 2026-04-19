import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Loader2, MapPin } from 'lucide-react';
import { useCrowd } from '../context/CrowdContext';

export default function WeatherWidget() {
  const { state } = useCrowd();
  const venue = state.activeVenue;
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchWeather() {
      if (!venue) return;
      setLoading(true);
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${venue.lat}&longitude=${venue.lng}&current_weather=true&hourly=relative_humidity_2m&timezone=auto`);
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        if (mounted) {
          const w = data.current_weather;
          // Open-meteo provides hourly humidity, grab the current hour's rough humidity or fallback to 60%
          const humidity = data.hourly?.relative_humidity_2m?.[new Date().getHours()] || 60; 
          
          let condition = 'Clear';
          let Icon = Sun;
          let color = 'text-yellow-400';
          
          if (w.weathercode >= 1 && w.weathercode <= 3) { condition = 'Partly Cloudy'; Icon = Cloud; color = 'text-slate-300'; }
          if (w.weathercode >= 45 && w.weathercode <= 48) { condition = 'Foggy'; Icon = Cloud; color = 'text-slate-400'; }
          if (w.weathercode >= 51 && w.weathercode <= 67) { condition = 'Rain'; Icon = CloudRain; color = 'text-neon-cyan'; }
          if (w.weathercode >= 71 && w.weathercode <= 82) { condition = 'Snow'; Icon = Cloud; color = 'text-white'; }
          if (w.weathercode >= 95) { condition = 'Thunderstorms'; Icon = CloudRain; color = 'text-neon-purple'; }

          setWeather({
            temp: w.temperature,
            wind: w.windspeed,
            humidity,
            condition,
            Icon,
            color
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch weather for widget", error);
        if (mounted) setLoading(false);
      }
    }
    
    fetchWeather();
    return () => { mounted = false; };
  }, [venue]);

  if (!venue) return null;

  return (
    <div className="glass-panel p-6 border-neon-cyan/20 animate-slide-up hover:border-neon-cyan/40 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sun size={18} className="text-yellow-400" />
          Live Weather
        </h2>
        <span className="text-[10px] text-slate-400 px-2 py-1 bg-navy-800 rounded uppercase tracking-wider flex items-center gap-1 border border-slate-700/50">
          <MapPin size={10} className="text-neon-cyan" /> {venue.city}
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <Loader2 className="animate-spin text-neon-cyan" size={24} />
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Syncing Telemetry...</p>
        </div>
      ) : weather ? (
        <div>
          <div className="flex items-center gap-5 mb-6">
            <div className={`p-4 rounded-2xl bg-navy-800/80 border border-slate-700/50 shadow-inner ${weather.color}`}>
              <weather.Icon size={40} />
            </div>
            <div>
              <p className="text-5xl font-display font-bold text-white tracking-tight">
                {Math.round(weather.temp)}°<span className="text-2xl text-slate-500">C</span>
              </p>
              <p className={`text-sm font-semibold tracking-wide mt-1 ${weather.color}`}>{weather.condition}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-navy-800/80 p-3 rounded-xl border border-white/5 flex items-center gap-3 group hover:border-neon-cyan/30 transition-colors">
              <div className="p-2 bg-neon-cyan/10 rounded-lg group-hover:bg-neon-cyan/20 transition-colors">
                <Wind size={16} className="text-neon-cyan" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Wind Speed</p>
                <p className="text-sm font-bold text-white">{weather.wind} <span className="text-[10px] font-normal text-slate-400">km/h</span></p>
              </div>
            </div>
            <div className="bg-navy-800/80 p-3 rounded-xl border border-white/5 flex items-center gap-3 group hover:border-neon-purple/30 transition-colors">
              <div className="p-2 bg-neon-purple/10 rounded-lg group-hover:bg-neon-purple/20 transition-colors">
                <Droplets size={16} className="text-neon-purple" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Humidity</p>
                <p className="text-sm font-bold text-white">{weather.humidity}<span className="text-[10px] font-normal text-slate-400">%</span></p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-slate-400 text-sm">
          Sensors disconnected.
        </div>
      )}
    </div>
  );
}
