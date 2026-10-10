const District = require('../models/District');
const Road = require('../models/Road');
const TrafficData = require('../models/TrafficData');
const {
  bfsReachable,
  dijkstraFastestRoute,
  checkNetworkConnectivity,
  kruskalMST,
  floydWarshall,
  tarjanBridges
} = require('../utils/algorithms');

// Helper to assemble weighted edges incorporating speeds and live traffic multipliers
async function getNetworkEdgesWithTraffic() {
  const [roads, traffic] = await Promise.all([
    Road.find(),
    TrafficData.find()
  ]);

  const trafficMap = new Map();
  for (const t of traffic) {
    trafficMap.set(t.roadId, t);
  }

  return roads.map((r) => {
    const traf = trafficMap.get(r.roadId);
    const multiplier = traf ? traf.congestionMultiplier : 1.0;
    const baseTimeHours = r.distanceKm / (r.averageSpeedKmph || 60);
    const baseTimeMinutes = baseTimeHours * 60;
    // Effective travel time in minutes considering traffic congestion
    const travelTimeMinutes = Math.round(baseTimeMinutes * multiplier);

    return {
      roadId: r.roadId,
      u: r.fromDistrictId,
      v: r.toDistrictId,
      fromDistrictId: r.fromDistrictId,
      toDistrictId: r.toDistrictId,
      distanceKm: r.distanceKm,
      averageSpeedKmph: r.averageSpeedKmph,
      roadType: r.roadType,
      name: r.name,
      congestionLevel: traf ? traf.congestionLevel : 'Normal',
      congestionMultiplier: multiplier,
      travelTimeMinutes,
      weight: travelTimeMinutes,
      cost: r.distanceKm
    };
  });
}

// 1. Shortest Route (Dijkstra - Problem 2)
exports.getFastestRoute = async (req, res, next) => {
  try {
    const { source, destination } = req.query;
    const s = Number(source);
    const t = destination ? Number(destination) : null;

    if (!s) {
      return res.status(400).json({ success: false, message: 'Source district is required' });
    }

    const [districts, edges] = await Promise.all([
      District.find().sort({ districtId: 1 }),
      getNetworkEdgesWithTraffic()
    ]);

    const n = districts.length;
    const result = dijkstraFastestRoute(n, edges, s, t);

    // Map district names to path
    const districtMap = new Map(districts.map((d) => [d.districtId, d]));
    const pathDetails = result.path.map((id) => ({
      districtId: id,
      name: districtMap.get(id) ? districtMap.get(id).name : `District ${id}`,
      latitude: districtMap.get(id) ? districtMap.get(id).latitude : null,
      longitude: districtMap.get(id) ? districtMap.get(id).longitude : null
    }));

    res.json({
      success: true,
      algorithm: 'Dijkstra (Iterative Min-Heap) - Problem 2',
      sourceDistrict: districtMap.get(s) ? districtMap.get(s).name : `District ${s}`,
      targetDistrict: t && districtMap.get(t) ? districtMap.get(t).name : null,
      reachable: result.reachable,
      totalTimeMinutes: result.cost,
      totalDistanceKm: result.totalDistanceKm,
      path: result.path,
      pathDetails,
      pathEdges: result.pathEdges,
      distancesFromSource: result.dist,
      explanation: 'Uses a priority-queue (Min-Heap) relaxation strategy to discover the mathematically guaranteed fastest delivery trajectory across Rajasthan while factoring in dynamic traffic congestion delays.'
    });
  } catch (err) {
    next(err);
  }
};

// 2. Reachable Districts (BFS - Problem 1)
exports.getReachableDistricts = async (req, res, next) => {
  try {
    const s = Number(req.params.source || req.query.source || 1);
    const [districts, edges] = await Promise.all([
      District.find(),
      Road.find()
    ]);

    const n = districts.length;
    const result = bfsReachable(n, edges, s);
    const districtMap = new Map(districts.map((d) => [d.districtId, d]));

    const reachableWithNames = result.reachableDistricts.map((id) => ({
      districtId: id,
      name: districtMap.get(id) ? districtMap.get(id).name : `District ${id}`
    }));

    res.json({
      success: true,
      algorithm: 'Breadth-First Search (Iterative Queue) - Problem 1',
      sourceDistrictId: s,
      sourceDistrictName: districtMap.get(s) ? districtMap.get(s).name : `District ${s}`,
      count: result.count,
      reachableDistricts: reachableWithNames,
      explanation: 'Uses iterative queue-based BFS to explore district reachability level-by-level, verifying which logistics terminals can receive shipments from this source.'
    });
  } catch (err) {
    next(err);
  }
};

// 3. Network Connectivity Check (DSU - Problem 3)
exports.checkConnectivity = async (req, res, next) => {
  try {
    const [districts, edges] = await Promise.all([
      District.find(),
      Road.find()
    ]);

    const n = districts.length;
    const result = checkNetworkConnectivity(n, edges);
    const districtMap = new Map(districts.map((d) => [d.districtId, d]));

    const namedComponents = result.components.map((group) =>
      group.map((id) => ({
        districtId: id,
        name: districtMap.get(id) ? districtMap.get(id).name : `District ${id}`
      }))
    );

    res.json({
      success: true,
      algorithm: 'Disjoint Set Union (DSU with Two-Pass Path Compression & Rank) - Problem 3',
      isFullyConnected: result.isFullyConnected,
      totalComponents: result.totalComponents,
      components: namedComponents,
      explanation: 'Employs an iterative Disjoint Set Union (Union-Find) with path compression and union-by-rank to group districts into connected components in near-linear O(alpha(N)) time.'
    });
  } catch (err) {
    next(err);
  }
};

// 4. Minimum Cost Network (Kruskal's MST - Problem 4)
exports.getMinimumSpanningTree = async (req, res, next) => {
  try {
    const [districts, edges] = await Promise.all([
      District.find().sort({ districtId: 1 }),
      Road.find()
    ]);

    const n = districts.length;
    const result = kruskalMST(n, edges);
    const districtMap = new Map(districts.map((d) => [d.districtId, d]));

    const enrichedMstEdges = result.mstEdges.map((e) => ({
      roadId: e.roadId,
      fromDistrictId: e.u,
      fromName: districtMap.get(e.u) ? districtMap.get(e.u).name : `District ${e.u}`,
      toDistrictId: e.v,
      toName: districtMap.get(e.v) ? districtMap.get(e.v).name : `District ${e.v}`,
      distanceKm: e.cost,
      roadType: e.roadType
    }));

    res.json({
      success: true,
      algorithm: "Kruskal's MST (Iterative DSU with Cost Sorting) - Problem 4",
      totalCostKm: result.totalCost,
      edgesCount: result.edgesCount,
      expectedEdges: result.expectedEdges,
      isConnected: result.isConnected,
      mstEdges: enrichedMstEdges,
      explanation: "Computes the minimal cost backbone infrastructure necessary to keep all 33 Rajasthan logistics hubs interconnected without forming cycles, optimizing road maintenance budgets."
    });
  } catch (err) {
    next(err);
  }
};

// 5. All-Pairs Warehouse Distances (Floyd-Warshall - Problem 5)
exports.getAllPairsDistances = async (req, res, next) => {
  try {
    const [districts, edges] = await Promise.all([
      District.find().sort({ districtId: 1 }),
      getNetworkEdgesWithTraffic()
    ]);

    const n = districts.length;
    const result = floydWarshall(n, edges);
    const districtMap = new Map(districts.map((d) => [d.districtId, d]));

    // If query parameters u and v provided, return point-to-point precomputed distance
    const { from, to } = req.query;
    if (from && to) {
      const u = Number(from);
      const v = Number(to);
      const dist = result.getDistance(u, v);
      return res.json({
        success: true,
        algorithm: 'Floyd-Warshall (Iterative Dynamic Programming) - Problem 5',
        fromDistrict: districtMap.get(u) ? districtMap.get(u).name : `District ${u}`,
        toDistrict: districtMap.get(v) ? districtMap.get(v).name : `District ${v}`,
        distanceMinutes: dist,
        reachable: dist !== -1
      });
    }

    res.json({
      success: true,
      algorithm: 'Floyd-Warshall (Iterative DP Matrix) - Problem 5',
      nodeCount: n,
      matrix: result.matrix,
      districts: districts.map((d) => ({ districtId: d.districtId, name: d.name })),
      explanation: 'Executes a triply-nested dynamic programming relaxation O(V^3) to precompute the optimal travel times between all pairs of warehouses for rapid order pricing and planning.'
    });
  } catch (err) {
    next(err);
  }
};

// 6. Critical Roads (Tarjan's Bridges - Problem 6)
exports.getCriticalRoads = async (req, res, next) => {
  try {
    const [districts, edges] = await Promise.all([
      District.find().sort({ districtId: 1 }),
      Road.find()
    ]);

    const n = districts.length;
    const result = tarjanBridges(n, edges);
    const districtMap = new Map(districts.map((d) => [d.districtId, d]));

    const criticalRoadDetails = result.criticalBridges.map((b) => ({
      roadId: b.roadId,
      fromDistrictId: b.u,
      fromName: districtMap.get(b.u) ? districtMap.get(b.u).name : `District ${b.u}`,
      toDistrictId: b.v,
      toName: districtMap.get(b.v) ? districtMap.get(b.v).name : `District ${b.v}`,
      roadType: b.roadType,
      distanceKm: b.distanceKm
    }));

    res.json({
      success: true,
      algorithm: "Tarjan's Bridges (Iterative DFS Stack Emulation with Parent-Edge ID Tracking) - Problem 6",
      criticalBridgesCount: result.bridgeCount,
      criticalRoads: criticalRoadDetails,
      explanation: 'Uses iterative DFS emulation to calculate discovery and low-link numbers (tin & low) with edge-ID parent tracking. Identifies vulnerable single points of failure whose obstruction isolates districts.'
    });
  } catch (err) {
    next(err);
  }
};
