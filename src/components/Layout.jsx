import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Search, User, LogOut, Settings, ChevronDown, X, Mail, KeyRound, CheckCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import ToastNotification from './ToastNotification';
import AiChatWidget from './AiChatWidget';
import { useCrowd } from '../context/CrowdContext';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { state } = useCrowd();
  const { user, logout, resetPassword } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white hidden sm:block">Narendra Modi Stadium</h2>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span className="live-dot"></span> Phase: {state.currentPhase}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 border border-slate-700">
              <Search size={16} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search venues, queues..."
                className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 w-48"
              />
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
