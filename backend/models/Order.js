const mongoose = require('mongoose');

const destinationStopSchema = new mongoose.Schema({
  stopIndex: { type: Number },
  warehouseId: { type: String, default: null },
  districtId: { type: Number, required: true },
  districtName: { type: String },
  weightKg: { type: Number, required: true },
  delivered: { type: Boolean, default: false },
  deliveredAt: { type: Date, default: null }
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    clientName: {
      type: String,
      default: 'Client'
    },
    pickupAddress: {
      type: String,
      required: true
    },
    pickupDistrictId: {
      type: Number,
      required: true,
      ref: 'District'
    },
    pickupDistrictName: {
      type: String
    },
    destinations: [destinationStopSchema],
    totalWeightKg: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'queued', 'assigned', 'in-transit', 'delivered', 'cancelled'],
      default: 'pending'
    },
    assignedVehicleId: {
      type: String,
      default: null
    },
    assignedVehicleIds: {
      type: [String],
      default: []
    },
    vehicleLoads: {
      type: Map,
      of: Number,
      default: new Map()
    },
    route: {
      stops: [Number], // Ordered district sequence
      totalDistanceKm: { type: Number, default: 0 },
      estimatedTimeMinutes: { type: Number, default: 0 },
      pathDistricts: [Number] // Detailed district-by-district road route
    },
    currentStopIndex: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
