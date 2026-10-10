const express = require('express');
const router = express.Router();
const { getAdminAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAdminAnalytics);

module.exports = router;
