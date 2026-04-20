import React, { useState, useEffect } from 'react';
import { useCrowd } from '../context/CrowdContext';
import { Trophy, Activity, Radio, PlayCircle } from 'lucide-react';

const TEAM_MAP = {
  'chinnaswamy': { home: 'RCB', away: 'CSK', color: '#ff3333' },
  'wankhede': { home: 'MI', away: 'GT', color: '#0055ff' },
  'modi-stadium': { home: 'GT', away: 'RR', color: '#1c1c84' },
  'eden-gardens': { home: 'KKR', away: 'LSG', color: '#3a225d' },
  'arun-jaitley': { home: 'DC', away: 'PBKS', color: '#00008b' },
  'rajiv-gandhi': { home: 'SRH', away: 'RCB', color: '#ff822a' },
  'chidambaram': { home: 'CSK', away: 'MI', color: '#ffff3c' },
  'default': { home: 'IND', away: 'AUS', color: '#0077ff' }
};

export default function LiveScorecard() {
  const { state } = useCrowd();
  const venueId = state.activeVenue?.id;
  const matchInfo = TEAM_MAP[venueId] || TEAM_MAP['default'];

  // Mock live score state
  const [overs, setOvers] = useState(14.2);
  const [runs, setRuns] = useState(132);
  const [wickets, setWickets] = useState(3);
  const [lastBall, setLastBall] = useState('4');

  // Randomly update score every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        setOvers(prev => {
          let [o, b] = prev.toString().split('.').map(Number);
          b += 1;
          if (b > 5) {
            o += 1;
            b = 0;
          }
          return parseFloat(`${o}.${b}`);
        });

        const newRuns = Math.floor(Math.random() * 6);
        const isWicket = Math.random() < 0.05;

        if (isWicket) {
          setWickets(prev => Math.min(10, prev + 1));
          setLastBall('W');
        } else {
          setRuns(prev => prev + newRuns);
          setLastBall(newRuns.toString());
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel-hover p-5 border-t-2 relative overflow-hidden animate-slide-up" style={{ borderColor: matchInfo.color, animationDelay: '100ms' }}>
      {/* Background glow based on team color */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 pointer-events-none" 
        style={{ backgroundColor: matchInfo.color }}
      />
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-wide uppercase">
          <Radio size={16} className="text-red-500 animate-pulse" />
          Live Center
        </h2>
        <span className="text-xs bg-red-500/10 text-red-400 px-2 flex items-center gap-1 py-1 rounded-full border border-red-500/20 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          LIVE
        </span>
      </div>

      <div className="flex justify-between items-end mb-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-3xl font-display font-bold text-white tracking-tight">
              {runs}<span className="text-slate-400 font-medium text-2xl">/{wickets}</span>
            </p>
            <p className="text-sm text-slate-400 font-medium">
              {matchInfo.home} <span className="text-slate-600">vs</span> {matchInfo.away}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-slate-400 font-medium mb-1">Overs</p>
          <p className="text-xl font-mono text-neon-cyan font-bold">{overs.toFixed(1)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center bg-navy-900/50 p-3 rounded-lg border border-slate-700/50">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-2">
            <PlayCircle size={14} className="text-neon-cyan" />
            Last Ball
          </span>
          <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shadow-lg
            ${lastBall === 'W' ? 'bg-red-500 text-white' : 
              lastBall === '4' || lastBall === '6' ? 'bg-green-500 text-white' : 
              'bg-slate-700 text-slate-200'}`}
          >
            {lastBall}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
          <Trophy size={14} className="text-yellow-500" />
          <p className="text-xs text-slate-300">
            Current Run Rate: <span className="font-bold text-white">{(runs / overs).toFixed(1)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
