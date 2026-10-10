const mongoose = require('mongoose');

const trafficDataSchema = new mongoose.Schema(
  {
    roadId: {
      type: String,
      required: true,
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    congestionLevel: {
      type: String,
      enum: ['Normal', 'Moderate', 'Heavy', 'Severe'],
      default: 'Normal'
    },
    congestionMultiplier: {
      type: Number,
      default: 1.0 // 1.0 (Normal), 1.25 (Moderate), 1.6 (Heavy), 2.2 (Severe)
    },
    estimatedDelayMinutes: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrafficData', trafficDataSchema);
