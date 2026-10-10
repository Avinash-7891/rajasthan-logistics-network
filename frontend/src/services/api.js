const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

export const api = {
  // Auth
  login: (credentials) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),

  // Network & Infrastructure
  getDistricts: () => request('/network/districts'),
  getRoads: () => request('/network/roads'),
  getWarehouses: () => request('/network/warehouses'),
  getTraffic: () => request('/network/traffic'),
  simulateTraffic: () => request('/network/traffic/simulate', { method: 'POST' }),

  // Algorithms
  getReachableDistricts: (sourceId) =>
    request(`/algorithms/reachable?source=${sourceId}`),

  getShortestRoute: (sourceId, destinationId) =>
    request(`/algorithms/shortest-route?source=${sourceId}&destination=${destinationId}`),

  getConnectivity: () => request('/algorithms/connectivity'),

  getMST: () => request('/algorithms/mst'),

  getAllPairsDistances: (from, to) => {
    const query = from && to ? `?from=${from}&to=${to}` : '';
    return request(`/algorithms/all-pairs-distance${query}`);
  },

  getCriticalRoads: () => request('/algorithms/critical-roads'),

  // Orders
  createOrder: (orderData) =>
    request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  getOrders: () => request('/orders'),
  getTransitOrders: () => request('/orders/transit'),
  getOrderHistory: (limit = 20) => request(`/orders/history?limit=${limit}`),
  searchOrders: (query) => request(`/orders/search?q=${encodeURIComponent(query)}`),
  getOrderById: (orderId) => request(`/orders/${orderId}`),
  getOrderRoute: (orderId) => request(`/orders/${orderId}/route`),
  deliverStop: (orderId, stopIndex) =>
    request(`/orders/${orderId}/stops/${stopIndex}/deliver`, { method: 'PATCH' }),

  // Vehicles
  getVehicles: () => request('/vehicles'),
  getVehicleRoute: (vehicleId) =>
    request(`/vehicles/${vehicleId}/route`),
  markVehicleDone: (vehicleId) =>
    request(`/vehicles/${vehicleId}/done`, { method: 'POST' }),
  updateVehicle: (vehicleId, payload) =>
    request(`/vehicles/${vehicleId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  triggerQueueAssignment: () =>
    request('/vehicles/assign-queue', { method: 'POST' }),

  // Delivery
  getDeliveryPlan: (orderId) =>
    request(`/delivery/${orderId}/plan`),
  getNextStep: (orderId, vehicleId) =>
    request(`/delivery/${orderId}/next-step?vehicleId=${vehicleId}`),

  // Analytics
  getAnalytics: () => request('/analytics')
};
