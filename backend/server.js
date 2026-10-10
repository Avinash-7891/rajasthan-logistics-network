const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const networkRoutes = require('./routes/networkRoutes');
const algorithmRoutes = require('./routes/algorithmRoutes');
const orderRoutes = require('./routes/orderRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Models for initial seed check
const District = require('./models/District');
const seedData = require('./seed/seed');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Rajasthan Logistics Network API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/algorithms', algorithmRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty
    const districtCount = await District.countDocuments();
    if (districtCount === 0) {
      console.log('[Auto-Seed] Empty database detected. Populating initial Rajasthan network...');
      // Run seed inline
      const { districts, roads, warehouses, vehicles, seedUsers } = require('./seed/rajasthanData');
      const { tarjanBridges, kruskalMST } = require('./utils/algorithms');
      const Road = require('./models/Road');
      const Warehouse = require('./models/Warehouse');
      const Vehicle = require('./models/Vehicle');
      const User = require('./models/User');
      const TrafficData = require('./models/TrafficData');

      await District.insertMany(districts);

      const bridgeResult = tarjanBridges(districts.length, roads);
      const bridgeIds = new Set(bridgeResult.criticalBridges.map((b) => b.roadId));
      const mstResult = kruskalMST(districts.length, roads);
      const mstIds = new Set(mstResult.mstEdges.map((e) => e.roadId));

      const enhancedRoads = roads.map((r) => ({
        ...r,
        isCriticalBridge: bridgeIds.has(r.roadId),
        isMstSelected: mstIds.has(r.roadId)
      }));
      await Road.insertMany(enhancedRoads);

      // Traffic
      const trafficEntries = enhancedRoads.map((r) => ({
        roadId: r.roadId,
        congestionLevel: 'Normal',
        congestionMultiplier: 1.0,
        estimatedDelayMinutes: 0,
        timestamp: new Date()
      }));
      await TrafficData.insertMany(trafficEntries);

      await Warehouse.insertMany(warehouses);
      await Vehicle.insertMany(vehicles);

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
      console.log('[Auto-Seed] Successfully initialized all Rajasthan network data and accounts!');

      // Demo dispatch records so the admin Transit History panel is never empty
      await require('./seed/historicalOrders')();
    }

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Rajasthan Logistics Network API Server Running`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
