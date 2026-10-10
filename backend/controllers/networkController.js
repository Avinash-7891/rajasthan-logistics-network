const District = require('../models/District');
const Road = require('../models/Road');
const TrafficData = require('../models/TrafficData');
const Warehouse = require('../models/Warehouse');
const { tarjanBridges, kruskalMST } = require('../utils/algorithms');

// --- Districts ---

exports.getDistricts = async (req, res, next) => {
  try {
    const districts = await District.find().sort({ districtId: 1 });
    res.json({ success: true, count: districts.length, data: districts });
  } catch (err) {
    next(err);
  }
};

exports.getDistrictById = async (req, res, next) => {
  try {
    const district = await District.findOne({ districtId: Number(req.params.id) });
    if (!district) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }
    res.json({ success: true, data: district });
  } catch (err) {
    next(err);
  }
};

exports.createDistrict = async (req, res, next) => {
  try {
    const { districtId, name, latitude, longitude, zone } = req.body;
    const existing = await District.findOne({ districtId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'District ID already exists' });
    }

    const district = await District.create({ districtId, name, latitude, longitude, zone });
    res.status(201).json({ success: true, data: district });
  } catch (err) {
    next(err);
  }
};

exports.updateDistrict = async (req, res, next) => {
  try {
    const district = await District.findOneAndUpdate(
      { districtId: Number(req.params.id) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!district) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }
    res.json({ success: true, data: district });
  } catch (err) {
    next(err);
  }
};

exports.deleteDistrict = async (req, res, next) => {
  try {
    const district = await District.findOneAndDelete({ districtId: Number(req.params.id) });
    if (!district) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }
    // Also remove connected roads
    await Road.deleteMany({
      $or: [{ fromDistrictId: Number(req.params.id) }, { toDistrictId: Number(req.params.id) }]
    });
    res.json({ success: true, message: 'District and connected roads removed' });
  } catch (err) {
    next(err);
  }
};

// --- Roads ---

exports.getRoads = async (req, res, next) => {
  try {
    const roads = await Road.find().sort({ roadId: 1 });
    res.json({ success: true, count: roads.length, data: roads });
  } catch (err) {
    next(err);
  }
};

exports.createRoad = async (req, res, next) => {
  try {
    const { fromDistrictId, toDistrictId, distanceKm, averageSpeedKmph, roadType, name } = req.body;
    const roadId = req.body.roadId || `R${fromDistrictId}-${toDistrictId}`;

    const road = await Road.create({
      roadId,
      fromDistrictId,
      toDistrictId,
      distanceKm,
      averageSpeedKmph: averageSpeedKmph || 65,
      roadType: roadType || 'National Highway',
      name: name || `Road ${fromDistrictId}-${toDistrictId}`
    });

    // Recompute bridges and MST flags
    const [allDistricts, allRoads] = await Promise.all([
      District.find(),
      Road.find()
    ]);
    const bridgeRes = tarjanBridges(allDistricts.length, allRoads);
    const bridgeIds = new Set(bridgeRes.criticalBridges.map((b) => b.roadId));
    const mstRes = kruskalMST(allDistricts.length, allRoads);
    const mstIds = new Set(mstRes.mstEdges.map((e) => e.roadId));

    await Promise.all(
      allRoads.map((r) =>
        Road.updateOne(
          { _id: r._id },
          {
            isCriticalBridge: bridgeIds.has(r.roadId),
            isMstSelected: mstIds.has(r.roadId)
          }
        )
      )
    );

    res.status(201).json({ success: true, data: road });
  } catch (err) {
    next(err);
  }
};

exports.updateRoad = async (req, res, next) => {
  try {
    const road = await Road.findOneAndUpdate(
      { roadId: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!road) {
      return res.status(404).json({ success: false, message: 'Road not found' });
    }
    res.json({ success: true, data: road });
  } catch (err) {
    next(err);
  }
};

exports.deleteRoad = async (req, res, next) => {
  try {
    const road = await Road.findOneAndDelete({ roadId: req.params.id });
    if (!road) {
      return res.status(404).json({ success: false, message: 'Road not found' });
    }
    res.json({ success: true, message: 'Road deleted' });
  } catch (err) {
    next(err);
  }
};

// --- Warehouses ---

exports.getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await Warehouse.find().sort({ warehouseId: 1 });
    res.json({ success: true, count: warehouses.length, data: warehouses });
  } catch (err) {
    next(err);
  }
};

// --- Traffic Data & Simulation ---

exports.getTraffic = async (req, res, next) => {
  try {
    const traffic = await TrafficData.find().sort({ timestamp: -1 });
    res.json({ success: true, count: traffic.length, data: traffic });
  } catch (err) {
    next(err);
  }
};

exports.simulateTrafficUpdates = async (req, res, next) => {
  try {
    const roads = await Road.find();
    const updates = [];

    for (const r of roads) {
      // Simulate random road conditions
      const rand = Math.random();
      let level = 'Normal';
      let multiplier = 1.0;
      let delay = 0;

      if (rand < 0.15) {
        level = 'Severe';
        multiplier = 2.2;
        delay = 45;
      } else if (rand < 0.35) {
        level = 'Heavy';
        multiplier = 1.6;
        delay = 25;
      } else if (rand < 0.60) {
        level = 'Moderate';
        multiplier = 1.25;
        delay = 10;
      }

      updates.push({
        roadId: r.roadId,
        congestionLevel: level,
        congestionMultiplier: multiplier,
        estimatedDelayMinutes: delay,
        timestamp: new Date()
      });

      await TrafficData.findOneAndUpdate(
        { roadId: r.roadId },
        {
          congestionLevel: level,
          congestionMultiplier: multiplier,
          estimatedDelayMinutes: delay,
          timestamp: new Date()
        },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      message: 'Simulated traffic conditions updated across Rajasthan road network',
      count: updates.length
    });
  } catch (err) {
    next(err);
  }
};
