import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const glowMap = {
  cyan: 'stat-glow-cyan',
  purple: 'stat-glow-purple',
  pink: 'stat-glow-pink',
  green: 'stat-glow-green',
};

const gradientMap = {
  cyan: 'from-neon-cyan/20 to-transparent',
  purple: 'from-neon-purple/20 to-transparent',
  pink: 'from-neon-pink/20 to-transparent',
  green: 'from-neon-green/20 to-transparent',
};

const iconBgMap = {
  cyan: 'bg-neon-cyan/20 text-neon-cyan',
  purple: 'bg-neon-purple/20 text-neon-purple',
  pink: 'bg-neon-pink/20 text-neon-pink',
  green: 'bg-neon-green/20 text-neon-green',
};

export default function StatCard({ icon: Icon, label, value, unit, trend, trendValue, color = 'cyan', delay = 0 }) {
  return (
    <div
      className={`glass-panel-hover p-5 relative overflow-hidden animate-fade-in ${glowMap[color]}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background gradient accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${gradientMap[color]} rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgMap[color]}`}>
            <Icon size={20} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-neon-green' : 'text-neon-red'}`}>
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trendValue}
            </div>
          )}
        </div>
        
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-display text-white">{typeof value === 'number' ? value.toLocaleString() : value}</span>
          {unit && <span className="text-sm text-slate-400">{unit}</span>}
        </div>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}
