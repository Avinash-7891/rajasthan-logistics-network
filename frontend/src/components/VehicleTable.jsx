import React, { useState } from 'react';
import { Truck, CheckCircle, Clock, MapPin, Gauge, Shield } from 'lucide-react';


export default function VehicleTable({ vehicles = [], onRefresh, onUpdateStatus }) {
  const [filter, setFilter] = useState('all');

  const filteredVehicles = vehicles.filter((v) => {
    if (filter === 'idle') return v.status === 'idle';
    if (filter === 'in-transit') return v.status === 'in-transit';
    return true;
  });

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
      {/* Header & Filter Controls */}
      <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-slate-100">Logistics Fleet Status</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {vehicles.length} Total Fleet
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitored vehicles across Rajasthan state logistics terminals
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All ({vehicles.length})
          </button>
          <button
            onClick={() => setFilter('idle')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'idle'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Idle / Available ({vehicles.filter((v) => v.status === 'idle').length})
          </button>
          <button
            onClick={() => setFilter('in-transit')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'in-transit'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            In-Transit ({vehicles.filter((v) => v.status === 'in-transit').length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Vehicle ID</th>
              <th className="py-3 px-4">Model & Reg No.</th>
              <th className="py-3 px-4">Current Terminal</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Max Capacity</th>
              <th className="py-3 px-4">Current Load</th>
              <th className="py-3 px-4">Payload Gauge</th>
              <th className="py-3 px-4">Driver</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {filteredVehicles.map((v) => {
              const utilPercent = v.maxCapacityKg > 0
                ? Math.round(((v.currentLoadKg || 0) / v.maxCapacityKg) * 100)
                : 0;

              return (
                <tr key={v.vehicleId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-orange-400">
                    {v.vehicleId}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{v.vehicleNumber}</div>
                    <div className="text-[10px] text-slate-400">{v.modelType}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      {v.currentLocationName || `District ${v.currentLocationDistrictId}`}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {v.status === 'idle' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" /> Idle (Free)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3 h-3 animate-spin" /> In-Transit
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {v.maxCapacityKg.toLocaleString()} kg
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-200">
                    {(v.currentLoadKg || 0).toLocaleString()} kg
                  </td>
                  <td className="py-3 px-4 min-w-[120px]">
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            utilPercent > 85
                              ? 'bg-red-500'
                              : utilPercent > 50
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${utilPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{utilPercent}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {v.driverName || 'Unassigned'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {v.status === 'in-transit' ? (
                      <button
                        onClick={() => onUpdateStatus && onUpdateStatus(v.vehicleId, 'idle')}
                        className="px-2.5 py-1 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      >
                        Reset to Idle
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Ready for dispatch</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>


    </div>
  );
}
