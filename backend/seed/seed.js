const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const District = require('../models/District');
const Road = require('../models/Road');
const TrafficData = require('../models/TrafficData');
const Warehouse = require('../models/Warehouse');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Order = require('../models/Order');

const { districts, roads, warehouses, vehicles, seedUsers } = require('./rajasthanData');
const { tarjanBridges, kruskalMST } = require('../utils/algorithms');
const seedHistoricalOrders = require('./historicalOrders');

async function seedData() {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Preparing to populate Rajasthan network...');

    // Clear existing collections
    await District.deleteMany({});
    await Road.deleteMany({});
    await TrafficData.deleteMany({});
    await Warehouse.deleteMany({});
    await Vehicle.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    console.log('[Seed] Cleared old collections.');

    // 1. Insert Districts
    const createdDistricts = await District.insertMany(districts);
    console.log(`[Seed] Inserted ${createdDistricts.length} Rajasthan districts.`);

    // 2. Pre-calculate Critical Bridges and MST on the seeded roads
    const bridgeResult = tarjanBridges(districts.length, roads);
    const bridgeIds = new Set(bridgeResult.criticalBridges.map((b) => b.roadId));

    const mstResult = kruskalMST(districts.length, roads);
    const mstIds = new Set(mstResult.mstEdges.map((e) => e.roadId));

    const enhancedRoads = roads.map((r) => ({
      ...r,
      isCriticalBridge: bridgeIds.has(r.roadId),
      isMstSelected: mstIds.has(r.roadId)
    }));

    const createdRoads = await Road.insertMany(enhancedRoads);
    console.log(`[Seed] Inserted ${createdRoads.length} roads (${bridgeIds.size} critical bridges identified via Tarjan).`);

    // 3. Insert mock TrafficData for roads
    const trafficEntries = [];
    const congestionLevels = ['Normal', 'Moderate', 'Heavy'];
    for (const r of createdRoads) {
      const isModerate = Math.random() < 0.25;
      const isHeavy = !isModerate && Math.random() < 0.1;
      const level = isHeavy ? 'Heavy' : isModerate ? 'Moderate' : 'Normal';
      const multiplier = level === 'Heavy' ? 1.6 : level === 'Moderate' ? 1.25 : 1.0;
      const delay = level === 'Heavy' ? 35 : level === 'Moderate' ? 15 : 0;

      trafficEntries.push({
        roadId: r.roadId,
        congestionLevel: level,
        congestionMultiplier: multiplier,
        estimatedDelayMinutes: delay,
        timestamp: new Date()
      });
    }
    await TrafficData.insertMany(trafficEntries);
    console.log(`[Seed] Seeded traffic simulations for ${trafficEntries.length} roads.`);

    // 4. Insert Warehouses
    const createdWarehouses = await Warehouse.insertMany(warehouses);
    console.log(`[Seed] Inserted ${createdWarehouses.length} warehouses.`);

    // 5. Insert Vehicles
    const createdVehicles = await Vehicle.insertMany(vehicles);
    console.log(`[Seed] Inserted ${createdVehicles.length} logistics fleet vehicles.`);

    // 6. Insert Users (Admin, Driver, Client)
    for (const u of seedUsers) {
      const passwordHash = await User.hashPassword(u.password);
      await User.create({
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        phone: u.phone,
        assignedVehicleId: u.assignedVehicleId || null
      });
    }
    console.log(`[Seed] Seeded ${seedUsers.length} default users (Admin, Driver, Client).`);

    // 7. Insert historical demo orders so Transit History is never empty
    await seedHistoricalOrders();

    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedData();
}

module.exports = seedData;
