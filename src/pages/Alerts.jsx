import React, { useState, useEffect, useCallback } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useCrowd } from '../context/CrowdContext';
import { generateAlertRecommendation } from '../services/geminiInsights';

export default function Alerts() {
  const { state, dispatch } = useCrowd();
  const [filter, setFilter] = useState('all');
  // Cache of AI recommendations keyed by alert.id
  const [aiRecs, setAiRecs] = useState({});

  const handleMarkAllRead = () => {
    dispatch({ type: 'MARK_ALL_ALERTS_READ' });
  };

  const handleMarkRead = (id) => {
    dispatch({ type: 'MARK_ALERT_READ', payload: id });
  };

  // Fetch Gemini recommendation for critical/warning alerts not yet cached
  const fetchRec = useCallback(async (alert) => {
    if (aiRecs[alert.id] || alert.priority === 'info') return;
    const rec = await generateAlertRecommendation(alert);
    setAiRecs(prev => ({ ...prev, [alert.id]: rec }));
  }, [aiRecs]);

  const getIcon = (priority) => {
    switch (priority) {
      case 'critical': return <AlertCircle size={20} className="text-neon-red" />;
      case 'warning': return <AlertTriangle size={20} className="text-neon-orange" />;
      default: return <Info size={20} className="text-neon-cyan" />;
    }
  };

  const filteredAlerts = state.alerts.filter(a => filter === 'all' || a.priority === filter);

  return (
    <div className="space-y-6 page-enter max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
            Alert Center 
            {state.activeAlerts > 0 && (
              <span className="text-sm bg-neon-red/20 text-neon-red px-3 py-1 rounded-full border border-neon-red/30">
                {state.activeAlerts} New
              </span>
            )}
          </h1>
          <p className="text-slate-400">Real-time notifications and system advisories.</p>
        </div>
        
        <button 
          onClick={handleMarkAllRead}
          disabled={state.activeAlerts === 0}
          className="text-sm font-medium text-slate-400 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <CheckCircle2 size={16} /> Mark all as read
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-4">
        <SlidersHorizontal size={16} className="text-slate-500 mr-2" />
        {['all', 'critical', 'warning', 'info'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
              filter === f 
                ? 'bg-white/10 text-white border-white/20 border shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 glass-panel">
            <Bell size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No alerts found for this filter.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert.id} 
              className={`glass-panel p-4 flex gap-4 transition-all ${
                !alert.read ? 'border-l-4 border-l-neon-cyan bg-neon-cyan/5' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className="shrink-0 mt-1">
                {getIcon(alert.priority)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-bold ${!alert.read ? 'text-white' : 'text-slate-300'}`}>
                    {alert.title}
                  </h3>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{alert.timestamp}</span>
                </div>
                
                <p className="text-sm text-slate-400">{alert.message}</p>

                {/* Gemini AI Recommendation for high-priority alerts */}
                {(alert.priority === 'critical' || alert.priority === 'warning') && !alert.read && (
                  <div
                    className="mt-2 flex items-start gap-2 text-xs text-neon-purple/80 cursor-pointer hover:text-neon-purple transition-colors"
                    onClick={() => fetchRec(alert)}
                  >
                    <Sparkles size={12} className="mt-0.5 shrink-0" />
                    <span>
                      {aiRecs[alert.id]
                        ? aiRecs[alert.id]
                        : 'Tap for Gemini AI recommendation →'}
                    </span>
                  </div>
                )}
                
                {!alert.read && (
                  <button 
                    onClick={() => handleMarkRead(alert.id)}
                    className="mt-3 text-xs font-bold uppercase tracking-wider text-neon-cyan hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
