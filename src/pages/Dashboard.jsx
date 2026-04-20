import React, { useState, useEffect, useRef } from 'react';
import { Users, Clock, AlertTriangle, Activity, ChevronRight, Activity as PulseIcon, Sparkles, MapPin, BarChart2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import DensityBadge from '../components/DensityBadge';
import WeatherWidget from '../components/WeatherWidget';
import { useCrowd } from '../context/CrowdContext';
import { generateCrowdInsight } from '../services/geminiInsights';

// ── Google Charts crowd density chart ────────────────────────────────────────
function CrowdDensityChart({ zones }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [googleReady, setGoogleReady] = useState(false);

  // 1. Core library loading - executes exactly once
  useEffect(() => {
    if (window.google?.visualization?.ColumnChart) {
      setGoogleReady(true);
      return;
    }
    
    // Prevent multiple script injections across rapid re-renders
    if (window._googleChartsLoading) {
      const timer = setInterval(() => {
        if (window.google?.visualization?.ColumnChart) {
           setGoogleReady(true);
           clearInterval(timer);
        }
      }, 300);
      return () => clearInterval(timer);
    }
    
    window._googleChartsLoading = true;
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/charts/loader.js';
    script.onload = () => {
      window.google.charts.load('current', { packages: ['corechart'] });
      window.google.charts.setOnLoadCallback(() => {
        setGoogleReady(true);
      });
    };
    document.head.appendChild(script);
  }, []);

  // 2. Draw & Update logic - executes safely when ready and zones change
  useEffect(() => {
    if (!googleReady || !chartRef.current || !zones?.length) return;

    const data = new window.google.visualization.DataTable();
    data.addColumn('string', 'Zone');
    data.addColumn('number', 'Density %');
    data.addColumn({ type: 'string', role: 'style' });
    data.addRows(
      zones.slice(0, 6).map(z => [
        z.name.split(' ')[0],
        z.occupancy,
        z.status === 'critical' ? 'color: #ff2d95' :
        z.status === 'warning'  ? 'color: #ff8c00' :
                                 'color: #00d4ff'
      ])
    );
    
    const options = {
      backgroundColor: 'transparent',
      legend: 'none',
      bar: { groupWidth: '60%' },
      chartArea: { left: 40, top: 10, right: 10, bottom: 40, width: '100%', height: '100%' },
      hAxis: { textStyle: { color: '#94a3b8', fontSize: 11 }, gridlines: { color: 'transparent' } },
      vAxis: { textStyle: { color: '#94a3b8', fontSize: 11 }, gridlines: { color: 'rgba(255,255,255,0.05)' }, minValue: 0, maxValue: 100 },
      animation: { startup: true, duration: 600, easing: 'out' },
    };

    if (!chartInstance.current) {
      chartInstance.current = new window.google.visualization.ColumnChart(chartRef.current);
    }
    chartInstance.current.draw(data, options);
  }, [zones, googleReady]);

  return <div ref={chartRef} style={{ width: '100%', height: '160px' }} />;
}

export default function Dashboard() {
  const { state } = useCrowd();
  const [aiInsight, setAiInsight] = useState('Analyzing crowd patterns with Gemini AI...');
  const [insightLoading, setInsightLoading] = useState(true);

  // Get top 3 most crowded zones
  const topCrowded = [...state.zones]
    .sort((a, b) => b.density - a.density)
    .slice(0, 3);

  // Build Google Maps embed URL from active venue GPS coords
  const venue = state.activeVenue;
  const mapsEmbedUrl = venue
    ? `https://www.google.com/maps?q=${venue.lat},${venue.lng}&z=16&output=embed`
    : `https://www.google.com/maps?q=23.0917,72.5971&z=16&output=embed`;

  // Fetch Gemini AI insight once zones are loaded
  useEffect(() => {
    if (!state.zones.length) return;
    setInsightLoading(true);
    generateCrowdInsight(
      { zones: state.zones, avgWaitTime: state.avgWaitTime, crowdFlowScore: state.crowdFlowScore, activeAlerts: state.activeAlerts },
      state.activeVenue?.name
    ).then(insight => {
      setAiInsight(insight);
      setInsightLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.crowdFlowScore]);

  return (
    <div className="space-y-6 page-enter max-w-full overflow-hidden">
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">Platform Overview</h1>
        <p className="text-slate-400">Real-time intelligence and crowd metrics across the venue.</p>
      </div>

      {/* Gemini AI Insight Banner */}
      <div className="glass-panel p-4 border-neon-purple/30 bg-neon-purple/5 flex items-start gap-3">
        <Sparkles size={18} className={`text-neon-purple mt-0.5 shrink-0 ${insightLoading ? 'animate-pulse' : ''}`} />
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-neon-purple mb-1">Gemini AI Insight</p>
          <p className="text-sm text-slate-200">{aiInsight}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Users} 
          label="Total Attendance" 
          value={state.totalAttendance} 
          trend="up" 
          trendValue="+1.2k/hr"
          color="cyan"
          delay={0}
        />
        <StatCard 
          icon={Clock} 
          label="Avg Wait Time" 
          value={state.avgWaitTime} 
          unit="min"
          trend="down" 
          trendValue="-2min"
          color="purple"
          delay={100}
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Active Alerts" 
          value={state.activeAlerts} 
          color={state.activeAlerts > 0 ? "pink" : "cyan"}
          delay={200}
        />
        <StatCard 
          icon={Activity} 
          label="Flow Score" 
          value={state.crowdFlowScore} 
          unit="/100"
          trend="up"
          trendValue="+5"
          color="green"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <PulseIcon size={20} className="text-neon-cyan" />
                Live Activity
              </h2>
              <button className="text-sm text-neon-cyan hover:underline flex items-center">
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {state.activityFeed.slice(0, 5).map((activity, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    activity.severity === 'critical' ? 'bg-neon-red' :
                    activity.severity === 'warning' ? 'bg-neon-orange' :
                    activity.severity === 'success' ? 'bg-neon-green' : 'bg-neon-cyan'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200">{activity.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Google Charts: Zone Density Chart ─────────────────────────── */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
              <BarChart2 size={20} className="text-neon-cyan" />
              Live Zone Density
            </h2>
            <p className="text-xs text-slate-500 mb-4">Real-time crowd density per zone · Powered by Google Charts</p>
            <CrowdDensityChart zones={state.zones} />
          </div>
        </div>

        {/* Right Sidebar: Predictions & Hotspots */}
        <div className="space-y-6">
          {/* Live Weather */}
          <WeatherWidget />

          {/* ── Google Maps Embed: Venue Location ─────────────────────────── */}
          <div className="glass-panel p-4">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-neon-cyan" />
              Venue Location
            </h2>
            <div className="rounded-xl overflow-hidden border border-slate-700/50" style={{ height: '200px' }}>
              <iframe
                key={mapsEmbedUrl}
                title="Venue Location"
                src={mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${venue?.lat},${venue?.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 text-xs text-neon-cyan hover:text-white font-semibold transition-colors py-2 rounded-lg bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/20"
            >
              <MapPin size={12} /> Get Directions in Google Maps
            </a>
          </div>

          {/* AI Predictions */}
          <div className="glass-panel p-6 border-neon-purple/30">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity size={18} className="text-neon-purple" />
              AI Predictions
            </h2>
            <div className="space-y-3">
              {state.predictions.slice(0, 3).map((pred, i) => (
                <div key={i} className="p-3 rounded-lg bg-navy-800/50 border border-slate-700/50">
                  <p className="text-sm text-slate-300">{pred.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">Confidence</span>
                    <span className="text-xs font-mono text-neon-purple">{pred.confidence}%</span>
                  </div>
                  <div className="w-full h-1 bg-navy-900 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-neon-purple rounded-full"
                      style={{ width: `${pred.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Hotspots */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-bold text-white mb-4">Current Hotspots</h2>
            <div className="space-y-3">
              {topCrowded.map(zone => (
                <div key={zone.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">{zone.name}</p>
                    <p className="text-xs text-slate-400">{zone.currentCount} people</p>
                  </div>
                  <DensityBadge status={zone.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
