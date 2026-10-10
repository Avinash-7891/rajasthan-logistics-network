import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Package,
  AlertCircle,
  RefreshCw,
  Compass,
  Navigation,
  Flag,
  Route,
  Search,
  X,
  Timer,
  Loader2
} from 'lucide-react';

export default function DriverDashboard({ districts = [] }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('VEH-01');
  const [transitOrders, setTransitOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryPlan, setDeliveryPlan] = useState(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [phase, setPhase] = useState({ kind: 'pickup', idx: 0 });
  const [stepRoute, setStepRoute] = useState(null);
  const [stepLoading, setStepLoading] = useState(false);
  const [showDeliver, setShowDeliver] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const countdownRef = useRef(null);
  const planRef = useRef(null);
  const phaseRef = useRef({ kind: 'pickup', idx: 0 });
  const advancingRef = useRef(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vRes, tRes] = await Promise.all([
        api.getVehicles(),
        api.getTransitOrders()
      ]);
      if (vRes.success) {
        setVehicles(vRes.data);
        if (user && user.assignedVehicleId) {
          setSelectedVehicleId(user.assignedVehicleId);
        } else if (vRes.data.length > 0) {
          setSelectedVehicleId((prev) => prev || vRes.data[0].vehicleId);
        }
      }
      if (tRes.success) {
        setTransitOrders(tRes.data);
      }
    } catch (err) {
      console.error('Failed to load driver data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentVehicle = vehicles.find((v) => v.vehicleId === selectedVehicleId) || vehicles[0];

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const clearTimer = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    advancingRef.current = false;
  };

  // Pick the plan belonging to the currently selected vehicle (fallback: first plan)
  const getActivePlan = () => {
    const plans = planRef.current?.plans;
    if (!plans || plans.length === 0) return null;
    return plans.find((p) => p.vehicleId === selectedVehicleId) || plans[0];
  };

  // Get a specific vehicle plan's step for the current phase.
  // phase = { kind: 'pickup' } -> the terminal->pickup leg
  // phase = { kind: 'delivery', idx: N } -> Nth delivery leg (0-based)
  const getStepForPhase = (plan, ph) => {
    if (!plan?.steps?.length || !ph) return null;
    if (ph.kind === 'pickup') {
      return plan.steps.find((s) => s.type === 'to-pickup' || s.type === 'at-pickup') || null;
    }
    const deliverySteps = plan.steps.filter((s) => s.type === 'to-delivery');
    return deliverySteps[ph.idx] || null;
  };

  // All vehicles' route for the current phase (list of rows)
  const activeRoutes = (deliveryPlan?.plans || [])
    .map((p) => ({ plan: p, step: getStepForPhase(p, phase) }))
    .filter((x) => x.step);

  // Total delivery legs (max across plans)
  const totalDeliveryLegs = (deliveryPlan?.plans || []).reduce((max, p) => {
    const cnt = (p.steps || []).filter((s) => s.type === 'to-delivery').length;
    return Math.max(max, cnt);
  }, 0);

  // Search orders
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      const res = await api.searchOrders(searchQuery.trim());
      if (res.success) setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // Show a phase (all vehicles together) with a single 10s countdown
  const showPhase = (ph) => {
    phaseRef.current = ph;
    setPhase(ph);
    setStepLoading(false);
    const firstStep = (planRef.current?.plans || [])
      .map((p) => getStepForPhase(p, ph))
      .find(Boolean);
    setStepRoute(firstStep || { kind: ph.kind });
    setCurrentStepIdx(ph.kind === 'pickup' ? 0 : ph.idx + 1);
    setShowDeliver(false);
    setCountdown(10);
    advancingRef.current = false;

    clearTimer();
    let count = 10;
    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count > 0) return;

      clearTimer();
      if (ph.kind === 'pickup') {
        // everyone reached pickup -> move to first delivery leg
        showPhase({ kind: 'delivery', idx: 0 });
      } else {
        setShowDeliver(true);
      }
    }, 1000);
  };

  // Load full delivery plan
  const loadDeliveryPlan = async (orderId) => {
    try {
      setStepLoading(true);
      setShowDeliver(false);
      setStepRoute(null);
      setCurrentStepIdx(0);
      clearTimer();

      const res = await api.getDeliveryPlan(orderId);
      if (res.success && res.hasPlan) {
        const plan = res;
        planRef.current = plan;
        setDeliveryPlan(plan);
        const steps = getActivePlan()?.steps;
        if (steps && steps.length > 0) {
          showPhase({ kind: 'pickup', idx: 0 });
        } else {
          setStepLoading(false);
          setStatusMessage('No steps found in delivery plan.');
        }
      } else {
        planRef.current = null;
        setDeliveryPlan(null);
        setStepLoading(false);
        setStatusMessage(res.message || 'No delivery plan available');
      }
    } catch (err) {
      console.error('Failed to load delivery plan:', err);
      setStepLoading(false);
    }
  };

  // Select order -> load plan
  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    setSearchResults(null);
    setSearchQuery('');
    setStepRoute(null);
    setShowDeliver(false);
    setCountdown(0);
    await loadDeliveryPlan(order.orderId);
  };

  // Mark delivered
  const handleDeliverStop = async (orderId, stopIndex) => {
    try {
      setDelivering(true);
      setStatusMessage(null);
      clearTimer();

      const res = await api.deliverStop(orderId, stopIndex);
      if (res.success) {
        loadData();

        // Sync selected order with fresh delivered flags from backend
        if (res.order) {
          setSelectedOrder((prev) => {
            if (!prev || prev.orderId !== orderId) return prev;
            return { ...prev, ...res.order };
          });
        }

        if (res.allDelivered) {
          setStatusMessage('All deliveries complete! Vehicles reset to idle. Order marked delivered.');
          clearTimer();
          planRef.current = null;
          phaseRef.current = { kind: 'pickup', idx: 0 };
          setDeliveryPlan(null);
          setSelectedOrder(null);
          setStepRoute(null);
          setShowDeliver(false);
          setCountdown(0);
          setTimeout(loadData, 800);
          return;
        }

        // Advance to next delivery leg for ALL vehicles
        const nextPhase = { kind: 'delivery', idx: phaseRef.current.idx + 1 };
        const hasNext = (deliveryPlan?.plans || []).some(
          (p) => getStepForPhase(p, nextPhase)
        );
        if (hasNext) {
          showPhase(nextPhase);
        } else {
          setStepRoute(null);
          setStatusMessage('All stops reached.');
        }
      }
    } catch (err) {
      alert(`Error marking stop delivered: ${err.message}`);
    } finally {
      setDelivering(false);
    }
  };

  // Done -> idle
  const handleDone = async () => {
    try {
      clearTimer();
      const res = await api.markVehicleDone(selectedVehicleId);
      if (res.success) {
        setStatusMessage(res.message);
        setStepRoute(null);
        setShowDeliver(false);
        setCountdown(0);
        planRef.current = null;
        setDeliveryPlan(null);
        await loadData();
      }
    } catch (err) {
      alert(`Error marking vehicle done: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-slate-100">Fleet Driver Transit Console</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sequential delivery route planning with real-time traffic optimization
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs">
          <Truck className="w-4 h-4 text-orange-400" />
          <span className="text-slate-400">Selected Vehicle:</span>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
          >
            {vehicles.map((v) => (
              <option key={v.vehicleId} value={v.vehicleId}>
                {v.vehicleId} ({v.modelType} - {v.status})
              </option>
            ))}
          </select>
          <button onClick={loadData} className="p-1 rounded text-slate-400 hover:text-slate-200" title="Refresh">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order No. (e.g., ORD-2648)"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSearchResults(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-md transition-colors flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>

        {searchResults && (
          <div className="mt-3 space-y-2">
            {searchResults.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">No orders found matching &quot;{searchQuery}&quot;</p>
            ) : (
              searchResults.map((order) => (
                <div
                  key={order.orderId}
                  onClick={() => handleSelectOrder(order)}
                  className="p-3 rounded-lg bg-slate-950/70 border border-slate-700 hover:border-orange-500/50 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-orange-400 text-sm">{order.orderId}</span>
                    <span className="text-xs text-slate-400 ml-2">{order.status}</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Vehicles: <strong className="text-slate-100">{(order.assignedVehicleIds || []).join(', ') || 'None'}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Transit List + Route */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Transit Orders */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-400" />
                  Active Transit Orders
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {transitOrders.length} order(s) currently in transit
                </p>
              </div>
              <button onClick={loadData} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/70 max-h-[400px] overflow-y-auto">
              {transitOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Truck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-300">No Active Transit Orders</p>
                  <p className="text-slate-500">All vehicles are idle or no orders dispatched yet.</p>
                </div>
              ) : (
                transitOrders.map((order) => {
                  const isSelected = selectedOrder && selectedOrder.orderId === order.orderId;
                  const vehicleIds = order.assignedVehicleIds || (order.assignedVehicleId ? [order.assignedVehicleId] : []);

                  return (
                    <div
                      key={order.orderId}
                      onClick={() => handleSelectOrder(order)}
                      className={`p-4 cursor-pointer transition-all hover:bg-slate-800/40 ${
                        isSelected ? 'bg-orange-500/10 border-l-4 border-orange-500' : ''
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm font-bold text-orange-400">{order.orderId}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase font-mono ${
                            order.status === 'in-transit'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                          Pickup: {order.pickupDistrictName || `District ${order.pickupDistrictId}`}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                        {order.destinations?.map((d, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                              d.delivered
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 line-through'
                                : 'bg-slate-800/80 text-slate-300 border-slate-700'
                            }`}
                          >
                            {d.districtName || `Dist ${d.districtId}`}
                          </span>
                        ))}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-slate-400">Vehicles Allocated:</span>
                        {vehicleIds.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {vehicleIds.map((vId) => (
                              <span key={vId} className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800 text-[11px] font-mono font-semibold">
                                {vId}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">None</span>
                        )}
                        <span className="text-[11px] text-slate-500 ml-auto">
                          Cargo: <strong className="text-slate-200">{order.totalWeightKg?.toLocaleString()} kg</strong>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sequential Route Display */}
          {selectedOrder && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Route className="w-4 h-4 text-orange-400" />
                  Delivery Route: {selectedOrder.orderId}
                </h3>
                {deliveryPlan && (
                  <span className="text-xs font-mono text-slate-400">
                    Step {currentStepIdx + 1} of {getActivePlan()?.totalSteps || '?'}
                  </span>
                )}
              </div>

              {stepLoading && (
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating optimal route with live traffic...</span>
                </div>
              )}

              {!stepLoading && activeRoutes.length > 0 && (
                <div className="space-y-4">
                  {/* Step Type Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      stepRoute.type === 'to-pickup' || stepRoute.type === 'at-pickup'
                        ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                    }`}>
                      {phase.kind === 'pickup' ? 'All Vehicles → Pickup Point'
                        : `Pickup → Delivery Hub (Leg ${phase.idx + 1} of ${totalDeliveryLegs})`}
                    </span>
                    {stepRoute.to?.stopIndex && (
                      <span className="text-xs text-slate-400">Stop #{stepRoute.to.stopIndex}</span>
                    )}
                    <span className="text-xs text-slate-400">{activeRoutes.length} vehicle(s) on this leg</span>
                  </div>

                  {/* Compact list: one row per vehicle */}
                  <div className="space-y-2">
                    {activeRoutes.map(({ plan, step }) => (
                      <div
                        key={plan.vehicleId}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800 text-[11px] font-mono font-bold shrink-0">
                            {plan.vehicleId}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-slate-200 shrink-0">
                            <span className="font-semibold">{step.from?.districtName}</span>
                            <ArrowRight className="w-3 h-3 text-orange-400 shrink-0" />
                            <span className="font-semibold">{step.to?.districtName}</span>
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono shrink-0">
                            {step.estimatedTimeMinutes || 0}m • {step.totalDistanceKm || 0}km
                          </span>
                        </div>

                        {phase.kind === 'delivery' && showDeliver && countdown <= 0 && (
                          <button
                            onClick={() => handleDeliverStop(selectedOrder.orderId, step.to?.stopIndex)}
                            disabled={delivering}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shrink-0"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{delivering ? '...' : 'Mark Delivered'}</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* From / To */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">From</div>
                      <div className="text-sm font-bold text-slate-100">{stepRoute.from?.districtName || 'Current Location'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">District #{stepRoute.from?.districtId || '-'}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">To</div>
                      <div className="text-sm font-bold text-slate-100">{stepRoute.to?.districtName || 'Destination'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">District #{stepRoute.to?.districtId || '-'}</div>
                    </div>
                  </div>

                  {/* Route Path */}
                  {stepRoute.pathDetails && stepRoute.pathDetails.length > 0 && (
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 mb-2">Optimal Path (Dijkstra + Traffic):</div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {stepRoute.pathDetails.map((node, i) => (
                          <React.Fragment key={`${node.districtId}-${i}`}>
                            <span className={`px-2.5 py-1 rounded text-xs font-medium border ${
                              i === 0
                                ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                                : i === stepRoute.pathDetails.length - 1
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                : 'bg-slate-800 text-slate-200 border-slate-700'
                            }`}>
                              {node.name}
                            </span>
                            {i < stepRoute.pathDetails.length - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Navigation className="w-3.5 h-3.5 text-orange-400" />
                      <span>ETA: <strong className="text-orange-400 font-mono">{stepRoute.estimatedTimeMinutes || 0} min</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Flag className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Distance: <strong className="text-slate-100 font-mono">{stepRoute.totalDistanceKm || 0} km</strong></span>
                    </div>
                    {stepRoute.loadKg > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Package className="w-3.5 h-3.5 text-blue-400" />
                        <span>Load: <strong className="text-slate-100 font-mono">{stepRoute.loadKg} kg</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Countdown or Deliver */}
                  {countdown > 0 && (
                    <div className={`p-4 rounded-xl border text-center ${
                      stepRoute.type === 'to-pickup' || stepRoute.type === 'at-pickup'
                        ? 'bg-blue-950/30 border-blue-800/50'
                        : 'bg-amber-950/30 border-amber-800/50'
                    }`}>
                      <div className={`flex items-center justify-center gap-2 ${
                        stepRoute.type === 'to-pickup' || stepRoute.type === 'at-pickup' ? 'text-blue-300' : 'text-amber-300'
                      }`}>
                        <Timer className="w-5 h-5" />
                        <span className="text-lg font-mono font-bold">{countdown}s</span>
                      </div>
                      <p className={`text-xs mt-1 ${
                        stepRoute.type === 'to-pickup' || stepRoute.type === 'at-pickup' ? 'text-blue-400/70' : 'text-amber-400/70'
                      }`}>
                        {stepRoute.type === 'to-pickup'
                          ? 'Heading to pickup point... Next route loads automatically'
                          : stepRoute.type === 'at-pickup'
                          ? 'At pickup point... Loading cargo'
                          : 'Route reached! Preparing deliver option...'}
                      </p>
                    </div>
                  )}

                  {showDeliver && countdown <= 0 && (
                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
                      <p className="text-xs text-emerald-300 mb-3 text-center">
                        Arrived at <strong>{stepRoute.to?.districtName}</strong>. Ready to deliver!
                      </p>
                      <button
                        onClick={() => handleDeliverStop(selectedOrder.orderId, stepRoute.to?.stopIndex)}
                        disabled={delivering}
                        className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{delivering ? 'Confirming...' : 'Mark Delivered'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!stepLoading && !stepRoute && (
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>No route available. Select an order from the list above.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Vehicle Status + Actions */}
        <div className="lg:col-span-5 space-y-4">
          {/* Vehicle Status */}
          {currentVehicle && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
              <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-400" />
                Vehicle Status
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle</span>
                  <span className="font-mono font-bold text-slate-100">{currentVehicle.vehicleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Model</span>
                  <span className="text-slate-200">{currentVehicle.modelType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Terminal</span>
                  <span className="text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {currentVehicle.currentLocationName || `District ${currentVehicle.currentLocationDistrictId}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  {currentVehicle.status === 'in-transit' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock className="w-3 h-3 animate-spin" /> In-Transit
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Idle
                    </span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Load</span>
                  <span className="font-mono text-slate-200">
                    {(currentVehicle.currentLoadKg || 0).toLocaleString()} / {currentVehicle.maxCapacityKg.toLocaleString()} kg
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Stops */}
          {selectedOrder && selectedOrder.destinations && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
              <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                Delivery Stops
              </h3>
              <div className="space-y-2">
                {selectedOrder.destinations.map((stop, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-slate-100">{stop.districtName || `District ${stop.districtId}`}</div>
                      <div className="text-[10px] text-slate-400">Stop {stop.stopIndex || i + 1} • {stop.weightKg} kg</div>
                    </div>
                    {stop.delivered ? (
                      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <span className="text-amber-400 text-xs font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Done Button */}
          {currentVehicle && currentVehicle.status === 'in-transit' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
              <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Flag className="w-4 h-4 text-orange-400" />
                Complete All Deliveries
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Click &quot;Done&quot; when all deliveries are complete. Vehicle resets to idle and next queued order auto-assigns.
              </p>
              <button
                onClick={handleDone}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center space-x-2 text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Done - Complete & Reset</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
