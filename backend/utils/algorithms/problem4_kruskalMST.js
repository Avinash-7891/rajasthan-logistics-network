/**
 * ============================================================================
 * Algorithm Port: Problem 4 - Minimum Cost Network (Kruskal's MST - Iterative)
 * ============================================================================
 * C++ Original Problem:
 * // Problem 4: Minimum Cost Network (Kruskal's MST - Iterative)
 *
 * Approach:
 * - Kruskal's algorithm to compute Minimum Spanning Tree (MST).
 * - Sort edges ascending by cost (distanceKm or construction/maintenance cost).
 * - Uses iterative DSU with path compression to unite disjoint components.
 * - Iterates through sorted edges, picking edges that don't form cycles until n - 1 edges chosen.
 * - Returns total cost and selected MST edges.
 *
 * Variables:
 * - n: number of nodes (districts)
 * - edges: array of { u, v, cost, roadId }
 * - total_cost: sum of selected edge costs
 * - edges_cnt: number of edges added to MST
 * ============================================================================
 */

class KruskalDSU {
  constructor(n) {
    this.parent = new Array(n + 1);
    for (let i = 0; i <= n; i++) {
      this.parent[i] = i; // iota(parent.begin(), parent.end(), 0)
    }
  }

  find(i) {
    let root = i;
    while (root !== this.parent[root]) {
      root = this.parent[root];
    }
    let curr = i;
    while (curr !== root) {
      const nxt = this.parent[curr];
      this.parent[curr] = root;
      curr = nxt;
    }
    return root;
  }

  unite(i, j) {
    const root_i = this.find(i);
    const root_j = this.find(j);
    if (root_i !== root_j) {
      this.parent[root_i] = root_j;
      return true;
    }
    return false;
  }
}

function kruskalMST(n, rawEdges) {
  // Map and sort edges by cost ascending
  const edges = rawEdges.map((e) => ({
    u: e.u || e.fromDistrictId,
    v: e.v || e.toDistrictId,
    cost: e.cost !== undefined ? e.cost : (e.distanceKm || 0),
    roadId: e.roadId || `${e.fromDistrictId}-${e.toDistrictId}`,
    fromDistrictId: e.fromDistrictId || e.u,
    toDistrictId: e.toDistrictId || e.v,
    roadType: e.roadType || 'Highway',
    distanceKm: e.distanceKm || e.cost
  }));

  // sort(edges.begin(), edges.end())
  edges.sort((a, b) => a.cost - b.cost);

  const dsu = new KruskalDSU(n);
  let total_cost = 0;
  let edges_cnt = 0;
  const mstEdges = [];

  for (const edge of edges) {
    if (dsu.unite(edge.u, edge.v)) {
      total_cost += edge.cost;
      edges_cnt++;
      mstEdges.push(edge);
      if (edges_cnt === n - 1) break;
    }
  }

  const isConnected = edges_cnt === n - 1;

  return {
    totalCost: isConnected ? total_cost : -1,
    edgesCount: edges_cnt,
    expectedEdges: n - 1,
    isConnected,
    mstEdges
  };
}

module.exports = kruskalMST;
