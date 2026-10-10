/**
 * ============================================================================
 * Algorithm Port: Problem 8 - Best-Fit Vehicle Assignment (Set Lower Bound - Iterative)
 * ============================================================================
 * C++ Original Problem:
 * // Problem 8: Best-Fit Vehicle Assignment (Set Lower Bound - Iterative)
 *
 * Approach:
 * - Emulates std::set<pair<int, int>> with lower_bound({w, 0}).
 * - For a given cargo weight `w`, finds the available vehicle with the smallest
 *   capacity `cap >= w` (Best-Fit heuristic to minimize wasted capacity).
 * - If multiple vehicles have sufficient capacity, considers current distance
 *   from pickup location (computed via Dijkstra) as secondary tie-breaking factor.
 * - Removes (erases) the chosen vehicle from the available pool upon assignment.
 * - Returns -1 if no vehicle with sufficient capacity is available.
 *
 * Variables:
 * - vehicles: collection/set of available vehicles { cap, id, distanceToPickup, ... }
 * - w: required cargo weight
 * - it: iterator / found vehicle matching lower_bound condition
 * ============================================================================
 */

function bestFitVehicleAssignment(availableVehicles, requiredWeightKg, distanceToPickupMap = {}) {
  // Filter only vehicles with status 'idle' and capacity >= requiredWeightKg
  const candidates = availableVehicles
    .filter((v) => (v.status === 'idle' || v.status === 'free') && v.maxCapacityKg >= requiredWeightKg)
    .map((v) => {
      const dist = distanceToPickupMap[v.currentLocationDistrictId] !== undefined &&
                   distanceToPickupMap[v.currentLocationDistrictId] >= 0
        ? distanceToPickupMap[v.currentLocationDistrictId]
        : 1e9;
      return {
        vehicle: v,
        cap: v.maxCapacityKg,
        id: v.vehicleId || v._id,
        distanceToPickup: dist
      };
    });

  if (candidates.length === 0) {
    return {
      assigned: false,
      vehicleId: -1,
      reason: 'No available vehicle with sufficient capacity'
    };
  }

  // Emulate std::set ordering: primary = cap ascending (lower_bound),
  // secondary factor = distanceToPickup ascending
  candidates.sort((a, b) => {
    if (a.cap !== b.cap) {
      return a.cap - b.cap; // smallest sufficient capacity (lower_bound)
    }
    return a.distanceToPickup - b.distanceToPickup; // secondary factor: proximity to pickup
  });

  // The first candidate corresponds to lower_bound({w, 0})
  const chosen = candidates[0];

  return {
    assigned: true,
    vehicleId: chosen.id,
    vehicle: chosen.vehicle,
    capacityKg: chosen.cap,
    distanceToPickup: chosen.distanceToPickup === 1e9 ? 0 : chosen.distanceToPickup
  };
}

/**
 * Greedy Multi-Vehicle Assignment
 * Repeatedly picks the SMALLEST vehicle that can hold the remaining weight (lower_bound).
 * Only when no single vehicle is big enough does it take the largest available one,
 * then continues with whatever weight is left. Repeats until the order is fully covered.
 * Returns { assigned, vehicles: [{ vehicle, capacityKg, loadKg }], totalCapacityKg }
 */
function greedyMultiVehicleAssignment(availableVehicles, requiredWeightKg, distanceToPickupMap = {}) {
  // Filter only idle vehicles
  const idleVehicles = availableVehicles
    .filter((v) => v.status === 'idle' || v.status === 'free');

  if (idleVehicles.length === 0) {
    return {
      assigned: false,
      vehicles: [],
      totalCapacityKg: 0,
      reason: 'No idle vehicles available'
    };
  }

  // Check total fleet capacity
  const totalFleetCapacity = idleVehicles.reduce((sum, v) => sum + v.maxCapacityKg, 0);
  if (requiredWeightKg > totalFleetCapacity) {
    return {
      assigned: false,
      vehicles: [],
      totalCapacityKg: totalFleetCapacity,
      reason: `Order too heavy. Required: ${requiredWeightKg}kg, Fleet capacity: ${totalFleetCapacity}kg`
    };
  }

  // Sort ASCENDING by capacity (lower_bound semantics), proximity as tie-breaker
  const sortedVehicles = [...idleVehicles].sort((a, b) => {
    const distA = distanceToPickupMap[a.currentLocationDistrictId] !== undefined &&
                  distanceToPickupMap[a.currentLocationDistrictId] >= 0
      ? distanceToPickupMap[a.currentLocationDistrictId]
      : 1e9;
    const distB = distanceToPickupMap[b.currentLocationDistrictId] !== undefined &&
                  distanceToPickupMap[b.currentLocationDistrictId] >= 0
      ? distanceToPickupMap[b.currentLocationDistrictId]
      : 1e9;
    if (a.maxCapacityKg !== b.maxCapacityKg) {
      return a.maxCapacityKg - b.maxCapacityKg; // smallest capacity first
    }
    return distA - distB; // proximity as tie-breaker
  });

  // Greedy lower-bound: repeatedly take the SMALLEST vehicle that can hold the
  // remaining weight. If no single vehicle is big enough, take the LARGEST one
  // and continue with what's left.
  let remainingWeight = requiredWeightKg;
  const pool = [...sortedVehicles];
  const assignedVehicles = [];

  const take = (idx) => {
    const vehicle = pool.splice(idx, 1)[0];
    const loadKg = Math.min(vehicle.maxCapacityKg, remainingWeight);
    assignedVehicles.push({
      vehicle,
      capacityKg: vehicle.maxCapacityKg,
      loadKg
    });
    remainingWeight -= loadKg;
  };

  while (remainingWeight > 0 && pool.length > 0) {
    // lower_bound: first vehicle whose capacity >= remaining weight
    let idx = pool.findIndex((v) => v.maxCapacityKg >= remainingWeight);

    if (idx === -1) {
      // No single vehicle fits the rest -> take the largest available
      idx = pool.length - 1;
    }
    take(idx);
  }

  const totalCapacity = assignedVehicles.reduce((sum, v) => sum + v.capacityKg, 0);

  return {
    assigned: true,
    vehicles: assignedVehicles,
    totalCapacityKg: totalCapacity,
    vehicleIds: assignedVehicles.map((v) => v.vehicle.vehicleId || v.vehicle._id)
  };
}

module.exports = bestFitVehicleAssignment;
module.exports.greedyMultiVehicleAssignment = greedyMultiVehicleAssignment;
