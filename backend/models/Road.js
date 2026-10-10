const mongoose = require('mongoose');

const roadSchema = new mongoose.Schema(
  {
    roadId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    fromDistrictId: {
      type: Number,
      required: true,
      ref: 'District'
    },
    toDistrictId: {
      type: Number,
      required: true,
      ref: 'District'
    },
    distanceKm: {
      type: Number,
      required: true
    },
    averageSpeedKmph: {
      type: Number,
      default: 65
    },
    roadType: {
      type: String,
      enum: ['Expressway', 'National Highway', 'State Highway', 'Major District Road'],
      default: 'National Highway'
    },
    name: {
      type: String,
      default: 'Highway'
    },
    isCriticalBridge: {
      type: Boolean,
      default: false
    },
    isMstSelected: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Road', roadSchema);
