import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Truck, ArrowRight, Lock, Mail, User, Phone, Shield } from 'lucide-react';

export default function Register({ onNavigateLogin, onRegisterSuccess }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await register({ name, email, password, role, phone });
      if (res.success && onRegisterSuccess) {
        onRegisterSuccess(res.user.role);
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/20 mb-3">
            <Truck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100">Join the Network</h2>
          <p className="text-xs text-slate-400 mt-1">Register for Rajasthan Logistics Platform</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-800 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                placeholder="Ramesh Kumar"
              />
            </div>
          </div>

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
                placeholder="ramesh@business.in"
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

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-orange-500"
            >
              <option value="client">Client Merchant (Book Cargo & Deliveries)</option>
              <option value="driver">Fleet Driver (Execute Routes & Complete Stops)</option>
              <option value="admin">Logistics Admin (Full State Network Control)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                placeholder="+91-98290-XXXXX"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <button
            onClick={onNavigateLogin}
            className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
