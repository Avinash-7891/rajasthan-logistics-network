const Order = require('../models/Order');
const User = require('../models/User');
const { districts } = require('./rajasthanData');

/**
 * Demo dispatch records used to populate the admin "Transit History" panel.
 * Vehicle statuses are intentionally left untouched so the fleet stays idle
 * and can still be used for real order testing.
 */
const DEMO_ORDERS = [
  {
    weight: 1300,
    pickup: 1,
    pickupAddress: 'Warehouse 12, Mansarovar Industrial Area, Jaipur',
    stops: [{ d: 6, w: 700 }, { d: 9, w: 600 }],
    vehicles: { 'VEH-02': 1300 },
    daysAgo: 1,
    status: 'delivered'
  },
  {
    weight: 4500,
    pickup: 1,
    pickupAddress: 'Transport Nagar Yard, Jaipur',
    stops: [{ d: 11, w: 2500 }, { d: 7, w: 2000 }],
    vehicles: { 'VEH-04': 4500 },
    daysAgo: 2,
    status: 'delivered'
  },
  {
    weight: 7200,
    pickup: 2,
    pickupAddress: 'Jodhpur Cross-Dock, Jodhpur Bypass',
    stops: [{ d: 12, w: 3200 }, { d: 8, w: 2400 }, { d: 3, w: 1600 }],
    vehicles: { 'VEH-05': 7000, 'VEH-01': 200 },
    daysAgo: 3,
    status: 'delivered'
  },
  {
    weight: 17548,
    pickup: 4,
    pickupAddress: 'Kota Industrial Hub, Talwandi, Kota',
    stops: [{ d: 1, w: 9000 }, { d: 6, w: 8548 }],
    vehicles: { 'VEH-06': 10000, 'VEH-05': 7000, 'VEH-01': 548 },
    daysAgo: 5,
    status: 'delivered'
  },
  {
    weight: 2250,
    pickup: 5,
    pickupAddress: 'Bikaner Agri Storage Depot, Bikaner',
    stops: [{ d: 10, w: 1250 }, { d: 9, w: 1000 }],
    vehicles: { 'VEH-03': 2250 },
    daysAgo: 7,
    status: 'delivered'
  },
  {
    weight: 5500,
    pickup: 6,
    pickupAddress: 'Ajmer Distribution Centre, Ajmer',
    stops: [{ d: 8, w: 3000 }, { d: 12, w: 2500 }],
    vehicles: { 'VEH-07': 5000, 'VEH-08': 500 },
    daysAgo: 9,
    status: 'cancelled'
  }
];

function buildHistoricalOrderDocs() {
  const districtMap = new Map(districts.map((d) => [d.districtId, d.name]));
  const name = (id) => districtMap.get(id) || `District ${id}`;

  return DEMO_ORDERS.map((o, idx) => {
    const createdAt = new Date(Date.now() - o.daysAgo * 24 * 60 * 60 * 1000);
    const isDone = o.status === 'delivered';

    return {
      orderId: `ORD-${1001 + idx * 17}`,
      pickupAddress: o.pickupAddress,
      pickupDistrictId: o.pickup,
      pickupDistrictName: name(o.pickup),
      destinations: o.stops.map((s, i) => ({
        stopIndex: i + 1,
        warehouseId: null,
        districtId: s.d,
        districtName: name(s.d),
        weightKg: s.w,
        delivered: isDone,
        deliveredAt: isDone
          ? new Date(createdAt.getTime() + (i + 1) * 3 * 60 * 60 * 1000)
          : null
      })),
      totalWeightKg: o.weight,
      status: o.status,
      assignedVehicleId: Object.keys(o.vehicles)[0] || null,
      assignedVehicleIds: Object.keys(o.vehicles),
      vehicleLoads: new Map(Object.entries(o.vehicles)),
      route: {
        stops: [o.pickup, ...o.stops.map((s) => s.d)],
        totalDistanceKm: 120 + idx * 85,
        estimatedTimeMinutes: 180 + idx * 55,
        pathDistricts: [o.pickup, ...o.stops.map((s) => s.d)]
      },
      currentStopIndex: isDone ? o.stops.length : 0,
      completedAt: isDone
        ? new Date(createdAt.getTime() + o.stops.length * 3 * 60 * 60 * 1000)
        : null,
      createdAt,
      updatedAt: createdAt
    };
  });
}

/**
 * Insert demo dispatch records. No-op when orders already exist.
 * @returns {Promise<number>} number of inserted records
 */
async function seedHistoricalOrders() {
  try {
    const existing = await Order.countDocuments();
    if (existing > 0) return 0;

    const clientUser = await User.findOne({ role: 'client' });
    if (!clientUser) return 0;

    const docs = buildHistoricalOrderDocs().map((d) => ({
      ...d,
      clientId: clientUser._id,
      clientName: clientUser.name
    }));

    await Order.insertMany(docs);
    console.log(`[Seed] Inserted ${docs.length} historical dispatch records for Transit History.`);
    return docs.length;
  } catch (err) {
    console.warn('[Seed] Could not seed historical orders:', err.message);
    return 0;
  }
}

module.exports = seedHistoricalOrders;
module.exports.buildHistoricalOrderDocs = buildHistoricalOrderDocs;
module.exports.DEMO_ORDERS = DEMO_ORDERS;
