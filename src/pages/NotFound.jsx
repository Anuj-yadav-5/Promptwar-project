import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neon-cyan/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 glass-panel p-12 rounded-3xl max-w-lg w-full flex flex-col items-center border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="w-20 h-20 bg-neon-red/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,51,85,0.2)] border border-neon-red/30">
          <AlertTriangle size={40} className="text-neon-red" />
        </div>
        
        <h1 className="text-6xl font-display font-black mb-2 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        
        <p className="text-slate-400 mb-8 max-w-sm">
          The venue sector you are looking for has either been closed, renamed, or doesn't exist in our routing system.
        </p>
        
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan text-navy-900 font-bold hover:scale-105 transition-transform"
        >
          <ArrowLeft size={18} /> Take Me Back Home
        </button>
      </div>
    </div>
  );
}
