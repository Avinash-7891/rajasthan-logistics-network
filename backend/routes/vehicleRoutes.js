const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicleRoute,
  markVehicleDone,
  updateVehicleStatus,
  triggerQueueCheck
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getVehicles);
router.get('/:id/route', protect, getVehicleRoute);
router.post('/:id/done', protect, markVehicleDone);
router.patch('/:id', protect, updateVehicleStatus);
router.post('/assign-queue', protect, authorize('admin'), triggerQueueCheck);

module.exports = router;
