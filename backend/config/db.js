const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rajasthan_logistics';

  // Connection options for stable, fast connections
  const options = {
    serverSelectionTimeoutMS: 10000,        // 10s (was 3s - too short)
    socketTimeoutMS: 45000,                  // 45s socket timeout
    connectTimeoutMS: 10000,                 // 10s initial connect timeout
    maxPoolSize: 20,                         // Connection pooling
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    retryReads: true,
    heartbeatFrequencyMS: 10000
  };

  // Connection event handlers for monitoring
  mongoose.connection.on('connecting', () => {
    console.log('[MongoDB] Connecting to database...');
  });

  mongoose.connection.on('connected', () => {
    console.log(`[MongoDB] Connected to database at: ${uri}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected from database. Will auto-reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Reconnected to database successfully.');
  });

  try {
    await mongoose.connect(uri, options);
  } catch (err) {
    console.warn(`[MongoDB] Direct connection to ${uri} failed: ${err.message}`);
    console.log('[MongoDB] Starting automated in-memory MongoDB fallback server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri, options);
      console.log(`[MongoDB] Connected successfully to In-Memory MongoDB at: ${memoryUri}`);
    } catch (memErr) {
      console.error('[MongoDB] Failed to initialize in-memory database:', memErr);
      throw memErr;
    }
  }
};

module.exports = connectDB;
