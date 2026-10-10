import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AnalyticsCards from '../components/AnalyticsCards';
import RajasthanMap from '../components/RajasthanMap';
import VehicleTable from '../components/VehicleTable';
import OrderQueue from '../components/OrderQueue';
import TransitHistory from '../components/TransitHistory';
import NetworkAlgorithmsPanel from '../components/NetworkAlgorithmsPanel';
import { RefreshCw, Map as MapIcon, Truck, Cpu, Package, Activity } from 'lucide-react';

export default function AdminDashboard({ districts = [], roads = [], warehouses = [], onDataRefresh }) {
  const [analytics, setAnalytics] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRoutePath, setActiveRoutePath] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [highlightBridges, setHighlightBridges] = useState(true);
  const [highlightMst, setHighlightMst] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setHistoryLoading(true);
      const [analyticsRes, vehicleRes, orderRes, historyRes] = await Promise.all([
        api.getAnalytics(),
        api.getVehicles(),
        api.getOrders(),
        api.getOrderHistory(20)
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (vehicleRes.success) setVehicles(vehicleRes.data);
      if (orderRes.success) setOrders(orderRes.data);
      if (historyRes.success) setHistory(historyRes.data || []);
      if (onDataRefresh) onDataRefresh();
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTriggerQueueAssignment = async () => {
    try {
      await api.triggerQueueAssignment();
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to process queue:', err);
    }
  };

  const handleUpdateVehicleStatus = async (vehicleId, status) => {
    try {
      await api.updateVehicle(vehicleId, { status });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update vehicle:', err);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrderId(order.orderId);
    if (order.route && order.route.pathDistricts && order.route.pathDistricts.length > 0) {
      setActiveRoutePath(order.route.pathDistricts);
    } else if (order.route && order.route.stops) {
      setActiveRoutePath(order.route.stops);
    }
  };

  const handleSelectDistrictFromMap = (d) => {
    setSelectedDistrict(d.districtId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-orange-400" />
            <h1 className="text-2xl font-black text-slate-100">State Command & Logistics Hub</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete topology monitoring, algorithmic optimization, fleet tracking, and queued delivery dispatch
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Feeds</span>
        </button>
      </div>

      {/* 1. Analytics KPI Metrics */}
      <AnalyticsCards analyticsData={analytics} />

      {/* 2. Rajasthan Spatial Map */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-orange-400" />
            <span>Rajasthan Logistics Network Topology (GPS Projected)</span>
          </h2>
          {activeRoutePath && (
            <button
              onClick={() => setActiveRoutePath(null)}
              className="text-xs text-amber-400 hover:text-amber-300 underline"
            >
              Clear Active Route Overlay
            </button>
          )}
        </div>

        <RajasthanMap
          districts={districts}
          roads={roads}
          warehouses={warehouses}
          highlightBridges={highlightBridges}
          highlightMst={highlightMst}
          activeRoute={activeRoutePath}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={handleSelectDistrictFromMap}
        />
      </section>

      {/* 3. Algorithm Control Center */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-orange-400" />
            <span>Algorithm Control Center</span>
          </h2>
        </div>

        <NetworkAlgorithmsPanel
          districts={districts}
          onRouteCalculated={(path) => setActiveRoutePath(path)}
          onHighlightBridges={() => setHighlightBridges(true)}
          onHighlightMst={() => setHighlightMst(true)}
          onTrafficSimulated={fetchDashboardData}
        />
      </section>

      {/* 4. Fleet Status & Pending Orders */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <VehicleTable
            vehicles={vehicles}
            onRefresh={fetchDashboardData}
            onUpdateStatus={handleUpdateVehicleStatus}
          />
        </div>

        <div className="lg:col-span-5">
          <OrderQueue
            orders={orders}
            onTriggerQueue={handleTriggerQueueAssignment}
            onSelectOrder={handleSelectOrder}
            selectedOrderId={selectedOrderId}
          />
        </div>
      </section>

      {/* 5. Transit History (last 20 orders) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-400" />
            <span>Last 20 Orders &mdash; Dispatch &amp; Delivery Records</span>
          </h2>
        </div>

        <TransitHistory orders={history} loading={historyLoading} />
      </section>
    </div>
  );
}
