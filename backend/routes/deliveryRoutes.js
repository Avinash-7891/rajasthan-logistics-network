const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDeliveryPlan, getNextStep } = require('../controllers/deliveryController');

router.get('/:id/plan', protect, getDeliveryPlan);
router.get('/:id/next-step', protect, getNextStep);

module.exports = router;
