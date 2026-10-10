const Order = require('../models/Order');
const Vehicle = require('../models/Vehicle');
const District = require('../models/District');
const Road = require('../models/Road');
const TrafficData = require('../models/TrafficData');
const { dijkstraFastestRoute, floydWarshall } = require('../utils/algorithms');

// Helper to assemble road edges with traffic-based TIME weights
async function getRoadEdges() {
  const [roads, traffic] = await Promise.all([Road.find(), TrafficData.find()]);
  const trafficMap = new Map(traffic.map((t) => [t.roadId, t]));

  return roads.map((r) => {
    const traf = trafficMap.get(r.roadId);
    const multiplier = traf ? traf.congestionMultiplier : 1.0;
    const baseTimeMinutes = Math.round((r.distanceKm / (r.averageSpeedKmph || 65)) * 60 * multiplier);

    return {
      roadId: r.roadId,
      u: r.fromDistrictId,
      v: r.toDistrictId,
      distanceKm: r.distanceKm,
      weight: baseTimeMinutes,
      roadType: r.roadType
    };
  });
}

/**
 * Get the complete sequential delivery plan for an order.
 * Uses Floyd-Warshall for O(1) distance lookups (time-based weights).
 * Only runs Dijkstra for path reconstruction of actual routes.
 */
exports.getDeliveryPlan = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const [districts, edges] = await Promise.all([
      District.find().sort({ districtId: 1 }),
      getRoadEdges()
    ]);

    const districtMap = new Map(districts.map((d) => [d.districtId, d]));
    const n = districts.length;

    // Get assigned vehicles
    const vehicleIds = order.assignedVehicleIds?.length > 0
      ? order.assignedVehicleIds
      : (order.assignedVehicleId ? [order.assignedVehicleId] : []);

    if (vehicleIds.length === 0) {
      return res.json({ success: true, hasPlan: false, message: 'No vehicles assigned to this order' });
    }

    const vehicles = await Vehicle.find({ vehicleId: { $in: vehicleIds } });

    // Get undelivered stops
    const undeliveredStops = order.destinations.filter((d) => !d.delivered);
    if (undeliveredStops.length === 0) {
      return res.json({ success: true, hasPlan: false, message: 'All stops delivered' });
    }

    // Run Floyd-Warshall ONCE for all-pairs shortest paths (time-based)
    const fw = floydWarshall(n, edges);
    const distMatrix = fw.rawDist;

    // For each vehicle, build a sequential delivery plan
    const plans = vehicles.map((vehicle) => {
      const steps = [];
      let remainingStops = [...undeliveredStops];
      let currentLocation = vehicle.currentLocationDistrictId;
      const pickupDistrictId = order.pickupDistrictId;

      // Step 0: Terminal -> Pickup point
      if (currentLocation !== pickupDistrictId) {
        // Use Dijkstra for path reconstruction (only for actual routes)
        const dijkstraResult = dijkstraFastestRoute(n, edges, currentLocation, pickupDistrictId);
        if (dijkstraResult.reachable) {
          steps.push({
            stepIndex: 0,
            type: 'to-pickup',
            vehicleId: vehicle.vehicleId,
            vehicleNumber: vehicle.vehicleNumber,
            driverName: vehicle.driverName,
            from: {
              districtId: currentLocation,
              districtName: districtMap.get(currentLocation)?.name || `District ${currentLocation}`
            },
            to: {
              districtId: pickupDistrictId,
              districtName: districtMap.get(pickupDistrictId)?.name || `District ${pickupDistrictId}`,
              type: 'pickup'
            },
            path: dijkstraResult.path,
            pathDetails: dijkstraResult.path.map((id) => ({
              districtId: id,
              name: districtMap.get(id)?.name || `District ${id}`
            })),
            estimatedTimeMinutes: dijkstraResult.cost,
            totalDistanceKm: dijkstraResult.totalDistanceKm,
            loadKg: order.vehicleLoads?.get(vehicle.vehicleId) || 0
          });
        }
      } else {
        steps.push({
          stepIndex: 0,
          type: 'at-pickup',
          vehicleId: vehicle.vehicleId,
          vehicleNumber: vehicle.vehicleNumber,
          driverName: vehicle.driverName,
          from: {
            districtId: pickupDistrictId,
            districtName: districtMap.get(pickupDistrictId)?.name || `District ${pickupDistrictId}`
          },
          to: {
            districtId: pickupDistrictId,
            districtName: districtMap.get(pickupDistrictId)?.name || `District ${pickupDistrictId}`,
            type: 'pickup'
          },
          path: [pickupDistrictId],
          pathDetails: [{ districtId: pickupDistrictId, name: districtMap.get(pickupDistrictId)?.name || `District ${pickupDistrictId}` }],
          estimatedTimeMinutes: 0,
          totalDistanceKm: 0,
          loadKg: order.vehicleLoads?.get(vehicle.vehicleId) || 0
        });
      }

      // Visit delivery stops in nearest-neighbor order using Floyd-Warshall O(1) lookups
      let currentPickup = pickupDistrictId;
      let stepIdx = 1;

      while (remainingStops.length > 0) {
        // Find nearest undelivered stop using Floyd-Warshall O(1) lookup
        let nearestStop = null;
        let nearestDist = Infinity;

        for (const stop of remainingStops) {
          const d = distMatrix[currentPickup]?.[stop.districtId];
          if (d !== undefined && d < Infinity && d < nearestDist) {
            nearestDist = d;
            nearestStop = stop;
          }
        }

        if (!nearestStop) break;

        // Reconstruct path using Dijkstra (only for this specific route)
        const dijkstraResult = dijkstraFastestRoute(n, edges, currentPickup, nearestStop.districtId);

        steps.push({
          stepIndex: stepIdx,
          type: 'to-delivery',
          vehicleId: vehicle.vehicleId,
          vehicleNumber: vehicle.vehicleNumber,
          driverName: vehicle.driverName,
          from: {
            districtId: currentPickup,
            districtName: districtMap.get(currentPickup)?.name || `District ${currentPickup}`
          },
          to: {
            districtId: nearestStop.districtId,
            districtName: nearestStop.districtName || `District ${nearestStop.districtId}`,
            type: 'delivery',
            stopIndex: nearestStop.stopIndex
          },
          path: dijkstraResult.path,
          pathDetails: dijkstraResult.path.map((id) => ({
            districtId: id,
            name: districtMap.get(id)?.name || `District ${id}`
          })),
          estimatedTimeMinutes: dijkstraResult.cost,
          totalDistanceKm: dijkstraResult.totalDistanceKm,
          loadKg: order.vehicleLoads?.get(vehicle.vehicleId) || 0
        });

        remainingStops = remainingStops.filter((s) => s.stopIndex !== nearestStop.stopIndex);
        currentPickup = nearestStop.districtId;
        stepIdx++;
      }

      return {
        vehicleId: vehicle.vehicleId,
        vehicleNumber: vehicle.vehicleNumber,
        driverName: vehicle.driverName,
        currentLocation: vehicle.currentLocationDistrictId,
        currentLocationName: districtMap.get(vehicle.currentLocationDistrictId)?.name || `District ${vehicle.currentLocationDistrictId}`,
        totalSteps: steps.length,
        steps
      };
    });

    res.json({
      success: true,
      hasPlan: true,
      orderId: order.orderId,
      totalStops: order.destinations.length,
      deliveredStops: order.destinations.filter((d) => d.delivered).length,
      undeliveredStops: undeliveredStops.length,
      plans
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get the next step in the delivery plan for a vehicle.
 * Uses Floyd-Warshall for O(1) distance lookups.
 */
exports.getNextStep = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vehicleId } = req.query;

    const order = await Order.findOne({ orderId: id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const [districts, edges] = await Promise.all([
      District.find().sort({ districtId: 1 }),
      getRoadEdges()
    ]);

    const districtMap = new Map(districts.map((d) => [d.districtId, d]));
    const n = districts.length;

    const vehicle = await Vehicle.findOne({ vehicleId });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const undeliveredStops = order.destinations.filter((d) => !d.delivered);
    if (undeliveredStops.length === 0) {
      return res.json({ success: true, hasStep: false, message: 'All stops delivered' });
    }

    // Run Floyd-Warshall once
    const fw = floydWarshall(n, edges);
    const distMatrix = fw.rawDist;

    const currentLocation = vehicle.currentLocationDistrictId;
    const pickupDistrictId = order.pickupDistrictId;

    // If not at pickup yet, route to pickup
    if (currentLocation !== pickupDistrictId) {
      const dijkstraResult = dijkstraFastestRoute(n, edges, currentLocation, pickupDistrictId);
      if (dijkstraResult.reachable) {
        return res.json({
          success: true,
          hasStep: true,
          stepType: 'to-pickup',
          vehicleId,
          from: {
            districtId: currentLocation,
            districtName: districtMap.get(currentLocation)?.name || `District ${currentLocation}`
          },
          to: {
            districtId: pickupDistrictId,
            districtName: districtMap.get(pickupDistrictId)?.name || `District ${pickupDistrictId}`,
            type: 'pickup'
          },
          path: dijkstraResult.path,
          pathDetails: dijkstraResult.path.map((id) => ({
            districtId: id,
            name: districtMap.get(id)?.name || `District ${id}`
          })),
          estimatedTimeMinutes: dijkstraResult.cost,
          totalDistanceKm: dijkstraResult.totalDistanceKm
        });
      }
    }

    // At pickup, find nearest undelivered stop using Floyd-Warshall O(1)
    let nearestStop = null;
    let nearestDist = Infinity;

    for (const stop of undeliveredStops) {
      const d = distMatrix[pickupDistrictId]?.[stop.districtId];
      if (d !== undefined && d < Infinity && d < nearestDist) {
        nearestDist = d;
        nearestStop = stop;
      }
    }

    if (!nearestStop) {
      return res.json({ success: true, hasStep: false, message: 'No reachable delivery stops' });
    }

    // Reconstruct path
    const dijkstraResult = dijkstraFastestRoute(n, edges, pickupDistrictId, nearestStop.districtId);

    res.json({
      success: true,
      hasStep: true,
      stepType: 'to-delivery',
      vehicleId,
      stopIndex: nearestStop.stopIndex,
      from: {
        districtId: pickupDistrictId,
        districtName: districtMap.get(pickupDistrictId)?.name || `District ${pickupDistrictId}`
      },
      to: {
        districtId: nearestStop.districtId,
        districtName: nearestStop.districtName || `District ${nearestStop.districtId}`,
        type: 'delivery',
        stopIndex: nearestStop.stopIndex
      },
      path: dijkstraResult.path,
      pathDetails: dijkstraResult.path.map((id) => ({
        districtId: id,
        name: districtMap.get(id)?.name || `District ${id}`
      })),
      estimatedTimeMinutes: dijkstraResult.cost,
      totalDistanceKm: dijkstraResult.totalDistanceKm,
      remainingStops: undeliveredStops.length - 1
    });
  } catch (err) {
    next(err);
  }
};
