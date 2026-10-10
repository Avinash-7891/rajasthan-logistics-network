import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Truck, MapPin, Shield, User, LogOut, Activity, Box, Compass } from 'lucide-react';

export default function Navbar({ currentView, setView }) {
  const { user, logout, login } = useAuth();

  const handleQuickLogin = async (role) => {
    try {
      if (role === 'admin') await login('admin@rlnet.in', 'adminpassword123');
      if (role === 'driver') await login('driver@rlnet.in', 'driverpassword123');
      if (role === 'client') await login('client@rlnet.in', 'clientpassword123');
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('admin')}>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
                Rajasthan Logistics
              </span>
              <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-orange-950/80 text-orange-400 border border-orange-500/30 font-medium">
                Network
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setView('client')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'client'
                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>Client Portal</span>
            </button>

            <button
              onClick={() => setView('driver')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'driver'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Driver Transit</span>
            </button>

            <button
              onClick={() => setView('admin')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === 'admin'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Admin Hub</span>
            </button>
          </nav>

          {/* User profile & Demo Quick-Login */}
          <div className="flex items-center space-x-3">
            {/* Demo Role Switchers */}
            <div className="hidden lg:flex items-center space-x-1.5 text-xs bg-slate-950/70 p-1 rounded-lg border border-slate-800">
              <span className="text-slate-400 px-1 font-mono text-[10px]">Demo:</span>
              <button
                onClick={() => handleQuickLogin('admin')}
                className="px-2 py-0.5 rounded text-[11px] bg-blue-900/40 text-blue-300 hover:bg-blue-800/60 border border-blue-700/40 transition-colors"
                title="Switch to Admin"
              >
                Admin
              </button>
              <button
                onClick={() => handleQuickLogin('driver')}
                className="px-2 py-0.5 rounded text-[11px] bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/60 border border-emerald-700/40 transition-colors"
                title="Switch to Driver"
              >
                Driver
              </button>
              <button
                onClick={() => handleQuickLogin('client')}
                className="px-2 py-0.5 rounded text-[11px] bg-orange-900/40 text-orange-300 hover:bg-orange-800/60 border border-orange-700/40 transition-colors"
                title="Switch to Client"
              >
                Client
              </button>
            </div>

            {user ? (
              <div className="flex items-center space-x-2.5">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-200">{user.name}</p>
                  <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-orange-400 border border-slate-700">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setView('login')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
