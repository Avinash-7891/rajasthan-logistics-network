const express = require('express');
const router = express.Router();
const {
  getFastestRoute,
  getReachableDistricts,
  checkConnectivity,
  getMinimumSpanningTree,
  getAllPairsDistances,
  getCriticalRoads
} = require('../controllers/algorithmController');

// Problem 2: Shortest / Fastest Route (Dijkstra)
router.get('/shortest-route', getFastestRoute);

// Problem 1: Reachable Districts (BFS)
router.get('/reachable', getReachableDistricts);
router.get('/reachable/:source', getReachableDistricts);

// Problem 3: Network Connectivity Check (DSU)
router.get('/connectivity', checkConnectivity);

// Problem 4: Minimum Cost Network (Kruskal's MST)
router.get('/mst', getMinimumSpanningTree);

// Problem 5: All-Pairs Warehouse Distances (Floyd-Warshall)
router.get('/all-pairs-distance', getAllPairsDistances);

// Problem 6: Critical Roads (Tarjan's Bridges)
router.get('/critical-roads', getCriticalRoads);

module.exports = router;
