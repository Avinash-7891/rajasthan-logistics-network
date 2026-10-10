/**
 * ============================================================================
 * Algorithm Port: Problem 1 - Reachable Districts (BFS - Iterative)
 * ============================================================================
 * C++ Original Problem:
 * // Problem 1: Reachable Districts (BFS - Iterative)
 *
 * Approach:
 * - Iterative Breadth-First Search using a queue.
 * - Explores all nodes reachable from source node `s`.
 * - Maintains a visited boolean array `vis`.
 * - Collects discovered nodes in `reachable` and sorts them ascending.
 *
 * Variables:
 * - n: total number of nodes (districts)
 * - adj: adjacency list (1-indexed)
 * - s: start source district id
 * - vis: boolean array of size n + 1
 * - reachable: array of reachable node ids
 * - q: queue for BFS exploration
 * ============================================================================
 */

function bfsReachable(n, edges, s) {
  // Build adjacency list (1-indexed)
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const edge of edges) {
    const u = edge.u || edge.fromDistrictId;
    const v = edge.v || edge.toDistrictId;
    if (u <= n && v <= n) {
      adj[u].push(v);
      adj[v].push(u);
    }
  }

  const vis = new Array(n + 1).fill(false);
  const reachable = [];
  const q = [];

  // Start BFS from s
  q.push(s);
  vis[s] = true;

  let head = 0; // standard pointer-based queue shift for O(1) dequeue
  while (head < q.length) {
    const u = q[head++];
    reachable.push(u);

    for (const v of adj[u]) {
      if (!vis[v]) {
        vis[v] = true;
        q.push(v);
      }
    }
  }

  // Sort reachable ascending to match C++: sort(reachable.begin(), reachable.end())
  reachable.sort((a, b) => a - b);

  return {
    source: s,
    count: reachable.length,
    reachableDistricts: reachable
  };
}

module.exports = bfsReachable;
