import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, Users, Navigation2, Bell, Bot, ChevronRight, LogOut, User as UserIcon, Settings, Lock, Unlock } from 'lucide-react';
import { useCrowd } from '../context/CrowdContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/stadium', label: 'Overview', icon: LayoutDashboard, color: 'cyan' },
  { path: '/stadium/map', label: 'Live Map', icon: MapIcon, color: 'purple' },
  { path: '/stadium/queues', label: 'Queues', icon: Users, color: 'green' },
  { path: '/stadium/navigate', label: 'Navigation', icon: Navigation2, color: 'pink' },
  { path: '/stadium/alerts', label: 'Alerts', icon: Bell, color: 'cyan' },
  { path: '/stadium/assistant', label: 'AI Assistant', icon: Bot, color: 'purple' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { state } = useCrowd();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const visibleNavItems = [...navItems];
  if (user?.isAdmin) {
    visibleNavItems.push({ path: '/stadium/admin', label: 'Admin Console', icon: Settings, color: 'orange' });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        role="complementary"
        aria-label="Application Sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 glass-panel border-l-0 border-y-0 rounded-none rounded-r-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div 
          className="p-6 flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] group-hover:scale-105">
            <MapIcon size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-wide text-white transition-colors duration-300 group-hover:text-neon-cyan">
              Pulse<span className="text-neon-cyan group-hover:text-white transition-colors duration-300">Arena</span>
            </h1>
            <p className="text-[10px] text-neon-purple uppercase tracking-widest font-semibold flex items-center gap-1 group-hover:text-neon-cyan transition-colors duration-300">
              <span className="live-dot"></span> Live AI
            </p>
          </div>
        </div>

        <nav role="navigation" aria-label="Main navigation" className="flex-1 px-4 py-6 space-y-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                    ? `bg-neon-${item.color}/10 border border-neon-${item.color}/30 text-white shadow-[0_0_15px_rgba(var(--color-${item.color}),0.15)]`
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={20}
                    className={isActive ? `text-neon-${item.color}` : 'group-hover:text-neon-cyan transition-colors'}
                  />
                  <span className="font-medium">{item.label}</span>
                </div>

                {/* Badges */}
                {item.path === '/alerts' && state.activeAlerts > 0 && (
                  <span className="bg-neon-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,51,85,0.5)]">
                    {state.activeAlerts}
                  </span>
                )}
                {isActive && item.path !== '/alerts' && (
                  <ChevronRight size={16} className={`text-neon-${item.color}`} />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 m-4 mb-2 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 to-transparent blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 flex items-start gap-3">
            <Bot className="text-neon-cyan mt-0.5" size={20} />
            <div>
              <p className="text-sm font-semibold text-white">AI Predictions</p>
              <p className="text-xs text-slate-400 mt-1">System is actively monitoring {state.zones.length} zones.</p>
            </div>
          </div>
        </div>

        {/* User Profile & Logout */}
        {user && (
          <div className="px-4 pb-6 mt-auto shrink-0">
            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-800 border border-slate-700/50">
              <div className="flex items-center gap-3 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-slate-600" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                    <UserIcon size={16} className="text-slate-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={handleLogout}
                  aria-label="Log Out"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors group relative"
                  title="Log Out"
                >
                  <LogOut size={16} className="group-hover:text-neon-pink" />
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
