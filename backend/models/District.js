const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema(
  {
    districtId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    zone: {
      type: String,
      default: 'Central'
    },
    isTemporary: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('District', districtSchema);
