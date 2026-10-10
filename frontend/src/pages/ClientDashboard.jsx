import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Package,
  Plus,
  Trash2,
  Send,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  Warehouse,
  AlertCircle
} from 'lucide-react';


export default function ClientDashboard({ districts = [], warehouses = [] }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [pickupAddress, setPickupAddress] = useState('VKI Freight Terminal, Road No. 9, Jaipur');
  const [pickupDistrictId, setPickupDistrictId] = useState(1); // Default Jaipur
  const [isCustomCoord, setIsCustomCoord] = useState(false);
  const [customLat, setCustomLat] = useState('26.9200');
  const [customLon, setCustomLon] = useState('75.8000');

  // Multi-stop destination array
  const [destinations, setDestinations] = useState([
    { districtId: 6, warehouseId: 'WH-AJM-06', weightKg: 500 },
    { districtId: 2, warehouseId: 'WH-JDH-02', weightKg: 800 }
  ]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load client orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleAddStop = () => {
    // Default to next available district
    const usedIds = new Set(destinations.map((d) => d.districtId));
    const nextDistrict = districts.find((d) => !usedIds.has(d.districtId) && d.districtId !== pickupDistrictId) || districts[0];
    const matchingWh = warehouses.find((w) => w.districtId === (nextDistrict ? nextDistrict.districtId : 1));

    setDestinations([
      ...destinations,
      {
        districtId: nextDistrict ? nextDistrict.districtId : 3,
        warehouseId: matchingWh ? matchingWh.warehouseId : null,
        weightKg: 400
      }
    ]);
  };

  const handleRemoveStop = (index) => {
    if (destinations.length <= 1) return;
    setDestinations(destinations.filter((_, i) => i !== index));
  };

  const handleStopChange = (index, field, value) => {
    const updated = [...destinations];
    updated[index][field] = value;
    if (field === 'districtId') {
      const distId = Number(value);
      const wh = warehouses.find((w) => w.districtId === distId);
      updated[index].warehouseId = wh ? wh.warehouseId : null;
    }
    setDestinations(updated);
  };

  const totalCalculatedWeight = destinations.reduce(
    (acc, d) => acc + (Number(d.weightKg) || 0),
    0
  );

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      const payload = {
        pickupAddress,
        pickupDistrictId: Number(pickupDistrictId),
        destinations: destinations.map((d) => ({
          districtId: Number(d.districtId),
          warehouseId: d.warehouseId,
          weightKg: Number(d.weightKg)
        })),
        totalWeightKg: totalCalculatedWeight,
        customPickupCoord: isCustomCoord
          ? { latitude: parseFloat(customLat), longitude: parseFloat(customLon) }
          : null
      };

      const res = await api.createOrder(payload);
      if (res.success) {
        setSuccessMessage(res.message);
        loadOrders();
      }
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Package className="w-6 h-6 text-orange-400" />
          <h1 className="text-2xl font-black text-slate-100">Merchant Client Portal</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Place state-wide multi-stop cargo shipments. Automatically sequenced with Nearest Neighbor and dispatched to Best-Fit vehicles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Order Placement Wizard */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
              <Send className="w-4 h-4 text-orange-400" />
              <span>Book Multi-Stop Cargo Delivery</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Specify pickup hub and destination warehouses with weight splits
            </p>

            {successMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
              {/* Pickup Address & District */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                  1. Pickup Origin Point
                </span>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Pickup Street Address / Hub
                  </label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-orange-500"
                    placeholder="e.g. VKI Freight Terminal, Jaipur"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Origin District Hub
                  </label>
                  <select
                    value={pickupDistrictId}
                    onChange={(e) => setPickupDistrictId(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-orange-500"
                  >
                    {districts.map((d) => (
                      <option key={d.districtId} value={d.districtId}>
                        {d.name} (District #{d.districtId} - {d.zone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Temporary Custom GPS Node Toggle (Feature 11) */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCustomCoord}
                      onChange={(e) => setIsCustomCoord(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-[11px] font-medium">
                      Specify exact off-grid GPS coordinates (Dynamic Graph Node)
                    </span>
                  </label>

                  {isCustomCoord && (
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2">
                      <div>
                        <label className="block text-[10px] text-slate-400">Latitude</label>
                        <input
                          type="text"
                          value={customLat}
                          onChange={(e) => setCustomLat(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs"
                          placeholder="26.9200"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Longitude</label>
                        <input
                          type="text"
                          value={customLon}
                          onChange={(e) => setCustomLon(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs"
                          placeholder="75.8000"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-Stop Destinations */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                    2. Delivery Destinations (Multi-Stop)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="flex items-center space-x-1 px-2 py-1 rounded bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-500/30 transition-all font-semibold text-[11px]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Stop</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {destinations.map((stop, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-wrap items-center gap-2"
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-orange-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>

                      <div className="flex-1 min-w-[140px]">
                        <label className="block text-[10px] text-slate-400 mb-0.5">District</label>
                        <select
                          value={stop.districtId}
                          onChange={(e) => handleStopChange(idx, 'districtId', Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
                        >
                          {districts.map((d) => (
                            <option key={d.districtId} value={d.districtId}>
                              {d.name} (#{d.districtId})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <label className="block text-[10px] text-slate-400 mb-0.5">Weight (kg)</label>
                        <input
                          type="number"
                          value={stop.weightKg}
                          onChange={(e) => handleStopChange(idx, 'weightKg', Number(e.target.value))}
                          min="10"
                          max="15000"
                          required
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono focus:outline-none"
                        />
                      </div>

                      {destinations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(idx)}
                          className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors self-end mb-0.5"
                          title="Remove stop"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Total Cargo Load:</span>
                  <span className="font-mono font-bold text-orange-400 text-sm">
                    {totalCalculatedWeight.toLocaleString()} kg
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <span>{submitting ? 'Optimizing & Dispatching...' : 'Dispatch Shipment with Best-Fit Vehicle'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Right Col: Client Order History & Tracking */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">Your Shipments</h3>
                <p className="text-xs text-slate-400">Track active deliveries, assigned fleet, and ETAs</p>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {orders.length} orders
              </span>
            </div>

            <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/50 rounded-xl border border-slate-800">
                  No shipments placed yet. Use the form on the left to dispatch your first cargo!
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-orange-400 text-sm">
                        {ord.orderId}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] uppercase font-mono ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : ord.status === 'in-transit' || ord.status === 'assigned'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="text-slate-300 space-y-1">
                      <p className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>Pickup: <strong className="text-slate-200">{ord.pickupAddress}</strong></span>
                      </p>
                      <div className="pl-5 text-[11px] space-y-1">
                        {ord.destinations.map((dest, i) => (
                          <div key={i} className="flex items-center justify-between text-slate-400">
                            <span>
                              Stop {i + 1}: <strong className="text-slate-300">{dest.districtName}</strong> ({dest.weightKg} kg)
                            </span>
                            {dest.delivered ? (
                              <span className="text-emerald-400 font-semibold">✓ Delivered</span>
                            ) : (
                              <span className="text-amber-400">En Route</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center space-x-3">
                        <span>Vehicle: <strong className="text-slate-200 font-mono">{ord.assignedVehicleId || 'Pending Queue'}</strong></span>
                        <span>ETA: <strong className="text-orange-400 font-mono">{ord.route?.estimatedTimeMinutes || '~'} min</strong></span>
                      </div>
                      <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
