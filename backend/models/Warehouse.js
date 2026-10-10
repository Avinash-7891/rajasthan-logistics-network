const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    warehouseId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    districtId: {
      type: Number,
      required: true,
      ref: 'District'
    },
    capacityKg: {
      type: Number,
      required: true
    },
    currentStockKg: {
      type: Number,
      default: 0
    },
    ownerType: {
      type: String,
      enum: ['company', 'client'],
      default: 'company'
    },
    contactNumber: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Warehouse', warehouseSchema);
