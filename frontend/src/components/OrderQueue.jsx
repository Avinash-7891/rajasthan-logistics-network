import React from 'react';
import { Package, Clock, CheckCircle2, AlertCircle, ArrowRight, Play, RefreshCw } from 'lucide-react';


export default function OrderQueue({ orders = [], onTriggerQueue, onSelectOrder, selectedOrderId }) {
  const pendingCount = orders.filter((o) => o.status === 'queued' || o.status === 'pending').length;
  const activeCount = orders.filter((o) => o.status === 'in-transit' || o.status === 'assigned').length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-slate-100">Deliveries & Pending Queue</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              {pendingCount} Queued
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Orders processed via Best-Fit Vehicle matching and Nearest Neighbor route optimization
          </p>
        </div>

        <button
          onClick={onTriggerQueue}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white shadow-sm transition-all"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Process Pending Queue</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-slate-800/70 max-h-[500px] overflow-y-auto">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No active orders recorded yet. Use the Client Dashboard to create a multi-stop delivery!
          </div>
        ) : (
          orders.map((order) => {
            const isSelected = selectedOrderId === order.orderId;
            const isQueued = order.status === 'queued' || order.status === 'pending';
            const isInTransit = order.status === 'in-transit' || order.status === 'assigned';
            const isDelivered = order.status === 'delivered';

            return (
              <div
                key={order.orderId}
                onClick={() => onSelectOrder && onSelectOrder(order)}
                className={`p-4 transition-colors cursor-pointer hover:bg-slate-800/40 ${
                  isSelected ? 'bg-orange-500/10 border-l-4 border-orange-500' : ''
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-orange-400">
                      {order.orderId}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">
                      {order.clientName || 'Merchant'}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isQueued && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3 h-3" /> Queued (Awaiting Vehicle)
                      </span>
                    )}
                    {isInTransit && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <RefreshCw className="w-3 h-3 animate-spin" /> In-Transit ({order.assignedVehicleId})
                      </span>
                    )}
                    {isDelivered && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Delivered
                      </span>
                    )}
                  </div>
                </div>

                {/* Routing & Stops Flow */}
                <div className="flex items-center flex-wrap gap-2 text-xs text-slate-300 my-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                    Pickup: {order.pickupDistrictName || `District ${order.pickupDistrictId}`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                  {order.destinations && order.destinations.map((d, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        d.delivered
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 line-through'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      Stop {idx + 1}: {d.districtName || `Dist ${d.districtId}`} ({d.weightKg} kg)
                    </span>
                  ))}
                </div>

                {/* Metrics Footer */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/40">
                  <div className="flex items-center space-x-3">
                    <span>Cargo: <strong className="text-slate-200">{order.totalWeightKg} kg</strong></span>
                    {order.route && order.route.estimatedTimeMinutes && (
                      <span>ETA: <strong className="text-slate-200">{order.route.estimatedTimeMinutes} min</strong></span>
                    )}
                    {order.route && order.route.totalDistanceKm && (
                      <span>Distance: <strong className="text-slate-200">{order.route.totalDistanceKm} km</strong></span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>


    </div>
  );
}
