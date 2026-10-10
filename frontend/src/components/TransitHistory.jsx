import React, { useState } from 'react';
import {
  History,
  Package,
  Clock,
  CheckCircle2,
  RefreshCw,
  MapPin,
  ArrowRight,
  Truck,
  ChevronDown,
  XCircle
} from 'lucide-react';

function StatusBadge({ status }) {
  const map = {
    delivered: {
      cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Icon: CheckCircle2,
      label: 'Delivered'
    },
    'in-transit': {
      cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      Icon: RefreshCw,
      label: 'In-Transit'
    },
    assigned: {
      cls: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      Icon: Truck,
      label: 'Assigned'
    },
    queued: {
      cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      Icon: Clock,
      label: 'Queued'
    },
    pending: {
      cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      Icon: Clock,
      label: 'Pending'
    },
    cancelled: {
      cls: 'bg-red-500/10 text-red-400 border-red-500/20',
      Icon: XCircle,
      label: 'Cancelled'
    }
  };
  const conf = map[status] || map.pending;
  const Icon = conf.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${conf.cls}`}
    >
      <Icon className={`w-3 h-3 ${status === 'in-transit' ? 'animate-spin' : ''}`} />
      {conf.label}
    </span>
  );
}

export default function TransitHistory({ orders = [], loading = false }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-slate-100">Transit History</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              Last {orders.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Most recent dispatch records &mdash; vehicles allotted, cargo load, pickup and delivery points
          </p>
        </div>
      </div>

      {/* Table Head */}
      {orders.length > 0 && (
        <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <div className="col-span-2">Order No.</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Pickup Point</div>
          <div className="col-span-3">Vehicles Allotted (Load)</div>
          <div className="col-span-3">Delivery Points</div>
          <div className="col-span-1 text-right">Cargo</div>
        </div>
      )}

      {/* Rows */}
      <div className="divide-y divide-slate-800/70 max-h-[620px] overflow-y-auto">
        {loading && orders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Loading dispatch history...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No orders in history yet.
          </div>
        ) : (
          orders.map((o) => {
            const isOpen = expanded === o.orderId;
            const allDelivered = o.deliveredStops === o.totalStops && o.totalStops > 0;

            return (
              <div
                key={o.orderId}
                className={`transition-colors ${isOpen ? 'bg-orange-500/[0.06]' : 'hover:bg-slate-800/30'}`}
              >
                {/* Summary Row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : o.orderId)}
                  className="cursor-pointer px-4 py-3"
                >
                  <div className="grid grid-cols-12 gap-3 items-center">

                    {/* Order No */}
                    <div className="col-span-12 lg:col-span-2 flex items-center gap-2 min-w-0">
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-bold text-orange-400 truncate">{o.orderId}</div>
                        <div className="text-[10px] text-slate-500 truncate">{o.clientName}</div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-6 lg:col-span-1">
                      <StatusBadge status={o.status} />
                    </div>

                    {/* Pickup */}
                    <div className="col-span-6 lg:col-span-2 flex items-start gap-1.5 text-xs text-slate-300 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{o.pickup?.districtName}</div>
                        <div className="text-[10px] text-slate-500 truncate">{o.pickup?.address}</div>
                      </div>
                    </div>

                    {/* Vehicles */}
                    <div className="col-span-12 lg:col-span-3 flex flex-wrap gap-1.5">
                      {o.vehicles.length === 0 ? (
                        <span className="text-[11px] text-slate-500 italic">Not allocated</span>
                      ) : (
                        o.vehicles.map((v) => (
                          <span
                            key={v.vehicleId}
                            title={`${v.vehicleId} ${v.vehicleNumber || ''} • ${v.driverName || ''} • ${v.loadKg} kg of ${v.capacityKg || '?'} kg`}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-950/50 border border-blue-800/70 text-[10px] text-blue-300 font-mono font-semibold"
                          >
                            <Truck className="w-2.5 h-2.5" />
                            {v.vehicleId}
                            <span className="text-slate-400">·</span>
                            <span className="text-emerald-300">{v.loadKg}kg</span>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Delivery points */}
                    <div className="col-span-12 lg:col-span-3 flex flex-wrap items-center gap-1.5">
                      {o.destinations.length === 0 ? (
                        <span className="text-[11px] text-slate-500 italic">No stops</span>
                      ) : (
                        <>
                          {o.destinations.map((d) => (
                            <span
                              key={d.stopIndex}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                d.delivered
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
                              }`}
                            >
                              {d.districtName}
                            </span>
                          ))}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              allDelivered
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {o.deliveredStops}/{o.totalStops}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Cargo */}
                    <div className="col-span-12 lg:col-span-1 lg:text-right text-xs text-slate-300">
                      <span className="text-slate-500 text-[10px] lg:hidden">Cargo: </span>
                      <strong className="font-mono text-slate-100">{Number(o.totalWeightKg || 0).toLocaleString()} kg</strong>
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isOpen && (
                  <div className="px-4 pb-4 pl-11 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                      {/* Vehicles detail */}
                      <div className="md:col-span-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                          <Truck className="w-3 h-3" /> Vehicle Allocation Breakdown
                        </div>
                        {o.vehicles.length === 0 ? (
                          <p className="text-[11px] text-slate-500 italic">No vehicles were allocated to this order.</p>
                        ) : (
                          <div className="space-y-2">
                            {o.vehicles.map((v) => {
                              const pct = v.capacityKg ? Math.min(100, Math.round((v.loadKg / v.capacityKg) * 100)) : 0;
                              return (
                                <div key={v.vehicleId}>
                                  <div className="flex items-center justify-between text-[11px] mb-1">
                                    <span className="font-mono font-bold text-blue-300">
                                      {v.vehicleId}
                                      <span className="text-slate-500 font-normal ml-1.5">{v.vehicleNumber}</span>
                                    </span>
                                    <span className="text-slate-400">
                                      <strong className="text-emerald-300 font-mono">{v.loadKg} kg</strong>
                                      <span className="text-slate-500"> / {v.capacityKg ?? '?'} kg ({pct}%)</span>
                                    </span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">Driver: {v.driverName || '—'}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Order facts */}
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-[11px]">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                          <Package className="w-3 h-3" /> Order Summary
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Cargo</span>
                          <span className="font-mono text-slate-100">{Number(o.totalWeightKg || 0).toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Total Stops</span>
                          <span className="font-mono text-slate-100">{o.totalStops}</span>
                        </div>
                        {o.totalDistanceKm > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Distance</span>
                            <span className="font-mono text-slate-100">{o.totalDistanceKm} km</span>
                          </div>
                        )}
                        {o.estimatedTimeMinutes > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">ETA</span>
                            <span className="font-mono text-slate-100">{o.estimatedTimeMinutes} min</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">Placed</span>
                          <span className="text-slate-300">
                            {o.createdAt ? new Date(o.createdAt).toLocaleString() : '—'}
                          </span>
                        </div>
                        {o.completedAt && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Completed</span>
                            <span className="text-emerald-300">
                              {new Date(o.completedAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Full stop chain */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Route Flow</div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-950/60 text-orange-300 border border-orange-800">
                          PICKUP: {o.pickup?.districtName}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        {o.destinations.map((d, i) => (
                          <React.Fragment key={d.stopIndex}>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium border ${
                                d.delivered
                                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                  : 'bg-slate-800/80 text-slate-300 border-slate-700'
                              }`}
                            >
                              {d.districtName} · {d.weightKg} kg
                              {d.delivered && <CheckCircle2 className="w-3 h-3 inline ml-1" />}
                            </span>
                            {i < o.destinations.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-500" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
