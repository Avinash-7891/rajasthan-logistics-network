/**
 * ============================================================================
 * Algorithm Port: Problem 6 - Critical Roads (Tarjan's Bridges - Iterative DFS Emulation)
 * ============================================================================
 * C++ Original Problem:
 * // Problem 6: Critical Roads (Tarjan's Bridges - Iterative DFS Emulation)
 *
 * Approach:
 * - Tarjan's Bridge-Finding algorithm implemented using ITERATIVE DFS emulation
 *   with an explicit stack `st` and an `edge_idx` tracking pointer per node.
 * - Tracks `parent_edge` ID instead of parent node ID to robustly handle parallel edges.
 * - Computes discovery times `tin` and lowest reachable times `low`.
 * - When edge (u, v) finishes, if `low[u] > tin[p]`, the edge `parent_edge[u]` is a critical bridge.
 *
 * Variables:
 * - n: total number of districts (nodes)
 * - m: total number of roads (edges)
 * - adj: vector<vector<EdgeRef>> where EdgeRef = { to: v, id: edgeIndex }
 * - edges: list of original edges
 * - tin, low: discovery and low-link time arrays
 * - is_bridge: boolean array of size m
 * - timer: integer timestamp counter
 * - parent_edge: array storing incoming edge index for each node
 * - edge_idx: array storing the current adjacency index being explored for each node
 * - st: explicit DFS call-stack array
 * ============================================================================
 */

function tarjanBridges(n, rawEdges) {
  const m = rawEdges.length;
  // vector<vector<EdgeRef>> adj(n + 1);
  const adj = Array.from({ length: n + 1 }, () => []);
  const edges = [];

  for (let i = 0; i < m; ++i) {
    const raw = rawEdges[i];
    const u = raw.u || raw.fromDistrictId;
    const v = raw.v || raw.toDistrictId;
    edges[i] = {
      u,
      v,
      id: i,
      roadId: raw.roadId || raw._id || `${u}-${v}`,
      roadType: raw.roadType,
      distanceKm: raw.distanceKm
    };

    if (u <= n && v <= n) {
      adj[u].push({ to: v, id: i });
      adj[v].push({ to: u, id: i });
    }
  }

  // vector<int> tin(n + 1, 0), low(n + 1, 0);
  const tin = new Array(n + 1).fill(0);
  const low = new Array(n + 1).fill(0);
  // vector<bool> is_bridge(m, false);
  const is_bridge = new Array(m).fill(false);
  let timer = 0;

  // vector<int> parent_edge(n + 1, -1);
  const parent_edge = new Array(n + 1).fill(-1);
  // vector<int> edge_idx(n + 1, 0);
  const edge_idx = new Array(n + 1).fill(0);

  for (let start = 1; start <= n; ++start) {
    if (tin[start]) continue;

    // vector<int> st; st.push_back(start);
    const st = [];
    st.push(start);
    tin[start] = low[start] = ++timer;

    while (st.length > 0) {
      const u = st[st.length - 1]; // st.back()

      if (edge_idx[u] < adj[u].length) {
        const edge = adj[u][edge_idx[u]++];
        const v = edge.to;
        const id = edge.id;

        if (id === parent_edge[u]) continue;

        if (tin[v]) {
          low[u] = Math.min(low[u], tin[v]);
        } else {
          parent_edge[v] = id;
          tin[v] = low[v] = ++timer;
          st.push(v);
        }
      } else {
        st.pop(); // st.pop_back()
        if (st.length > 0) {
          const p = st[st.length - 1]; // int p = st.back()
          const p_edge = parent_edge[u];
          low[p] = Math.min(low[p], low[u]);
          if (low[u] > tin[p]) {
            is_bridge[p_edge] = true;
          }
        }
      }
    }
  }

  let bridge_cnt = 0;
  const criticalBridges = [];

  for (let i = 0; i < m; ++i) {
    if (is_bridge[i]) {
      bridge_cnt++;
      criticalBridges.push(edges[i]);
    }
  }

  return {
    bridgeCount: bridge_cnt,
    criticalBridges,
    isBridgeArray: is_bridge
  };
}

module.exports = tarjanBridges;
