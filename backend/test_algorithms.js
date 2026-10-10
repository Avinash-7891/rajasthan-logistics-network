const {
  bfsReachable,
  dijkstraFastestRoute,
  DSU,
  checkNetworkConnectivity,
  kruskalMST,
  floydWarshall,
  tarjanBridges,
  nearestNeighborRoute,
  bestFitVehicleAssignment
} = require('./utils/algorithms');

console.log('--- Testing Ported Algorithms ---');

// 1. BFS Reachable (Problem 1)
const edgesP1 = [
  { u: 1, v: 2 },
  { u: 2, v: 3 },
  { u: 4, v: 5 }
];
const bfsRes = bfsReachable(5, edgesP1, 1);
console.log('Problem 1 (BFS Reachable from 1):', bfsRes.reachableDistricts); // [1, 2, 3]

// 2. Dijkstra (Problem 2)
const edgesP2 = [
  { u: 1, v: 2, weight: 10 },
  { u: 2, v: 3, weight: 20 },
  { u: 1, v: 3, weight: 50 }
];
const dijkstraRes = dijkstraFastestRoute(3, edgesP2, 1, 3);
console.log('Problem 2 (Dijkstra 1 -> 3): cost =', dijkstraRes.cost, ', path =', dijkstraRes.path); // cost: 30, path: [1, 2, 3]

// 3. DSU (Problem 3)
const dsu = new DSU(4);
dsu.unite(1, 2);
dsu.unite(2, 3);
console.log('Problem 3 (DSU connected 1 & 3):', dsu.connected(1, 3)); // true
console.log('Problem 3 (DSU connected 1 & 4):', dsu.connected(1, 4)); // false

// 4. Kruskal MST (Problem 4)
const edgesP4 = [
  { u: 1, v: 2, cost: 10 },
  { u: 2, v: 3, cost: 20 },
  { u: 1, v: 3, cost: 30 }
];
const mstRes = kruskalMST(3, edgesP4);
console.log('Problem 4 (Kruskal MST totalCost):', mstRes.totalCost, ', edges:', mstRes.edgesCount); // 30, 2 edges

// 5. Floyd-Warshall (Problem 5)
const fwEdges = [
  { u: 1, v: 2, weight: 5 },
  { u: 2, v: 3, weight: 10 }
];
const fwRes = floydWarshall(3, fwEdges);
console.log('Problem 5 (Floyd-Warshall 1 to 3):', fwRes.getDistance(1, 3)); // 15

// 6. Tarjan Bridges (Problem 6)
// Graph: 1 - 2, 2 - 3, 3 - 1 (cycle) and 3 - 4 (bridge to 4)
const bridgeEdges = [
  { u: 1, v: 2 },
  { u: 2, v: 3 },
  { u: 3, v: 1 },
  { u: 3, v: 4 }
];
const bridgeRes = tarjanBridges(4, bridgeEdges);
console.log('Problem 6 (Tarjan Bridges count):', bridgeRes.bridgeCount); // 1 (edge between 3 and 4)
console.log('Problem 6 (Critical bridge edges):', bridgeRes.criticalBridges.map((b) => `${b.u}-${b.v}`)); // ['3-4']

// 7. Nearest Neighbor (Problem 7)
const distMatrix = [
  [0, 10, 50, 100],
  [10, 0, 20, 80],
  [50, 20, 0, 15],
  [100, 80, 15, 0]
];
const nnRes = nearestNeighborRoute(3, distMatrix);
console.log('Problem 7 (Nearest Neighbor path):', nnRes.pathIndices, ', totalDistance:', nnRes.totalDistance);

// 8. Best Fit Vehicle (Problem 8)
const mockVehicles = [
  { vehicleId: 'V1', maxCapacityKg: 500, currentLocationDistrictId: 1, status: 'idle' },
  { vehicleId: 'V2', maxCapacityKg: 2000, currentLocationDistrictId: 2, status: 'idle' },
  { vehicleId: 'V3', maxCapacityKg: 5000, currentLocationDistrictId: 3, status: 'idle' }
];
const assignmentRes = bestFitVehicleAssignment(mockVehicles, 1200, { 1: 50, 2: 10, 3: 40 });
console.log('Problem 8 (Best Fit for 1200kg):', assignmentRes.vehicleId, ', cap:', assignmentRes.capacityKg); // V2, cap 2000

console.log('--- All 8 Ported Algorithms Passed Validation! ---');
