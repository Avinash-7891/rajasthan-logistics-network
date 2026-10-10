const Vehicle = require('../models/Vehicle');
const District = require('../models/District');
const Road = require('../models/Road');
const TrafficData = require('../models/TrafficData');
const Order = require('../models/Order');
const { dijkstraFastestRoute, bestFitVehicleAssignment } = require('../utils/algorithms');
const { processPendingOrdersQueue } = require('./orderController');

// Helper to assemble road edges with traffic speeds (same as orderController)
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

// @desc    Get all vehicles with current status, location, capacity
// @route   GET /api/vehicles
// @access  Private
exports.getVehicles = async (req, res, next) => {
  try {
    const [vehicles, districts] = await Promise.all([
      Vehicle.find().sort({ vehicleId: 1 }),
      District.find()
    ]);

    const districtMap = new Map(districts.map((d) => [d.districtId, d.name]));

    const enriched = vehicles.map((v) => ({
      ...v.toObject(),
      currentLocationName: districtMap.get(v.currentLocationDistrictId) || `District ${v.currentLocationDistrictId}`,
      availableCapacityKg: Math.max(0, v.maxCapacityKg - v.currentLoadKg)
    }));

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get optimal route for a vehicle (Dijkstra with time weights)
// @route   GET /api/vehicles/:id/route
// @access  Private
exports.getVehicleRoute = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ vehicleId: req.params.id });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // No order assigned -> no route
    if (!vehicle.currentOrderId) {
      return res.json({
        success: true,
        hasRoute: false,
        message: 'No active order assigned to this vehicle',
        vehicleId: vehicle.vehicleId,
        status: vehicle.status
      });
    }

    // Get the assigned order
    const order = await Order.findOne({ orderId: vehicle.currentOrderId });
    if (!order) {
      return res.json({
        success: true,
        hasRoute: false,
        message: 'Assigned order not found',
        vehicleId: vehicle.vehicleId,
        status: vehicle.status
      });
    }

    // All stops delivered -> no route
    const undeliveredStops = order.destinations.filter((d) => !d.delivered);
    if (undeliveredStops.length === 0) {
      return res.json({
        success: true,
        hasRoute: false,
        message: 'All stops delivered',
        vehicleId: vehicle.vehicleId,
        status: vehicle.status
      });
    }

    const [districts, edges] = await Promise.all([
      District.find().sort({ districtId: 1 }),
      getRoadEdges()
    ]);

    const districtMap = new Map(districts.map((d) => [d.districtId, d]));
    const n = districts.length;

    const currentLocation = vehicle.currentLocationDistrictId;
    const pickupDistrictId = order.pickupDistrictId;
    const nextStop = undeliveredStops[0];

    let routeType;
    let fromDistrictId;
    let toDistrictId;

    // Determine if vehicle needs to go to pickup first or directly to delivery
    if (currentLocation !== pickupDistrictId) {
      // Vehicle hasn't reached pickup yet -> route to pickup
      routeType = 'pickup';
      fromDistrictId = currentLocation;
      toDistrictId = pickupDistrictId;
    } else {
      // Vehicle at pickup -> route to next delivery stop
      routeType = 'delivery';
      fromDistrictId = pickupDistrictId;
      toDistrictId = nextStop.districtId;
    }

    // Run Dijkstra to find the fastest route
    const dijkstraResult = dijkstraFastestRoute(n, edges, fromDistrictId, toDistrictId);

    if (!dijkstraResult.reachable) {
      return res.json({
        success: true,
        hasRoute: false,
        message: 'No route found between districts',
        vehicleId: vehicle.vehicleId,
        from: fromDistrictId,
        to: toDistrictId
      });
    }

    // Build path with district names
    const pathDetails = dijkstraResult.path.map((districtId) => ({
      districtId,
      name: districtMap.get(districtId)?.name || `District ${districtId}`
    }));

    res.json({
      success: true,
      hasRoute: true,
      vehicleId: vehicle.vehicleId,
      orderId: order.orderId,
      routeType,
      from: {
        districtId: fromDistrictId,
        districtName: districtMap.get(fromDistrictId)?.name || `District ${fromDistrictId}`
      },
      to: {
        districtId: toDistrictId,
        districtName: districtMap.get(toDistrictId)?.name || `District ${toDistrictId}`,
        type: routeType,
        stopIndex: routeType === 'delivery' ? nextStop.stopIndex : null
      },
      path: dijkstraResult.path,
      pathDetails,
      estimatedTimeMinutes: dijkstraResult.cost,
      totalDistanceKm: dijkstraResult.totalDistanceKm,
      remainingStops: undeliveredStops.length
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark vehicle as "Done" - clear all route data and reset to idle
// @route   POST /api/vehicles/:id/done
// @access  Private
exports.markVehicleDone = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ vehicleId: req.params.id });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const previousOrderId = vehicle.currentOrderId;

    // Clear all route/order data for this vehicle
    vehicle.status = 'idle';
    vehicle.currentOrderId = null;
    vehicle.currentLoadKg = 0;
    // Keep currentLocationDistrictId as-is (vehicle stays where it ended up)
    await vehicle.save();

    // Check if there are pending orders in the queue that can be assigned
    let newOrderAssigned = false;
    if (previousOrderId) {
      const pendingOrders = await Order.find({ status: 'queued' }).sort({ createdAt: 1 });
      if (pendingOrders.length > 0) {
        const [districts, edges] = await Promise.all([
          District.find().sort({ districtId: 1 }),
          getRoadEdges()
        ]);
        const n = districts.length;

        // Try to assign the oldest pending order to this vehicle
        for (const pendingOrder of pendingOrders) {
          const dijkstraResult = dijkstraFastestRoute(n, edges, pendingOrder.pickupDistrictId);
          const assignment = bestFitVehicleAssignment(
            [vehicle],
            pendingOrder.totalWeightKg,
            dijkstraResult.dist
          );

          if (assignment.assigned) {
            pendingOrder.status = 'in-transit';
            pendingOrder.assignedVehicleId = vehicle.vehicleId;
            await pendingOrder.save();

            vehicle.status = 'in-transit';
            vehicle.currentOrderId = pendingOrder.orderId;
            vehicle.currentLoadKg = pendingOrder.totalWeightKg;
            await vehicle.save();

            newOrderAssigned = true;
            break;
          }
        }
      }
    }

    res.json({
      success: true,
      message: newOrderAssigned
        ? 'Vehicle cleared and new order assigned'
        : 'Vehicle cleared and reset to idle',
      vehicleId: vehicle.vehicleId,
      newOrderAssigned,
      status: vehicle.status
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update vehicle status or location
// @route   PATCH /api/vehicles/:id
// @access  Private (Admin/Driver)
exports.updateVehicleStatus = async (req, res, next) => {
  try {
    const { status, currentLocationDistrictId, currentLoadKg } = req.body;

    const vehicle = await Vehicle.findOneAndUpdate(
      { vehicleId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // If vehicle became idle, process pending order queue
    if (status === 'idle') {
      setTimeout(processPendingOrdersQueue, 500);
    }

    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

// @desc    Manually trigger pending orders assignment
// @route   POST /api/vehicles/assign-queue
// @access  Private (Admin)
exports.triggerQueueCheck = async (req, res, next) => {
  try {
    await processPendingOrdersQueue();
    res.json({ success: true, message: 'Pending order queue processed' });
  } catch (err) {
    next(err);
  }
};
