const express = require('express');
const router = express.Router();
const {
  getDistricts,
  getDistrictById,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  getRoads,
  createRoad,
  updateRoad,
  deleteRoad,
  getWarehouses,
  getTraffic,
  simulateTrafficUpdates
} = require('../controllers/networkController');
const { protect, authorize } = require('../middleware/auth');

// Districts
router.get('/districts', getDistricts);
router.get('/districts/:id', getDistrictById);
router.post('/districts', protect, authorize('admin'), createDistrict);
router.put('/districts/:id', protect, authorize('admin'), updateDistrict);
router.delete('/districts/:id', protect, authorize('admin'), deleteDistrict);

// Roads
router.get('/roads', getRoads);
router.post('/roads', protect, authorize('admin'), createRoad);
router.put('/roads/:id', protect, authorize('admin'), updateRoad);
router.delete('/roads/:id', protect, authorize('admin'), deleteRoad);

// Warehouses
router.get('/warehouses', getWarehouses);

// Traffic & Simulation
router.get('/traffic', getTraffic);
router.post('/traffic/simulate', simulateTrafficUpdates);

module.exports = router;
