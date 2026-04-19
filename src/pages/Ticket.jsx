import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCrowd } from '../context/CrowdContext';
import { QrCode, ShieldCheck, Ticket as TicketIcon, CheckCircle2, Loader2 } from 'lucide-react';

export default function Ticket() {
  const { user } = useAuth();
  const { state } = useCrowd();
  const [walletState, setWalletState] = useState('idle'); // idle, loading, success

  // Generate a hash-like verification code
  const verificationCode = user ? `${user.email.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}` : 'Gst-000000';
  const qrData = user ? `pulsearena://verify?uid=${user.email}&venue=${state.activeVenue.id}` : 'pulsearena://guest';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}&color=0a0e27&bgcolor=00d4ff`;

  const handleAddToWallet = () => {
    setWalletState('loading');
    
    // Simulate API JWT generation and Google Wallet Native bridge sync
    setTimeout(() => {
      setWalletState('success');
      
      // Reset back to idle after 4 seconds of showing the success state
      setTimeout(() => setWalletState('idle'), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6 page-enter max-w-2xl mx-auto mt-8 relative">
      <div className="flex items-center gap-3 mb-8">
         <div className="w-12 h-12 rounded-xl bg-neon-cyan/20 flex items-center justify-center border border-neon-cyan/30 text-neon-cyan shadow-[0_0_15px_rgba(0,212,255,0.3)]">
           <TicketIcon size={24} />
         </div>
         <div>
           <h1 className="text-3xl font-display font-bold text-white tracking-tight">Active E-Ticket</h1>
           <p className="text-slate-400">Present this QR code for seamless venue access</p>
         </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between border-t-4 border-t-neon-cyan group">
        
        {/* User Info Section */}
        <div className="flex-1 w-full space-y-6 relative z-10">
          <div className="flex items-center gap-4">
             <img src={user?.avatar || `https://ui-avatars.com/api/?name=Guest`} alt="Profile" className="w-16 h-16 rounded-full border-2 border-neon-cyan shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
             <div>
               <h2 className="text-2xl font-bold text-white">{user?.name || 'Guest User'}</h2>
               <p className="text-neon-cyan font-medium text-sm flex items-center gap-1"><ShieldCheck size={14} /> Verified Member</p>
             </div>
          </div>

          <div className="bg-navy-900/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
            <div className="flex justify-between items-center text-sm">
               <span className="text-slate-400">Event</span>
               <span className="font-bold text-white">Live Finals</span>
            </div>
            <div className="flex justify-between items-center text-sm">
               <span className="text-slate-400">Venue</span>
               <span className="font-bold text-white">{state.activeVenue.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
               <span className="text-slate-400">Gate Allocation</span>
               <span className="font-bold text-neon-purple bg-neon-purple/20 px-2 py-0.5 rounded">Gate D (Priority)</span>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="relative shrink-0 flex flex-col items-center">
            {/* Glowing backdrop border */}
            <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-xl blur-md opacity-30 group-hover:opacity-60 transition-opacity"></div>
            
            <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
               <img src={qrUrl} alt="Ticket QR Code" className="w-48 h-48 mix-blend-multiply" />
            </div>
            
            <p className="text-xs text-slate-400 mt-4 font-mono tracking-widest text-center">
               CODE: <span className="text-white font-bold">{verificationCode}</span>
            </p>
        </div>
      </div>

      {/* Add To Wallet Button & States */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
         {walletState === 'idle' && (
           <button 
             onClick={handleAddToWallet}
             className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-transform active:scale-95 shadow-lg shadow-white/10"
           >
              <svg width="24" height="24" viewBox="0 0 48 48" className="shrink-0"><path fill="#EA4335" d="M14 24l-8.5-4.9-3.4 5.9L10.6 30z"/><path fill="#4285F4" d="M34 24l8.5-4.9 3.4 5.9L37.4 30z"/><path fill="#FBBC05" d="M24 6l8.5 4.9-3.4 5.9L24 11.9z"/><path fill="#34A853" d="M24 42l-8.5-4.9 3.4-5.9L24 36.1z"/></svg>
              Add to Google Wallet
           </button>
         )}

         {walletState === 'loading' && (
           <button disabled className="flex items-center gap-3 bg-slate-800 text-white border border-slate-700 px-6 py-3 rounded-full font-bold opacity-80 cursor-not-allowed transition-all">
              <Loader2 className="animate-spin text-[#4285F4]" size={20} />
              Generating Secure JWT Token...
           </button>
         )}

         {walletState === 'success' && (
           <div className="flex items-center gap-3 bg-[#34A853]/10 border border-[#34A853]/30 text-[#34A853] px-6 py-3 rounded-full font-bold animate-fade-in relative overflow-hidden">
              <div className="absolute inset-0 bg-[#34A853]/10 animate-pulse"></div>
              <CheckCircle2 size={20} />
              <span className="relative z-10">Synced to Google Wallet Successfully!</span>
           </div>
         )}
      </div>

      <div className="text-center text-slate-500 text-xs mt-6">
         <p>Tickets are strictly non-transferable. Presenting false credentials may lead to venue expulsion.</p>
      </div>
    </div>
  );
}
