/**
 * ============================================================================
 * Algorithm Port: Problem 5 - All Warehouse Distances (Floyd-Warshall - Iterative)
 * ============================================================================
 * C++ Original Problem:
 * // Problem 5: All Warehouse Distances (Floyd-Warshall - Iterative)
 *
 * Approach:
 * - Dynamic programming all-pairs shortest path.
 * - Initializes (n+1) x (n+1) matrix with INF (1e15) and diagonal with 0.
 * - Incorporates bidirectional edges taking min(dist, w).
 * - Triply nested loops over intermediate node k, source i, destination j:
 *     if (dist[i][k] < INF && dist[k][j] < INF)
 *         dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
 *
 * Variables:
 * - n: total number of nodes (districts)
 * - dist: 2D array of size (n+1) x (n+1)
 * - INF: 1e15
 * ============================================================================
 */

const INF = 1e15;

function floydWarshall(n, edges) {
  // vector<vector<long long>> dist(n + 1, vector<long long>(n + 1, INF));
  const dist = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(INF));

  // for (int i = 1; i <= n; ++i) dist[i][i] = 0;
  for (let i = 1; i <= n; ++i) {
    dist[i][i] = 0;
  }

  // Populate edges: dist[u][v] = min(dist[u][v], w); dist[v][u] = min(dist[v][u], w);
  for (const edge of edges) {
    const u = edge.u || edge.fromDistrictId;
    const v = edge.v || edge.toDistrictId;
    const w = edge.weight !== undefined ? edge.weight : (edge.travelTimeMinutes || edge.distanceKm || 0);

    if (u <= n && v <= n) {
      dist[u][v] = Math.min(dist[u][v], w);
      dist[v][u] = Math.min(dist[v][u], w);
    }
  }

  // Triply nested loops
  for (let k = 1; k <= n; ++k) {
    for (let i = 1; i <= n; ++i) {
      for (let j = 1; j <= n; ++j) {
        if (dist[i][k] < INF && dist[k][j] < INF) {
          dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
        }
      }
    }
  }

  // Convert for JSON serialization: values >= INF / 2 become null / "INF"
  const matrix = [];
  for (let i = 1; i <= n; ++i) {
    const row = [];
    for (let j = 1; j <= n; ++j) {
      if (dist[i][j] >= INF / 2) {
        row.push(null);
      } else {
        row.push(dist[i][j]);
      }
    }
    matrix.push(row);
  }

  return {
    nodeCount: n,
    rawDist: dist,
    matrix,
    getDistance: (u, v) => (dist[u] && dist[u][v] < INF / 2 ? dist[u][v] : -1)
  };
}

module.exports = floydWarshall;
