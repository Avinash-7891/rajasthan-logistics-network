/**
 * ============================================================================
 * Algorithm Port: Problem 3 - Are They Connected? (DSU - Iterative)
 * ============================================================================
 * C++ Original Problem:
 * // Problem 3: Are They Connected? (DSU - Iterative)
 *
 * Approach:
 * - Disjoint Set Union (DSU) / Union-Find with iterative two-pass path compression
 *   and union by rank.
 * - find(i):
 *     1. while (root != parent[root]) root = parent[root];
 *     2. while (curr != root) { nxt = parent[curr]; parent[curr] = root; curr = nxt; }
 * - unite(i, j):
 *     Attaches lower rank tree under higher rank tree.
 *
 * Variables:
 * - parent: array of parent pointers (1 to n)
 * - rank: array of rank heights (1 to n)
 * ============================================================================
 */

class DSU {
  constructor(n) {
    this.n = n;
    this.parent = new Array(n + 1);
    for (let i = 0; i <= n; i++) {
      this.parent[i] = i; // iota(parent.begin(), parent.end(), 0)
    }
    this.rank = new Array(n + 1).fill(0); // rank.assign(n + 1, 0)
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
    let root_i = this.find(i);
    let root_j = this.find(j);
    if (root_i !== root_j) {
      if (this.rank[root_i] < this.rank[root_j]) {
        // swap(root_i, root_j)
        const temp = root_i;
        root_i = root_j;
        root_j = temp;
      }
      this.parent[root_j] = root_i;
      if (this.rank[root_i] === this.rank[root_j]) {
        this.rank[root_i]++;
      }
      return true;
    }
    return false;
  }

  connected(i, j) {
    return this.find(i) === this.find(j);
  }
}

/**
 * Check overall network connectivity and return components
 */
function checkNetworkConnectivity(n, edges) {
  const dsu = new DSU(n);

  for (const edge of edges) {
    const u = edge.u || edge.fromDistrictId;
    const v = edge.v || edge.toDistrictId;
    if (u <= n && v <= n) {
      dsu.unite(u, v);
    }
  }

  // Group districts into connected components
  const componentsMap = new Map();
  for (let i = 1; i <= n; i++) {
    const root = dsu.find(i);
    if (!componentsMap.has(root)) {
      componentsMap.set(root, []);
    }
    componentsMap.get(root).push(i);
  }

  const components = Array.from(componentsMap.values());
  const isFullyConnected = components.length <= 1;

  return {
    isFullyConnected,
    totalComponents: components.length,
    components,
    dsu
  };
}

module.exports = {
  DSU,
  checkNetworkConnectivity
};
