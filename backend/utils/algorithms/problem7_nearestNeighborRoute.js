/**
 * ============================================================================
 * Algorithm Port: Problem 7 - Multi-Stop Delivery Order (Nearest Neighbor - Iterative)
 * ============================================================================
 * C++ Original Problem:
 * // Problem 7: Multi-Stop Delivery Order (Nearest Neighbor - Iterative)
 *
 * Approach:
 * - Greedy Nearest Neighbor heuristic for Multi-Stop route sequencing (TSP variant).
 * - Total nodes = k + 1 (Node 0 is the pickup node; Nodes 1..k are drop stops).
 * - Starts at curr = 0 (pickup).
 * - Iteratively picks unvisited node with minimum distance / travel time from curr:
 *     for (int step = 0; step < k; ++step) {
 *       find min dist[curr][j] where !visited[j]
 *       mark visited, add min_d to total_dist, curr = next_node
 *     }
 *
 * Variables:
 * - k: number of delivery destinations
 * - total_nodes: k + 1
 * - dist: distance matrix of size total_nodes x total_nodes
 * - visited: boolean array of size total_nodes
 * - path: ordered sequence of node indices [0, ...]
 * - total_dist: accumulated distance or travel time
 * ============================================================================
 */

function nearestNeighborRoute(k, distMatrix, stopsData = []) {
  const total_nodes = k + 1;
  const visited = new Array(total_nodes).fill(false);
  const path = [];

  let curr = 0;
  path.push(curr);
  visited[curr] = true;
  let total_dist = 0;

  for (let step = 0; step < k; ++step) {
    let next_node = -1;
    let min_d = 1e18;

    for (let j = 0; j < total_nodes; ++j) {
      if (!visited[j] && distMatrix[curr][j] < min_d) {
        min_d = distMatrix[curr][j];
        next_node = j;
      }
    }

    if (next_node !== -1) {
      visited[next_node] = true;
      total_dist += min_d;
      path.push(next_node);
      curr = next_node;
    }
  }

  // Map path indices to stop metadata if provided
  const orderedStops = path.map((idx) => {
    if (idx === 0) {
      return { index: 0, isPickup: true, ...(stopsData[0] || {}) };
    }
    return { index: idx, isPickup: false, ...(stopsData[idx] || {}) };
  });

  return {
    pathIndices: path,
    orderedStops,
    totalDistance: total_dist,
    totalStops: k
  };
}

module.exports = nearestNeighborRoute;
