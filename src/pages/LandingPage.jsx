import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Shield, Zap, Activity, ArrowRight, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';

const VENUES = [
  { id: 'modi-stadium', name: 'Narendra Modi Stadium', city: 'Ahmedabad', lat: 23.0917, lng: 72.5971, capacity: '132,000' },
  { id: 'wankhede', name: 'Wankhede Stadium', city: 'Mumbai', lat: 18.9388, lng: 72.8257, capacity: '33,000' },
  { id: 'eden-gardens', name: 'Eden Gardens', city: 'Kolkata', lat: 22.5646, lng: 88.3433, capacity: '68,000' },
  { id: 'arun-jaitley', name: 'Arun Jaitley Stadium', city: 'Delhi', lat: 28.6376, lng: 77.2433, capacity: '41,800' },
  { id: 'chinnaswamy', name: 'M. Chinnaswamy Stadium', city: 'Bengaluru', lat: 12.9788, lng: 77.5996, capacity: '40,000' }
];

const customPin = new L.DivIcon({
  html: `<div style="background-color: #00d4ff; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px #00d4ff"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Interactive Cursor Tracking State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleCTA = () => navigate(user ? '/stadium' : '/auth');

  return (
    <div className="min-h-screen bg-navy-900 overflow-x-hidden text-white selection:bg-neon-purple/30 selection:text-white relative">
      {/* Interactive Cursor Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 212, 255, 0.08), transparent 40%)`
        }}
      />
      {/* Base Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neon-cyan/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-panel border-x-0 border-t-0 rounded-none px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(123,47,247,0.5)]">
            P
          </div>
          <span className="font-display font-bold text-xl tracking-wide">
            PulseArena <span className="text-neon-cyan">AI</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#features" className="text-slate-300 hover:text-white transition-colors">Platform</a>
          <a href="#venues" className="text-slate-300 hover:text-white transition-colors">Venues</a>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 text-sm">
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                <span className="text-slate-300 font-medium">{user.name}</span>
              </div>
              <button onClick={() => navigate('/stadium')} className="gradient-btn px-5 py-2 text-sm">
                Dashboard
              </button>
              <button onClick={() => { logout(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-all text-sm">
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <button onClick={handleCTA} className="gradient-btn px-6 py-2 text-sm shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)]">
              Get Started
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center min-h-[80vh]">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
          Live Crowd Intelligence
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display font-black leading-tight mb-6 tracking-tight">
          Redefining the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-white to-neon-purple">
            Live Event Experience
          </span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          PulseArena AI uses real-time spatial analytics and predictive modeling to eliminate queues, manage crowd flow, and elevate security across massive sporting venues.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={handleCTA} className="px-8 py-4 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan text-black font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(123,47,247,0.4)]">
            {user ? 'Open Dashboard' : 'Get Started'} <ArrowRight size={20} />
          </button>
          <a href="#venues" className="px-8 py-4 rounded-xl glass-panel text-white font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
            View Live Venues <MapPin size={20} />
          </a>
        </div>
      </section>

      {/* Interactive Venues Map Section */}
      <section id="venues" className="py-20 bg-navy-800/50 border-y border-slate-800 relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Live India Venues</h2>
          <p className="text-slate-400 max-w-2xl">
            Select a stadium to access its dedicated intelligence dashboard. Currently monitoring real-time flow capacity for top tier venues across India.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 h-[500px]">
          <div className="w-full h-full glass-panel rounded-2xl overflow-hidden border border-neon-cyan/20 shadow-2xl relative">
            <MapContainer 
              center={[22.5937, 78.9629]} 
              zoom={5} 
              className="h-full w-full outline-none z-0 bg-[#0a0e27]"
              style={{ filter: 'hue-rotate(180deg) saturate(1.4) brightness(0.85)' }}
              zoomControl={false}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
              />
              {VENUES.map((venue) => (
                <Marker 
                  key={venue.id} 
                  position={[venue.lat, venue.lng]}
                  icon={customPin}
                >
                  <Popup className="custom-popup">
                    <div className="p-1">
                      <h3 className="font-bold text-white text-base leading-tight mb-1">{venue.name}</h3>
                      <p className="text-slate-400 text-xs mb-3">{venue.city}</p>
                      
                      <div className="flex justify-between items-center bg-navy-900 border border-slate-700 rounded-lg p-2 mb-3">
                         <div className="text-center w-full">
                           <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Capacity</span>
                           <span className="font-bold text-neon-cyan">{venue.capacity}</span>
                         </div>
                      </div>

                      <button 
                        onClick={handleCTA} 
                        className="w-full py-1.5 gradient-btn text-[11px] rounded flex justify-center items-center gap-1"
                      >
                        {user ? 'Open Dashboard' : 'Sign In'} <ArrowRight size={12} />
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            
            {/* Overlay map UI */}
            <div className="absolute bottom-6 left-6 z-[1000] glass-panel bg-navy-900/90 px-4 py-3 rounded-xl border border-slate-700/50 pointer-events-none">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></div>
                 <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Active Monitoring</span>
              </div>
              <p className="text-[10px] text-slate-500">{VENUES.length} Major Venues Online</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Value Props Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {[
          { icon: <Activity className="text-neon-cyan" size={32} />, title: 'Real-time Flow', desc: 'Predictive analytics mapping crowd movement specifically to identify bottlenecks before they happen.' },
          { icon: <Zap className="text-neon-purple" size={32} />, title: 'Dynamic Queuing', desc: 'Distributes user traffic smartly to shorter food and merchandise lines autonomously via AI.' },
          { icon: <Shield className="text-neon-pink" size={32} />, title: 'Secure Operations', desc: 'Equips on-ground personnel with priority alerts and instant redirect options for secure events.' }
        ].map((feat, i) => {
          return (
            <div 
              key={i} 
              className="group relative glass-panel p-8 rounded-3xl transition-all duration-500 overflow-hidden hover:border-neon-cyan/50 hover:shadow-[0_0_40px_rgba(0,212,255,0.15)] hover:-translate-y-4"
            >
              {/* Internal card hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-slate-700/50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-navy-900 transition-all duration-300 shadow-xl group-hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]">
                  {feat.icon}
                </div>
                <h3 className="text-2xl font-display font-bold mb-4 text-white group-hover:text-neon-cyan transition-colors">{feat.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm md:text-base group-hover:text-slate-300 transition-colors">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      <footer className="py-8 border-t border-slate-800 text-center text-slate-500 text-sm relative z-10">
        <p className="mb-1">Developed by <span className="text-neon-cyan font-medium">Anuj Yadav</span></p>
        <p>&copy; {new Date().getFullYear()} PulseArena AI Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
