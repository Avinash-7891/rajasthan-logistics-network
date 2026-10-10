const Order = require('../models/Order');
const Vehicle = require('../models/Vehicle');
const District = require('../models/District');
const Road = require('../models/Road');
const TrafficData = require('../models/TrafficData');
const {
  dijkstraFastestRoute,
  nearestNeighborRoute,
  greedyMultiVehicleAssignment
} = require('../utils/algorithms');

// Helper to assemble road edges with traffic speeds
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

// Queue processor: Auto-assigns pending orders when vehicles become idle
async function processPendingOrdersQueue() {
  try {
    const pendingOrders = await Order.find({ status: 'queued' }).sort({ createdAt: 1 });
    if (pendingOrders.length === 0) return;

    const availableVehicles = await Vehicle.find({ status: 'idle' });
    if (availableVehicles.length === 0) return;

    const [districts, edges] = await Promise.all([
      District.find().sort({ districtId: 1 }),
      getRoadEdges()
    ]);
    const n = districts.length;

    for (const order of pendingOrders) {
      const dijkstraResult = dijkstraFastestRoute(n, edges, order.pickupDistrictId);
      const assignment = greedyMultiVehicleAssignment(
        availableVehicles,
        order.totalWeightKg,
        dijkstraResult.dist
      );

      if (assignment.assigned) {
        order.status = 'in-transit';
        order.assignedVehicleId = assignment.vehicleIds[0] || null;
        order.assignedVehicleIds = assignment.vehicleIds;

        // Set vehicle loads
        const loads = new Map();
        for (const v of assignment.vehicles) {
          loads.set(v.vehicle.vehicleId, v.loadKg);
        }
        order.vehicleLoads = loads;
        await order.save();

        // Update all assigned vehicles
        for (const v of assignment.vehicles) {
          v.vehicle.status = 'in-transit';
          v.vehicle.currentOrderId = order.orderId;
          v.vehicle.currentLoadKg = v.loadKg;
          await v.vehicle.save();

          // Remove from availableVehicles pool
          const idx = availableVehicles.findIndex((av) => av.vehicleId === v.vehicle.vehicleId);
          if (idx !== -1) availableVehicles.splice(idx, 1);
        }

        console.log(`[Queue Processor] Order ${order.orderId} auto-assigned to vehicles: ${assignment.vehicleIds.join(', ')}`);
      }
    }
  } catch (err) {
    console.error('[Queue Processor] Error processing queue:', err.message);
  }
}

// @desc    Get all active transit orders with their assigned vehicles
// @route   GET /api/orders/transit
// @access  Private
exports.getTransitOrders = async (req, res, next) => {
  try {
    const transitOrders = await Order.find({
      status: { $in: ['assigned', 'in-transit'] }
    }).sort({ createdAt: -1 });

    const enriched = transitOrders.map((order) => ({
      orderId: order.orderId,
      status: order.status,
      pickupAddress: order.pickupAddress,
      pickupDistrictId: order.pickupDistrictId,
      pickupDistrictName: order.pickupDistrictName,
      totalWeightKg: order.totalWeightKg,
      assignedVehicleIds: order.assignedVehicleIds || (order.assignedVehicleId ? [order.assignedVehicleId] : []),
      assignedVehicleId: order.assignedVehicleId,
      vehicleLoads: order.vehicleLoads ? Object.fromEntries(order.vehicleLoads) : {},
      destinations: order.destinations,
      route: order.route,
      createdAt: order.createdAt
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

// @desc    Full dispatch history - last N orders with vehicles, loads and stops
// @route   GET /api/orders/history?limit=20
// @access  Private
exports.getOrderHistory = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(limit);

    // Collect every vehicle id referenced by these orders (single DB hit)
    const allVehicleIds = [
      ...new Set(
        orders.flatMap((o) =>
          o.assignedVehicleIds?.length > 0
            ? o.assignedVehicleIds
            : (o.assignedVehicleId ? [o.assignedVehicleId] : [])
        )
      )
    ];
    const vehicles = await Vehicle.find({ vehicleId: { $in: allVehicleIds } });
    const vehicleMap = new Map(vehicles.map((v) => [v.vehicleId, v]));

    const data = orders.map((o) => {
      const ids = o.assignedVehicleIds?.length > 0
        ? o.assignedVehicleIds
        : (o.assignedVehicleId ? [o.assignedVehicleId] : []);

      // vehicleLoads is a Map in mongoose -> plain object for JSON
      const loads = o.vehicleLoads
        ? (typeof o.vehicleLoads.entries === 'function'
            ? Object.fromEntries(o.vehicleLoads.entries())
            : { ...o.vehicleLoads })
        : {};

      const destinations = (o.destinations || []).map((d, idx) => ({
        stopIndex: d.stopIndex ?? idx + 1,
        districtId: d.districtId,
        districtName: d.districtName || `District ${d.districtId}`,
        weightKg: d.weightKg || 0,
        delivered: !!d.delivered,
        deliveredAt: d.deliveredAt || null
      }));

      return {
        orderId: o.orderId,
        status: o.status,
        clientName: o.clientName || 'Client',
        pickup: {
          districtId: o.pickupDistrictId,
          districtName: o.pickupDistrictName || `District ${o.pickupDistrictId}`,
          address: o.pickupAddress
        },
        vehicles: ids.map((id) => ({
          vehicleId: id,
          vehicleNumber: vehicleMap.get(id)?.vehicleNumber || null,
          driverName: vehicleMap.get(id)?.driverName || null,
          capacityKg: vehicleMap.get(id)?.maxCapacityKg ?? null,
          loadKg: loads[id] || 0
        })),
        totalWeightKg: o.totalWeightKg,
        destinations,
        totalStops: destinations.length,
        deliveredStops: destinations.filter((d) => d.delivered).length,
        totalDistanceKm: o.route?.totalDistanceKm || 0,
        estimatedTimeMinutes: o.route?.estimatedTimeMinutes || 0,
        createdAt: o.createdAt,
        completedAt: o.completedAt
      };
    });

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Search orders by order number (partial match)
// @route   GET /api/orders/search?q=ORD-123
// @access  Private
exports.searchOrders = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    // Build role-based filter
    let roleFilter = {};
    if (req.user.role === 'client') {
      roleFilter = { clientId: req.user._id };
    }

    // Search by orderId (case-insensitive partial match)
    const orders = await Order.find({
      ...roleFilter,
      orderId: { $regex: q, $options: 'i' }
    }).sort({ createdAt: -1 }).limit(20);

    const enriched = orders.map((order) => ({
      orderId: order.orderId,
      status: order.status,
      pickupAddress: order.pickupAddress,
      pickupDistrictId: order.pickupDistrictId,
      pickupDistrictName: order.pickupDistrictName,
      totalWeightKg: order.totalWeightKg,
      assignedVehicleIds: order.assignedVehicleIds || (order.assignedVehicleId ? [order.assignedVehicleId] : []),
      assignedVehicleId: order.assignedVehicleId,
      vehicleLoads: order.vehicleLoads ? Object.fromEntries(order.vehicleLoads) : {},
      destinations: order.destinations,
      route: order.route,
      createdAt: order.createdAt
    }));

    res.json({
      success: true,
      count: enriched.length,
      query: q,
      data: enriched
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get optimal route for a specific order (terminal -> pickup -> delivery)
// @route   GET /api/orders/:id/route
// @access  Private
exports.getOrderRoute = async (req, res, next) => {
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

    // Get assigned vehicles with their current locations
    const assignedVehicleIds = order.assignedVehicleIds?.length > 0
      ? order.assignedVehicleIds
      : (order.assignedVehicleId ? [order.assignedVehicleId] : []);

    if (assignedVehicleIds.length === 0) {
      return res.json({
        success: true,
        hasRoute: false,
        message: 'No vehicles assigned to this order yet'
      });
    }

    // Get vehicles
    const vehicles = await Vehicle.find({ vehicleId: { $in: assignedVehicleIds } });

    // Find first undelivered stop
    const nextStop = order.destinations.find((d) => !d.delivered);
    if (!nextStop) {
      return res.json({
        success: true,
        hasRoute: false,
        message: 'All stops delivered'
      });
    }

    // Build routes for each vehicle
    const vehicleRoutes = [];

    for (const vehicle of vehicles) {
      const currentLocation = vehicle.currentLocationDistrictId;
      const pickupDistrictId = order.pickupDistrictId;
      const deliveryDistrictId = nextStop.districtId;

      let fromDistrictId, toDistrictId, routeType;

      if (currentLocation !== pickupDistrictId) {
        // Vehicle needs to go to pickup first
        routeType = 'to-pickup';
        fromDistrictId = currentLocation;
        toDistrictId = pickupDistrictId;
      } else {
        // Vehicle at pickup, go to delivery
        routeType = 'to-delivery';
        fromDistrictId = pickupDistrictId;
        toDistrictId = deliveryDistrictId;
      }

      const dijkstraResult = dijkstraFastestRoute(n, edges, fromDistrictId, toDistrictId);

      if (dijkstraResult.reachable) {
        const pathDetails = dijkstraResult.path.map((districtId) => ({
          districtId,
          name: districtMap.get(districtId)?.name || `District ${districtId}`
        }));

        vehicleRoutes.push({
          vehicleId: vehicle.vehicleId,
          vehicleNumber: vehicle.vehicleNumber,
          driverName: vehicle.driverName,
          routeType,
          from: {
            districtId: fromDistrictId,
            districtName: districtMap.get(fromDistrictId)?.name || `District ${fromDistrictId}`
          },
          to: {
            districtId: toDistrictId,
            districtName: districtMap.get(toDistrictId)?.name || `District ${toDistrictId}`,
            type: routeType === 'to-pickup' ? 'pickup' : 'delivery',
            stopIndex: routeType === 'to-delivery' ? nextStop.stopIndex : null
          },
          path: dijkstraResult.path,
          pathDetails,
          estimatedTimeMinutes: dijkstraResult.cost,
          totalDistanceKm: dijkstraResult.totalDistanceKm,
          loadKg: order.vehicleLoads?.get(vehicle.vehicleId) || 0
        });
      }
    }

    if (vehicleRoutes.length === 0) {
      return res.json({
        success: true,
        hasRoute: false,
        message: 'No reachable routes found'
      });
    }

    res.json({
      success: true,
      hasRoute: true,
      orderId: order.orderId,
      pickupDistrictId: order.pickupDistrictId,
      pickupDistrictName: order.pickupDistrictName,
      nextStop: {
        stopIndex: nextStop.stopIndex,
        districtId: nextStop.districtId,
        districtName: nextStop.districtName,
        weightKg: nextStop.weightKg
      },
      vehicleRoutes,
      totalVehicles: vehicleRoutes.length
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Place a new delivery order
// @route   POST /api/orders
// @access  Private (Client/Admin)
exports.createOrder = async (req, res, next) => {
  try {
    const {
      pickupAddress,
      pickupDistrictId,
      destinations,
      totalWeightKg,
      customPickupCoord
    } = req.body;

    if (!pickupAddress || !pickupDistrictId || !destinations || destinations.length === 0) {
      return res.status(400).json({ success: false, message: 'Pickup details and destination stops are required' });
    }

    const calculatedWeight = totalWeightKg ||
      destinations.reduce((acc, d) => acc + (Number(d.weightKg) || 0), 0);

    const [districts, edges, idleVehicles] = await Promise.all([
      District.find().sort({ districtId: 1 }),
      getRoadEdges(),
      Vehicle.find({ status: 'idle' })
    ]);

    const districtMap = new Map(districts.map((d) => [d.districtId, d]));
    const n = districts.length;

    // Feature 11: Support temporary client-owned pickup/drop node if coordinates given
    let effectivePickupDistrictId = Number(pickupDistrictId);
    let tempDistrictCreated = null;

    if (customPickupCoord && customPickupCoord.latitude && customPickupCoord.longitude) {
      let nearestDistrict = districts[0];
      let minGeoDist = 1e9;
      for (const d of districts) {
        const dLat = d.latitude - customPickupCoord.latitude;
        const dLon = d.longitude - customPickupCoord.longitude;
        const distApprox = Math.sqrt(dLat * dLat + dLon * dLon) * 111;
        if (distApprox < minGeoDist) {
          minGeoDist = distApprox;
          nearestDistrict = d;
        }
      }
      effectivePickupDistrictId = nearestDistrict.districtId;
    }

    // 1. Calculate Dijkstra shortest travel times from pickup district to all nodes
    const pickupDijkstra = dijkstraFastestRoute(n, edges, effectivePickupDistrictId);

    // 2. Greedy Multi-Vehicle Assignment (lower bound approach)
    const vehicleAssignment = greedyMultiVehicleAssignment(
      idleVehicles,
      calculatedWeight,
      pickupDijkstra.dist
    );

    // 3. Multi-Stop Delivery Sequencing (Nearest Neighbor)
    const stopDistrictIds = [
      effectivePickupDistrictId,
      ...destinations.map((d) => Number(d.districtId))
    ];
    const k = destinations.length;
    const total_nodes = k + 1;

    const distMatrix = Array.from({ length: total_nodes }, () => new Array(total_nodes).fill(0));
    for (let i = 0; i < total_nodes; i++) {
      const fromNode = stopDistrictIds[i];
      const singleSourceDijkstra = dijkstraFastestRoute(n, edges, fromNode);
      for (let j = 0; j < total_nodes; j++) {
        const toNode = stopDistrictIds[j];
        distMatrix[i][j] = singleSourceDijkstra.dist[toNode] >= 0
          ? singleSourceDijkstra.dist[toNode]
          : 9999;
      }
    }

    const stopsData = [
      {
        districtId: effectivePickupDistrictId,
        districtName: districtMap.get(effectivePickupDistrictId)?.name || 'Pickup Hub',
        isPickup: true,
        address: pickupAddress
      },
      ...destinations.map((d, idx) => ({
        warehouseId: d.warehouseId || null,
        districtId: Number(d.districtId),
        districtName: districtMap.get(Number(d.districtId))?.name || `District ${d.districtId}`,
        weightKg: Number(d.weightKg) || 0,
        isPickup: false,
        stopNumber: idx + 1
      }))
    ];

    const routingResult = nearestNeighborRoute(k, distMatrix, stopsData);

    // Reconstruct full path of districts across all legs
    const fullDistrictPath = [];
    let accumulatedDistanceKm = 0;
    for (let step = 0; step < routingResult.pathIndices.length - 1; step++) {
      const fromStopIdx = routingResult.pathIndices[step];
      const toStopIdx = routingResult.pathIndices[step + 1];
      const fromDistId = stopDistrictIds[fromStopIdx];
      const toDistId = stopDistrictIds[toStopIdx];

      const legRoute = dijkstraFastestRoute(n, edges, fromDistId, toDistId);
      if (step === 0) {
        fullDistrictPath.push(...legRoute.path);
      } else {
        fullDistrictPath.push(...legRoute.path.slice(1));
      }
      accumulatedDistanceKm += legRoute.totalDistanceKm;
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const isAssigned = vehicleAssignment.assigned;
    const initialStatus = isAssigned ? 'assigned' : 'queued';

    // Format destinations with sequence
    const orderedDestinations = routingResult.orderedStops
      .filter((s) => !s.isPickup)
      .map((s, idx) => ({
        stopIndex: idx + 1,
        warehouseId: s.warehouseId,
        districtId: s.districtId,
        districtName: s.districtName,
        weightKg: s.weightKg,
        delivered: false
      }));

    // Build vehicle loads map
    const vehicleLoads = new Map();
    if (isAssigned) {
      for (const v of vehicleAssignment.vehicles) {
        vehicleLoads.set(v.vehicle.vehicleId, v.loadKg);
      }
    }

    const order = await Order.create({
      orderId,
      clientId: req.user._id,
      clientName: req.user.name,
      pickupAddress,
      pickupDistrictId: effectivePickupDistrictId,
      pickupDistrictName: districtMap.get(effectivePickupDistrictId)?.name,
      destinations: orderedDestinations,
      totalWeightKg: calculatedWeight,
      status: initialStatus,
      assignedVehicleId: isAssigned ? (vehicleAssignment.vehicleIds[0] || null) : null,
      assignedVehicleIds: isAssigned ? vehicleAssignment.vehicleIds : [],
      vehicleLoads: isAssigned ? vehicleLoads : new Map(),
      route: {
        stops: routingResult.pathIndices.map((idx) => stopDistrictIds[idx]),
        totalDistanceKm: accumulatedDistanceKm,
        estimatedTimeMinutes: routingResult.totalDistance,
        pathDistricts: fullDistrictPath
      }
    });

    if (isAssigned) {
      // Update all assigned vehicles
      for (const v of vehicleAssignment.vehicles) {
        await Vehicle.findOneAndUpdate(
          { vehicleId: v.vehicle.vehicleId },
          {
            status: 'in-transit',
            currentOrderId: orderId,
            currentLoadKg: v.loadKg
          }
        );
      }
    }

    res.status(201).json({
      success: true,
      message: isAssigned
        ? `Order placed and ${vehicleAssignment.vehicleIds.length} vehicle(s) assigned successfully`
        : 'Order placed in pending queue (waiting for matching vehicle)',
      order,
      assignment: {
        assigned: isAssigned,
        vehicleIds: vehicleAssignment.vehicleIds || [],
        vehicles: isAssigned ? vehicleAssignment.vehicles.map((v) => ({
          vehicleId: v.vehicle.vehicleId,
          capacityKg: v.capacityKg,
          loadKg: v.loadKg
        })) : [],
        totalCapacityKg: vehicleAssignment.totalCapacityKg || 0,
        reason: vehicleAssignment.reason || null
      },
      routing: routingResult,
      algorithmsUsed: {
        vehicleAssignment: 'Greedy Multi-Vehicle Assignment (Lower Bound) - Problem 8',
        multiStopSequencing: 'Nearest Neighbor Heuristic (TSP) - Problem 7',
        roadTraversals: 'Dijkstra Shortest Path with Live Traffic - Problem 2'
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get orders (Clients see own, Drivers/Admin see all/assigned)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'client') {
      filter = { clientId: req.user._id };
    } else if (req.user.role === 'driver') {
      filter = {
        $or: [
          { assignedVehicleId: req.user.assignedVehicleId },
          { assignedVehicleIds: { $in: [req.user.assignedVehicleId] } },
          { status: { $in: ['assigned', 'in-transit'] } }
        ]
      };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// @desc    Driver marks pickup / stop delivery as complete
// @route   PATCH /api/orders/:id/stops/:stopIndex/deliver
// @access  Private (Driver/Admin)
exports.deliverStop = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const stopIndex = Number(req.params.stopIndex);
    const targetStop = order.destinations.find((d) => d.stopIndex === stopIndex);

    if (!targetStop) {
      return res.status(404).json({ success: false, message: 'Stop index not found' });
    }

    targetStop.delivered = true;
    targetStop.deliveredAt = new Date();

    // Check if all stops in this order are now delivered
    const allDelivered = order.destinations.every((d) => d.delivered);

    if (allDelivered) {
      order.status = 'delivered';
      order.completedAt = new Date();

      // Free all assigned vehicles
      const vehicleIds = order.assignedVehicleIds?.length > 0
        ? order.assignedVehicleIds
        : (order.assignedVehicleId ? [order.assignedVehicleId] : []);

      if (vehicleIds.length > 0) {
        const lastStop = order.destinations[order.destinations.length - 1];
        await Vehicle.updateMany(
          { vehicleId: { $in: vehicleIds } },
          {
            status: 'idle',
            currentLocationDistrictId: lastStop.districtId,
            currentLoadKg: 0,
            currentOrderId: null
          }
        );

        console.log(`[Order Delivered] Vehicles freed: ${vehicleIds.join(', ')}. Triggering pending queue...`);

        // Trigger queue processor
        setTimeout(processPendingOrdersQueue, 500);
      }
    } else {
      order.status = 'in-transit';

      // Move assigned vehicles to the district we just delivered to
      const assignedIds = order.assignedVehicleIds?.length > 0
        ? order.assignedVehicleIds
        : (order.assignedVehicleId ? [order.assignedVehicleId] : []);

      if (assignedIds.length > 0) {
        await Vehicle.updateMany(
          { vehicleId: { $in: assignedIds } },
          { currentLocationDistrictId: targetStop.districtId }
        );
        console.log(`[Stop Delivered] Order ${order.orderId} stop ${stopIndex} (district ${targetStop.districtId}) done. Vehicles moved.`);
      }
    }

    await order.save();

    res.json({
      success: true,
      message: allDelivered ? 'All stops delivered! Vehicles freed.' : `Stop ${stopIndex} marked delivered.`,
      order,
      allDelivered
    });
  } catch (err) {
    next(err);
  }
};

exports.processPendingOrdersQueue = processPendingOrdersQueue;
