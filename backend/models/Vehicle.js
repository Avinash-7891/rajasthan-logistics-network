const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    vehicleNumber: {
      type: String,
      required: true
    },
    modelType: {
      type: String,
      default: 'Cargo Truck'
    },
    maxCapacityKg: {
      type: Number,
      required: true
    },
    currentLocationDistrictId: {
      type: Number,
      required: true,
      ref: 'District'
    },
    status: {
      type: String,
      enum: ['idle', 'in-transit', 'maintenance'],
      default: 'idle'
    },
    currentLoadKg: {
      type: Number,
      default: 0
    },
    driverName: {
      type: String,
      default: 'Assigned Driver'
    },
    currentOrderId: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
