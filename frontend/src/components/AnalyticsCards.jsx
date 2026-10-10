import React from 'react';
import { Package, Clock, TrendingUp, Truck, Zap, Activity } from 'lucide-react';

export default function AnalyticsCards({ analyticsData = {} }) {
  const {
    ordersTodayCount = 0,
    totalOrdersCount = 0,
    avgDeliveryTimeMinutes = 0,
    vehicleUtilization = {},
    mostUsedRoutes = []
  } = analyticsData;

  const activeFleetPercent = vehicleUtilization.activeFleetPercent || 0;
  const capacityUtilPercent = vehicleUtilization.capacityUtilizationPercent || 0;

  return (
    <div className="space-y-4">
      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Orders Today */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Orders Today
            </span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-100 font-mono">
              {ordersTodayCount}
            </span>
            <span className="text-xs text-slate-400">
              ({totalOrdersCount} all-time)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Live shipments created across Rajasthan</p>
        </div>

        {/* Average Delivery Time */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Avg Route ETA
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-100 font-mono">
              {avgDeliveryTimeMinutes}
            </span>
            <span className="text-xs text-slate-400">min / order</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Computed via Dijkstra + traffic multiplier</p>
        </div>

        {/* Fleet Deployment % */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Fleet Ratio
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-100 font-mono">
              {activeFleetPercent}%
            </span>
            <span className="text-xs text-slate-400">
              ({vehicleUtilization.inTransitVehicles || 0} / {vehicleUtilization.totalVehicles || 0} deployed)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, activeFleetPercent)}%` }}
            />
          </div>
        </div>

        {/* Payload Capacity Utilization */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Capacity Utilization
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-100 font-mono">
              {capacityUtilPercent}%
            </span>
            <span className="text-xs text-slate-400">
              ({(vehicleUtilization.currentFleetLoadKg || 0).toLocaleString()} kg)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, capacityUtilPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Most Used Freight Corridors */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-orange-400" />
          <span>Top Utilized Rajasthan Freight Corridors</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {mostUsedRoutes.map((route, i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-200">{route.corridor}</p>
                <span className="text-[10px] text-slate-500">Traversals</span>
              </div>
              <span className="text-sm font-mono font-bold text-orange-400 px-2 py-0.5 rounded bg-orange-950/50 border border-orange-500/20">
                {route.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
