const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  deliverStop,
  getTransitOrders,
  getOrderHistory,
  searchOrders,
  getOrderRoute
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/transit', protect, getTransitOrders);
router.get('/history', protect, getOrderHistory);
router.get('/search', protect, searchOrders);
router.get('/:id', protect, getOrderById);
router.get('/:id/route', protect, getOrderRoute);
router.patch('/:id/stops/:stopIndex/deliver', protect, deliverStop);

module.exports = router;
