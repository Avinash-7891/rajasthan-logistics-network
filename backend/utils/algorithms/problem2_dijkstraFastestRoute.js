/**
 * ============================================================================
 * Algorithm Port: Problem 2 - Fastest Route (Dijkstra - Iterative)
 * ============================================================================
 * C++ Original Problem:
 * // Problem 2: Fastest Route (Dijkstra - Iterative)
 *
 * Approach:
 * - Priority-queue (Min-Heap) based iterative Dijkstra algorithm.
 * - Finds shortest path / minimum travel time from start node `s` to all nodes (or specific target).
 * - Distances initialized to INF (1e18).
 * - Relaxation condition: if (dist[u] + weight < dist[v])
 * - Reconstructs path if target destination is specified.
 *
 * Variables:
 * - n: total number of nodes (districts)
 * - adj: adjacency list with { v, weight, roadId } (1-indexed)
 * - s: start source district id
 * - dist: distance array of size n + 1, initialized to INF
 * - pq: MinPriorityQueue storing [d, u]
 * ============================================================================
 */

const MinPriorityQueue = require('./minPriorityQueue');

const INF = 1e18;

function dijkstraFastestRoute(n, edges, s, target = null) {
  // Build adjacency list (1-indexed)
  // adj[u] contains { v, weight, roadId, ... }
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const edge of edges) {
    const u = edge.u || edge.fromDistrictId;
    const v = edge.v || edge.toDistrictId;
    const w = edge.weight !== undefined ? edge.weight : (edge.travelTimeMinutes || edge.distanceKm || 1);
    const roadId = edge.roadId || null;
    const distanceKm = edge.distanceKm || 0;

    if (u <= n && v <= n) {
      adj[u].push({ v, weight: w, roadId, distanceKm });
      adj[v].push({ v: u, weight: w, roadId, distanceKm });
    }
  }

  const dist = new Array(n + 1).fill(INF);
  const parent = new Array(n + 1).fill(null);
  const parentEdge = new Array(n + 1).fill(null);
  const pq = new MinPriorityQueue();

  dist[s] = 0;
  pq.push([0, s]);

  while (!pq.empty()) {
    const [d, u] = pq.top();
    pq.pop();

    if (d > dist[u]) continue;

    for (const edge of adj[u]) {
      const v = edge.v;
      const weight = edge.weight;

      if (dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight;
        parent[v] = u;
        parentEdge[v] = edge;
        pq.push([dist[v], v]);
      }
    }
  }

  // Format results
  const distances = {};
  for (let i = 1; i <= n; ++i) {
    distances[i] = dist[i] === INF ? -1 : dist[i];
  }

  let path = [];
  let pathEdges = [];
  let totalDistanceKm = 0;

  if (target !== null && target >= 1 && target <= n) {
    if (dist[target] !== INF) {
      let curr = target;
      while (curr !== null) {
        path.push(curr);
        if (parentEdge[curr]) {
          pathEdges.push(parentEdge[curr]);
          totalDistanceKm += parentEdge[curr].distanceKm || 0;
        }
        curr = parent[curr];
      }
      path.reverse();
      pathEdges.reverse();
    }
  }

  return {
    source: s,
    target,
    cost: target ? distances[target] : null,
    dist: distances,
    rawDist: dist,
    path,
    pathEdges,
    totalDistanceKm,
    reachable: target ? dist[target] !== INF : true
  };
}

module.exports = dijkstraFastestRoute;
