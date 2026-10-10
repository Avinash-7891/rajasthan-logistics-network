import React, { useState } from 'react';
import {
  Compass,
  Cpu,
  Share2,
  GitFork,
  ShieldAlert,
  Grid,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

export default function NetworkAlgorithmsPanel({
  districts = [],
  onRouteCalculated,
  onHighlightBridges,
  onHighlightMst,
  onTrafficSimulated
}) {
  const [activeTab, setActiveTab] = useState('dijkstra');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Inputs
  const [sourceId, setSourceId] = useState(1); // Jaipur
  const [targetId, setTargetId] = useState(2); // Jodhpur

  // Results
  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [bfsResult, setBfsResult] = useState(null);
  const [dsuResult, setDsuResult] = useState(null);
  const [mstResult, setMstResult] = useState(null);
  const [tarjanResult, setTarjanResult] = useState(null);
  const [floydResult, setFloydResult] = useState(null);

  // 1. Run Dijkstra
  const handleRunDijkstra = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getShortestRoute(sourceId, targetId);
      setDijkstraResult(res);
      if (onRouteCalculated) {
        onRouteCalculated(res.path || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Run BFS
  const handleRunBfs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getReachableDistricts(sourceId);
      setBfsResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Run DSU Connectivity
  const handleRunDsu = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getConnectivity();
      setDsuResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Run Kruskal's MST
  const handleRunMst = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMST();
      setMstResult(res);
      if (onHighlightMst) onHighlightMst(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Run Tarjan's Bridges
  const handleRunTarjan = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCriticalRoads();
      setTarjanResult(res);
      if (onHighlightBridges) onHighlightBridges(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Run Floyd-Warshall lookup
  const handleRunFloyd = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAllPairsDistances(sourceId, targetId);
      setFloydResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 7. Simulate Live Traffic
  const handleSimulateTraffic = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.simulateTraffic();
      if (onTrafficSimulated) onTrafficSimulated();
      // Re-run dijkstra if previously run
      if (dijkstraResult) {
        handleRunDijkstra();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-slate-100">Algorithm Control Center</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test individual graph algorithms and observe their execution on Rajasthan&apos;s road network
          </p>
        </div>

        <button
          onClick={handleSimulateTraffic}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Simulate Traffic Delays</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('dijkstra')}
          className={`px-4 py-2.5 font-medium whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'dijkstra'
              ? 'border-orange-500 text-orange-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Fastest Route (Dijkstra)
        </button>
        <button
          onClick={() => setActiveTab('tarjan')}
          className={`px-4 py-2.5 font-medium whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'tarjan'
              ? 'border-red-500 text-red-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Critical Bridges (Tarjan)
        </button>
        <button
          onClick={() => setActiveTab('mst')}
          className={`px-4 py-2.5 font-medium whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'mst'
              ? 'border-emerald-500 text-emerald-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Backbone MST (Kruskal)
        </button>
        <button
          onClick={() => setActiveTab('dsu')}
          className={`px-4 py-2.5 font-medium whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'dsu'
              ? 'border-blue-500 text-blue-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Connectivity (DSU)
        </button>
        <button
          onClick={() => setActiveTab('bfs')}
          className={`px-4 py-2.5 font-medium whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'bfs'
              ? 'border-purple-500 text-purple-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Reachable Hubs (BFS)
        </button>
        <button
          onClick={() => setActiveTab('floyd')}
          className={`px-4 py-2.5 font-medium whitespace-nowrap transition-all border-b-2 ${
            activeTab === 'floyd'
              ? 'border-cyan-500 text-cyan-400 bg-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          All-Pairs Matrix (Floyd)
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5 space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. DIJKSTRA TAB */}
        {activeTab === 'dijkstra' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Source District
                </label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                >
                  {districts.map((d) => (
                    <option key={d.districtId} value={d.districtId}>
                      {d.name} (District #{d.districtId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Destination District
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                >
                  {districts.map((d) => (
                    <option key={d.districtId} value={d.districtId}>
                      {d.name} (District #{d.districtId})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleRunDijkstra}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-md transition-colors flex items-center justify-center space-x-2"
            >
              <Compass className="w-4 h-4" />
              <span>{loading ? 'Computing...' : 'Compute Fastest Delivery Route'}</span>
            </button>

            {dijkstraResult && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-200 text-sm">
                      {dijkstraResult.sourceDistrict}
                    </span>
                    <ArrowRight className="w-4 h-4 text-orange-400" />
                    <span className="font-bold text-slate-200 text-sm">
                      {dijkstraResult.targetDistrict}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-300">
                    <span>Travel Time: <strong className="text-orange-400 font-mono text-sm">{dijkstraResult.totalTimeMinutes} min</strong></span>
                    <span>Total Distance: <strong className="text-slate-100 font-mono">{dijkstraResult.totalDistanceKm} km</strong></span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Optimal District Sequence:</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {dijkstraResult.pathDetails.map((node, i) => (
                      <React.Fragment key={node.districtId}>
                        <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 font-medium">
                          {node.name}
                        </span>
                        {i < dijkstraResult.pathDetails.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. TARJAN'S TAB */}
        {activeTab === 'tarjan' && (
          <div className="space-y-4">
            <button
              onClick={handleRunTarjan}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md transition-colors flex items-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{loading ? 'Computing...' : 'Find Critical Bridge Roads'}</span>
            </button>

            {tarjanResult && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-300">
                    Vulnerable Single Points of Failure Detected:
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-red-950 text-red-300 border border-red-800">
                    {tarjanResult.criticalBridgesCount} Critical Bridges
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tarjanResult.criticalRoads.map((bridge, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-red-950/20 border border-red-900/50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">
                          {bridge.fromName} ⟷ {bridge.toName}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {bridge.roadType} ({bridge.distanceKm} km)
                        </span>
                      </div>
                      <span className="text-[10px] text-red-400 px-2 py-0.5 rounded bg-red-950/80 border border-red-800">
                        Bridge #{bridge.roadId}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. KRUSKAL'S MST TAB */}
        {activeTab === 'mst' && (
          <div className="space-y-4">
            <button
              onClick={handleRunMst}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors flex items-center space-x-2"
            >
              <GitFork className="w-4 h-4" />
              <span>{loading ? 'Computing...' : 'Compute Minimum Spanning Tree'}</span>
            </button>

            {mstResult && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <span>Backbone Cost: <strong className="text-emerald-400 font-mono text-sm">{mstResult.totalCostKm} km</strong></span>
                    <span>Selected Edges: <strong className="text-slate-100 font-mono">{mstResult.edgesCount} / {mstResult.expectedEdges}</strong></span>
                  </div>
                  <span className="px-2 py-0.5 rounded font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Network Fully Connected
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {mstResult.mstEdges.map((e, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px]"
                    >
                      <span className="text-slate-200">
                        {e.fromName} ⟷ {e.toName}
                      </span>
                      <span className="text-slate-400 font-mono">{e.distanceKm} km</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. DSU CONNECTIVITY TAB */}
        {activeTab === 'dsu' && (
          <div className="space-y-4">
            <button
              onClick={handleRunDsu}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-colors flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{loading ? 'Computing...' : 'Verify Network Connectivity'}</span>
            </button>

            {dsuResult && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    {dsuResult.isFullyConnected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="font-semibold text-slate-200">
                      {dsuResult.isFullyConnected
                        ? 'Logistics Grid is 100% Interconnected'
                        : 'Network has Disconnected Partitions'}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {dsuResult.totalComponents} Component{dsuResult.totalComponents > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {dsuResult.components.map((group, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[11px] font-semibold text-orange-400 block mb-1">
                        Component Cluster #{idx + 1} ({group.length} Districts):
                      </span>
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {group.map((d) => (
                          <span
                            key={d.districtId}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                          >
                            {d.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. BFS TAB */}
        {activeTab === 'bfs' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Source Terminal District
              </label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(Number(e.target.value))}
                className="w-full sm:w-72 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
              >
                {districts.map((d) => (
                  <option key={d.districtId} value={d.districtId}>
                    {d.name} (District #{d.districtId})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunBfs}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-colors flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{loading ? 'Computing...' : 'Discover Reachable Terminals'}</span>
            </button>

            {bfsResult && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-300">
                    Reachable from {bfsResult.sourceDistrictName}:
                  </span>
                  <span className="font-mono font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-950 border border-purple-800">
                    {bfsResult.count} / {districts.length} Districts Reachable
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {bfsResult.reachableDistricts.map((d) => (
                    <span
                      key={d.districtId}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px] border border-slate-700"
                    >
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. FLOYD-WARSHALL TAB */}
        {activeTab === 'floyd' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  From District
                </label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                >
                  {districts.map((d) => (
                    <option key={d.districtId} value={d.districtId}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  To District
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                >
                  {districts.map((d) => (
                    <option key={d.districtId} value={d.districtId}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleRunFloyd}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-colors flex items-center space-x-2"
            >
              <Grid className="w-4 h-4" />
              <span>{loading ? 'Computing...' : 'Query All-Pairs Distance'}</span>
            </button>

            {floydResult && (
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-300">{floydResult.fromDistrict}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold text-slate-300">{floydResult.toDistrict}</span>
                </div>
                <p className="text-slate-400">
                  Precomputed All-Pairs Transit Time:
                  <strong className="text-cyan-400 text-sm font-mono ml-2">
                    {floydResult.distanceMinutes} minutes
                  </strong>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
