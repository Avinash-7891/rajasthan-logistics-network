/**
 * ============================================================================
 * Rajasthan Logistics Network - Algorithm Suite
 * Exact ports from original C++ problem implementations.
 * ============================================================================
 */

const MinPriorityQueue = require('./minPriorityQueue');
const bfsReachable = require('./problem1_bfsReachable');
const dijkstraFastestRoute = require('./problem2_dijkstraFastestRoute');
const { DSU, checkNetworkConnectivity } = require('./problem3_dsuConnected');
const kruskalMST = require('./problem4_kruskalMST');
const floydWarshall = require('./problem5_floydWarshall');
const tarjanBridges = require('./problem6_tarjanBridges');
const nearestNeighborRoute = require('./problem7_nearestNeighborRoute');
const bestFitVehicleAssignment = require('./problem8_bestFitVehicle');
const greedyMultiVehicleAssignment = require('./problem8_bestFitVehicle').greedyMultiVehicleAssignment;

module.exports = {
  MinPriorityQueue,
  // Problem 1: Reachable Districts (BFS - Iterative)
  bfsReachable,
  // Problem 2: Fastest Route (Dijkstra - Iterative)
  dijkstraFastestRoute,
  // Problem 3: Are They Connected? (DSU - Iterative)
  DSU,
  checkNetworkConnectivity,
  // Problem 4: Minimum Cost Network (Kruskal's MST - Iterative)
  kruskalMST,
  // Problem 5: All Warehouse Distances (Floyd-Warshall - Iterative)
  floydWarshall,
  // Problem 6: Critical Roads (Tarjan's Bridges - Iterative DFS Emulation)
  tarjanBridges,
  // Problem 7: Multi-Stop Delivery Order (Nearest Neighbor - Iterative)
  nearestNeighborRoute,
  // Problem 8: Best-Fit Vehicle Assignment (Set Lower Bound - Iterative)
  bestFitVehicleAssignment,
  // Problem 8: Greedy Multi-Vehicle Assignment (Lower Bound - Iterative)
  greedyMultiVehicleAssignment
};
