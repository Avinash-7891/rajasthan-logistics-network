import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import DriverDashboard from './pages/DriverDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
  const { user } = useAuth();
  const [view, setView] = useState('admin'); // default view
  const [districts, setDistricts] = useState([]);
  const [roads, setRoads] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Sync initial view with user role on login
  useEffect(() => {
    if (user && user.role) {
      if (user.role === 'client') setView('client');
      else if (user.role === 'driver') setView('driver');
      else if (user.role === 'admin') setView('admin');
    }
  }, [user]);

  const loadNetworkData = async () => {
    try {
      const [dRes, rRes, wRes] = await Promise.all([
        api.getDistricts(),
        api.getRoads(),
        api.getWarehouses()
      ]);
      if (dRes.success) setDistricts(dRes.data);
      if (rRes.success) setRoads(rRes.data);
      if (wRes.success) setWarehouses(wRes.data);
    } catch (err) {
      console.error('Failed to load initial network data:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar currentView={view} setView={setView} />

      <main className="flex-1">
        {view === 'login' && (
          <Login
            onNavigateRegister={() => setView('register')}
            onLoginSuccess={(role) => setView(role === 'driver' ? 'driver' : role === 'client' ? 'client' : 'admin')}
          />
        )}

        {view === 'register' && (
          <Register
            onNavigateLogin={() => setView('login')}
            onRegisterSuccess={(role) => setView(role === 'driver' ? 'driver' : role === 'client' ? 'client' : 'admin')}
          />
        )}

        {view === 'admin' && (
          <AdminDashboard
            districts={districts}
            roads={roads}
            warehouses={warehouses}
            onDataRefresh={loadNetworkData}
          />
        )}

        {view === 'client' && (
          <ClientDashboard
            districts={districts}
            warehouses={warehouses}
          />
        )}

        {view === 'driver' && (
          <DriverDashboard
            districts={districts}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <p>
            © 2026 Rajasthan Logistics Network | Advanced Algorithmic Graph Optimization Platform
          </p>
          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
            <span>Rajasthan Logistics Network Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
