import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Search, User, LogOut, Settings, ChevronDown, X, Mail, KeyRound, CheckCircle, MapPin, Clock } from 'lucide-react';
import Sidebar from './Sidebar';
import ToastNotification from './ToastNotification';
import AiChatWidget from './AiChatWidget';
import { useCrowd } from '../context/CrowdContext';
import { useAuth } from '../context/AuthContext';
import { VENUES } from '../constants/venues';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVenueOpen, setIsVenueOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { state, dispatch } = useCrowd();
  const { user, logout, resetPassword } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const venueRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (venueRef.current && !venueRef.current.contains(event.target)) {
        setIsVenueOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    // Live Clock Interval
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearInterval(timer);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleOpenSettings = () => {
    setIsProfileOpen(false);
    setResetSent(false);
    setIsSettingsOpen(true);
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    const result = await resetPassword(user.email);
    setResetLoading(false);
    if (result.success) setResetSent(true);
  };

  const searchResults = [
    // Venues
    ...VENUES.filter(v => 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.city.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(v => ({
      type: 'venue', title: v.name, subtitle: `${v.city} · Venue`, payload: v
    })),
    // Features / Routes
    ...[
      { type: 'route', title: 'Dashboard Overview', subtitle: 'Analytics & KPIs', payload: '/stadium' },
      { type: 'route', title: 'Live Map', subtitle: 'Real-time venue visualization', payload: '/stadium/map' },
      { type: 'route', title: 'Queues & Concessions', subtitle: 'Wait times', payload: '/stadium/queues' },
      { type: 'route', title: 'Navigation', subtitle: 'Find paths', payload: '/stadium/navigate' },
      { type: 'route', title: 'PulseArena AI Assistant', subtitle: 'Intelligent Help', payload: '/stadium/assistant' },
    ].filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ].slice(0, 6);

  const handleSearchResultClick = (result) => {
    if (result.type === 'venue') {
      dispatch({ type: 'SET_VENUE', payload: result.payload });
    } else if (result.type === 'route') {
      navigate(result.payload);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-navy-900 relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 glass-panel border-t-0 border-x-0 rounded-none flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-slate-400 hover:text-white transition-colors shrink-0"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>


            <div className="relative" ref={venueRef}>
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => setIsVenueOpen(!isVenueOpen)}
              >
                <h2 className="text-lg font-bold text-white hidden sm:block group-hover:text-neon-cyan transition-colors">
                  {state.activeVenue?.name || 'Narendra Modi Stadium'}
                </h2>
                <ChevronDown size={16} className={`text-slate-400 group-hover:text-neon-cyan transition-all duration-300 ${isVenueOpen ? 'rotate-180 text-neon-cyan' : ''}`} />
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <span className="live-dot"></span> Phase: {state.currentPhase}
              </p>

              {/* Venue Dropdown Menu */}
              {isVenueOpen && (
                <div className="absolute top-full left-0 mt-3 w-72 glass-panel border border-neon-cyan/20 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-fade-in z-50">
                  <div className="p-3 border-b border-white/10 bg-navy-800/80 backdrop-blur-md">
                    <p className="text-[10px] text-neon-cyan uppercase tracking-widest font-bold px-2">Select Operating Venue</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {VENUES.map(venue => {
                      const isActive = state.activeVenue?.id === venue.id;
                      return (
                        <button
                          key={venue.id}
                          onClick={() => {
                            dispatch({ type: 'SET_VENUE', payload: venue });
                            setIsVenueOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-all duration-300 group border-l-2 custom-hover-target
                            ${isActive 
                              ? 'bg-neon-cyan/10 border-neon-cyan' 
                              : 'border-transparent hover:bg-white/5 hover:border-slate-500'
                            }`}
                        >
                          <div className={`mt-0.5 transition-colors duration-300 ${isActive ? 'text-neon-cyan' : 'text-slate-500 group-hover:text-slate-300'}`}>
                            <MapPin size={18} />
                          </div>
                          <div className="flex-1 transform transition-transform duration-300 group-hover:translate-x-1">
                            <p className={`text-sm tracking-wide ${isActive ? 'text-neon-cyan font-bold' : 'text-slate-300 font-medium group-hover:text-white'}`}>
                              {venue.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] text-slate-500 uppercase">{venue.city}</p>
                              <span className="text-slate-600 text-[10px]">•</span>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{venue.capacity} cap</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800/50 border border-slate-700/50 text-slate-300 pointer-events-none">
              <Clock size={16} className="text-neon-cyan" />
              <span className="text-sm font-mono tracking-wide font-semibold text-white">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 border border-slate-700 relative group focus-within:border-neon-cyan focus-within:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all duration-300" ref={searchRef}>
              <Search size={16} className={`transition-colors duration-300 ${isSearchOpen ? 'text-neon-cyan' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search venues, maps, AI..."
                className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 w-48 focus:w-64 transition-all duration-300"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
              />
              
              {/* Search Dropdown */}
              {isSearchOpen && searchQuery.length > 0 && (
                <div className="absolute top-full right-0 mt-3 w-80 glass-panel border border-neon-cyan/20 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-fade-in z-50">
                  <div className="p-2 border-b border-white/10 bg-navy-800/80 backdrop-blur-md">
                    <p className="text-[10px] text-neon-cyan uppercase tracking-widest font-bold px-2">Search Results</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {searchResults.length > 0 ? (
                      searchResults.map((res, i) => (
                        <button
                          key={i}
                          onClick={() => handleSearchResultClick(res)}
                          className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-white/5 border-l-2 border-transparent hover:border-neon-cyan group"
                        >
                          <div className="mt-0.5 text-slate-500 group-hover:text-neon-cyan transition-colors">
                            <Search size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{res.title}</p>
                            <p className="text-[10px] text-slate-500 uppercase mt-0.5">{res.subtitle}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-slate-400">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center shadow-lg border border-slate-700 overflow-hidden group-hover:border-neon-cyan transition-colors">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-slate-400 group-hover:text-neon-cyan" />
                  )}
                </div>
                <ChevronDown size={14} className="text-slate-500 hidden sm:block group-hover:text-neon-cyan transition-colors" />
              </div>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 glass-panel rounded-xl border border-slate-700 shadow-2xl overflow-hidden py-2 animate-fade-in z-50 bg-navy-900/95 backdrop-blur-xl">
                  <div className="px-4 py-2 border-b border-slate-700/50 mb-2">
                    <p className="text-sm font-bold text-white truncate">{user?.name || "Guest"}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{user?.email || "No email"}</p>
                  </div>

                  <button
                    onClick={handleOpenSettings}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Settings size={16} className="text-slate-400" />
                    Account Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neon-pink hover:bg-slate-800 transition-colors mt-1"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 pb-24 lg:pb-6 relative z-10 w-full">
          <div className="max-w-7xl mx-auto w-full min-h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex-1">
              <Outlet />
            </div>
            <footer className="mt-auto pt-8 pb-4 text-center text-slate-500 text-xs mt-12 border-t border-slate-800/50">
              <p className="mb-1 text-slate-400">Developed by <span className="text-neon-cyan font-medium">Anuj Yadav</span></p>
              <p>&copy; {new Date().getFullYear()} PulseArena AI Platform. All rights reserved.</p>
            </footer>
          </div>
        </main>
      </div>

      {/* ── Account Settings Modal ── */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="glass-panel rounded-2xl border border-slate-700 w-full max-w-md mx-4 p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                  <Settings size={20} className="text-neon-cyan" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Account Settings</h2>
                  <p className="text-xs text-slate-400">Manage your profile</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-navy-800 border border-slate-700 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neon-cyan/40 shrink-0">
                {user?.avatar
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-slate-700 flex items-center justify-center"><User size={28} className="text-slate-400" /></div>
                }
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-base truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-1">
                  <Mail size={11} /> {user?.email}
                </p>
                <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                  {user?.provider === 'google.com' ? 'Google Account' : 'Email Account'}
                </span>
              </div>
            </div>

            {/* Password Reset */}
            <div className="p-4 rounded-xl bg-navy-800 border border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <KeyRound size={15} className="text-neon-orange" />
                <p className="text-sm font-semibold text-white">Password Reset</p>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                A reset link will be sent to <span className="text-slate-300">{user?.email}</span>
              </p>

              {resetSent ? (
                <div className="flex items-center gap-2 text-neon-green text-sm font-medium">
                  <CheckCircle size={16} /> Reset email sent! Check your inbox.
                </div>
              ) : (
                <button
                  onClick={handlePasswordReset}
                  disabled={resetLoading || user?.provider === 'google.com'}
                  className="w-full py-2.5 rounded-xl bg-neon-orange/10 border border-neon-orange/40 text-neon-orange text-sm font-semibold hover:bg-neon-orange/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {resetLoading ? 'Sending...' : user?.provider === 'google.com' ? 'Managed by Google' : 'Send Reset Email'}
                </button>
              )}
            </div>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="mt-4 w-full py-2.5 rounded-xl bg-neon-pink/10 border border-neon-pink/40 text-neon-pink text-sm font-semibold hover:bg-neon-pink/20 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}

      <ToastNotification />
      <AiChatWidget />
    </div>
  );
}
