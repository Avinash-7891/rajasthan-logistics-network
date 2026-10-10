import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Truck, Shield, Compass, Box, ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login({ onNavigateRegister, onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@rlnet.in');
  const [password, setPassword] = useState('adminpassword123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success && onLoginSuccess) {
        onLoginSuccess(res.user.role);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail, rolePass, role) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/20 mb-3">
            <Truck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100">Rajasthan Logistics</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to manage and dispatch statewide cargo</p>
        </div>

        {/* Quick Demo Credentials */}
        <div className="mb-6 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            One-Click Demo Roles:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@rlnet.in', 'adminpassword123', 'admin')}
              className="px-2 py-1.5 rounded-lg bg-blue-950/60 text-blue-300 border border-blue-800/60 hover:bg-blue-900/80 transition-all font-medium text-[11px] flex items-center justify-center gap-1"
            >
              <Shield className="w-3 h-3" /> Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('driver@rlnet.in', 'driverpassword123', 'driver')}
              className="px-2 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/80 transition-all font-medium text-[11px] flex items-center justify-center gap-1"
            >
              <Compass className="w-3 h-3" /> Driver
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('client@rlnet.in', 'clientpassword123', 'client')}
              className="px-2 py-1.5 rounded-lg bg-orange-950/60 text-orange-300 border border-orange-500/40 hover:bg-orange-900/80 transition-all font-medium text-[11px] flex items-center justify-center gap-1"
            >
              <Box className="w-3 h-3" /> Client
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-800 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                placeholder="name@rlnet.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Need a client delivery account?{' '}
          <button
            onClick={onNavigateRegister}
            className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}
