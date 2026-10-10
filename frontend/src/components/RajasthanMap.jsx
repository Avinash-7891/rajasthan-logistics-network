import React, { useState, useMemo } from 'react';
import { ShieldAlert, GitFork, Truck, Warehouse, Eye, Layers, Compass, Zap } from 'lucide-react';

export default function RajasthanMap({
  districts = [],
  roads = [],
  warehouses = [],
  highlightBridges = true,
  highlightMst = false,
  activeRoute = null, // array of district IDs [1, 6, 2, ...]
  onSelectDistrict = null,
  selectedDistrict = null
}) {
  const [showWarehouses, setShowWarehouses] = useState(true);
  const [showCriticalBridges, setShowCriticalBridges] = useState(highlightBridges);
  const [showMstEdges, setShowMstEdges] = useState(highlightMst);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [hoveredRoad, setHoveredRoad] = useState(null);

  // Rajasthan Bounding Coordinates for projection
  const bounds = {
    minLon: 70.4,
    maxLon: 78.5,
    minLat: 23.3,
    maxLat: 30.1
  };

  const mapWidth = 980;
  const mapHeight = 820;
  const padding = 55;

  // Convert (lat, lon) to (x, y) on SVG
  const project = (lat, lon) => {
    const x = padding + ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * (mapWidth - 2 * padding);
    // Lat increases northwards, SVG Y increases downwards
    const y = mapHeight - padding - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * (mapHeight - 2 * padding);
    return { x, y };
  };

  const districtCoordsMap = useMemo(() => {
    const map = new Map();
    for (const d of districts) {
      map.set(d.districtId, {
        ...d,
        ...project(d.latitude, d.longitude)
      });
    }
    return map;
  }, [districts]);

  const warehouseDistrictSet = useMemo(() => {
    return new Set(warehouses.map((w) => w.districtId));
  }, [warehouses]);

  // Check if a road is part of the active route path
  const isRoadInActiveRoute = (u, v) => {
    if (!activeRoute || activeRoute.length < 2) return false;
    for (let i = 0; i < activeRoute.length - 1; i++) {
      const a = activeRoute[i];
      const b = activeRoute[i + 1];
      if ((a === u && b === v) || (a === v && b === u)) return true;
    }
    return false;
  };

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden">
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950/80 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Compass className="w-4 h-4 text-orange-400" />
            <span>Rajasthan Logistics Grid</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            ({districts.length} Districts | {roads.length} Arterial Roads)
          </span>
        </div>

        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCriticalBridges(!showCriticalBridges)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all ${
              showCriticalBridges
                ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm shadow-red-500/10'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Critical Bridges (Tarjan)</span>
          </button>

          <button
            onClick={() => setShowMstEdges(!showMstEdges)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all ${
              showMstEdges
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>MST Backbone (Kruskal)</span>
          </button>

          <button
            onClick={() => setShowWarehouses(!showWarehouses)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all ${
              showWarehouses
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>Warehouses</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-2">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-auto min-w-[750px] max-h-[700px] select-none"
        >
          <defs>
            {/* Gradients & Filters */}
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.9" />
            </filter>
            <filter id="glow-mst" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#10b981" floodOpacity="0.9" />
            </filter>
            <filter id="glow-route" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.95" />
            </filter>
          </defs>

          {/* Background grid lines for spatial reference */}
          <g opacity="0.08" stroke="#cbd5e1" strokeWidth="0.5">
            {[...Array(10)].map((_, i) => (
              <line key={`gx-${i}`} x1={i * 100} y1="0" x2={i * 100} y2={mapHeight} strokeDasharray="3 3" />
            ))}
            {[...Array(9)].map((_, i) => (
              <line key={`gy-${i}`} x1="0" y1={i * 100} x2={mapWidth} y2={i * 100} strokeDasharray="3 3" />
            ))}
          </g>

          {/* 1. Roads (Edges) */}
          <g className="roads-layer">
            {roads.map((road) => {
              const uCoord = districtCoordsMap.get(road.fromDistrictId);
              const vCoord = districtCoordsMap.get(road.toDistrictId);
              if (!uCoord || !vCoord) return null;

              const isCritical = road.isCriticalBridge;
              const isMst = road.isMstSelected;
              const isRoute = isRoadInActiveRoute(road.fromDistrictId, road.toDistrictId);

              let strokeColor = '#334155'; // default slate-700
              let strokeWidth = 2;
              let strokeDash = undefined;
              let filter = undefined;

              if (showCriticalBridges && isCritical) {
                strokeColor = '#ef4444'; // Red for Tarjan Bridge
                strokeWidth = 4.5;
                strokeDash = '6 3';
                filter = 'url(#glow-red)';
              } else if (showMstEdges && isMst) {
                strokeColor = '#10b981'; // Emerald for MST
                strokeWidth = 3.5;
                filter = 'url(#glow-mst)';
              }

              if (isRoute) {
                strokeColor = '#f59e0b'; // Amber for Active Route
                strokeWidth = 5.5;
                strokeDash = undefined;
                filter = 'url(#glow-route)';
              }

              return (
                <g key={`road-${road.roadId || `${road.fromDistrictId}-${road.toDistrictId}`}`}>
                  {/* Invisible broader line for easy hover */}
                  <line
                    x1={uCoord.x}
                    y1={uCoord.y}
                    x2={vCoord.x}
                    y2={vCoord.y}
                    stroke="transparent"
                    strokeWidth="14"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredRoad(road)}
                    onMouseLeave={() => setHoveredRoad(null)}
                  />
                  {/* Visible Line */}
                  <line
                    x1={uCoord.x}
                    y1={uCoord.y}
                    x2={vCoord.x}
                    y2={vCoord.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDash}
                    filter={filter}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}
          </g>

          {/* 2. District Nodes */}
          <g className="districts-layer">
            {districts.map((d) => {
              const coord = districtCoordsMap.get(d.districtId);
              if (!coord) return null;

              const hasWarehouse = warehouseDistrictSet.has(d.districtId);
              const isSelected = selectedDistrict === d.districtId;
              const isStart = activeRoute && activeRoute[0] === d.districtId;
              const isEnd = activeRoute && activeRoute[activeRoute.length - 1] === d.districtId;
              const inActiveRoute = activeRoute && activeRoute.includes(d.districtId);

              let fillColor = '#1e293b'; // slate-800
              let strokeColor = '#64748b'; // slate-500
              let radius = 6;

              if (hasWarehouse && showWarehouses) {
                fillColor = '#ea580c'; // orange
                strokeColor = '#fed7aa';
                radius = 8.5;
              }

              if (inActiveRoute) {
                fillColor = '#3b82f6';
                strokeColor = '#93c5fd';
                radius = 8;
              }

              if (isStart) {
                fillColor = '#10b981'; // green for start
                strokeColor = '#a7f3d0';
                radius = 11;
              } else if (isEnd) {
                fillColor = '#f59e0b'; // amber for end
                strokeColor = '#fde68a';
                radius = 11;
              }

              if (isSelected) {
                fillColor = '#8b5cf6'; // purple selected
                strokeColor = '#ede9fe';
                radius = 12;
              }

              return (
                <g
                  key={`district-${d.districtId}`}
                  className="cursor-pointer group"
                  onClick={() => onSelectDistrict && onSelectDistrict(d)}
                  onMouseEnter={() => setHoveredDistrict(d)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                >
                  {/* Outer pulse if warehouse or selected */}
                  {(hasWarehouse || isSelected || isStart) && (
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={radius + 4}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="1.5"
                      opacity="0.5"
                      className="animate-pulse"
                    />
                  )}

                  {/* Core Node Circle */}
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={radius}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth="2"
                    className="transition-transform duration-200"
                    style={{ transform: 'scale(1)' }}
                  />

                  {/* Label Text */}
                  <text
                    x={coord.x}
                    y={coord.y - (radius + 4)}
                    textAnchor="middle"
                    fill={isSelected || inActiveRoute ? '#f8fafc' : '#94a3b8'}
                    fontSize={hasWarehouse ? '11px' : '9.5px'}
                    fontWeight={hasWarehouse || isSelected ? '700' : '500'}
                    className="pointer-events-none drop-shadow-md"
                  >
                    {d.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredDistrict && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 border border-slate-700/80 rounded-xl p-2.5 shadow-xl text-xs backdrop-blur-md transition-all"
            style={{
              left: `${Math.min(project(hoveredDistrict.latitude, hoveredDistrict.longitude).x / (mapWidth / 100), 80)}%`,
              top: `${Math.max(10, (project(hoveredDistrict.latitude, hoveredDistrict.longitude).y / (mapHeight / 100)) - 12)}%`
            }}
          >
            <div className="flex items-center space-x-2 font-bold text-orange-400">
              <Warehouse className="w-3.5 h-3.5" />
              <span>{hoveredDistrict.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                ID #{hoveredDistrict.districtId}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">Zone: {hoveredDistrict.zone} Rajasthan</p>
            <p className="text-slate-500 text-[10px] font-mono">
              ({hoveredDistrict.latitude.toFixed(4)}° N, {hoveredDistrict.longitude.toFixed(4)}° E)
            </p>
            {warehouseDistrictSet.has(hoveredDistrict.districtId) && (
              <span className="mt-1 inline-block text-[10px] text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-1.5 py-0.5 rounded">
                Freight Hub Terminal Active
              </span>
            )}
          </div>
        )}

        {hoveredRoad && (
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-slate-950/95 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs backdrop-blur-md">
            <p className="font-semibold text-slate-200">{hoveredRoad.name || `Road ${hoveredRoad.roadId}`}</p>
            <div className="flex items-center space-x-3 text-slate-400 text-[11px] mt-1">
              <span>Distance: <strong className="text-slate-200">{hoveredRoad.distanceKm} km</strong></span>
              <span>Speed: <strong className="text-slate-200">{hoveredRoad.averageSpeedKmph || 65} km/h</strong></span>
              <span>Type: <strong className="text-slate-200">{hoveredRoad.roadType}</strong></span>
            </div>
            {hoveredRoad.isCriticalBridge && (
              <div className="mt-1.5 flex items-center space-x-1.5 text-red-400 text-[11px] font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Critical Bridge Road (Disconnection Vulnerability)</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500 border border-orange-200"></span>
            <span>Warehouse Hub</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-700 border border-slate-500"></span>
            <span>District Terminal</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-5 h-1 bg-red-500 rounded"></span>
            <span>Critical Bridge (Tarjan)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-5 h-1 bg-emerald-500 rounded"></span>
            <span>MST Backbone (Kruskal)</span>
          </div>
          {activeRoute && (
            <div className="flex items-center space-x-1.5">
              <span className="w-5 h-1.5 bg-amber-400 rounded"></span>
              <span className="text-amber-300 font-semibold">Current Active Route</span>
            </div>
          )}
        </div>
        <span className="text-slate-500 text-[10px]">
          Click any district to view routes or dispatch orders
        </span>
      </div>
    </div>
  );
}
