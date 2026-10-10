/**
 * Rajasthan 33 Districts, Realistic Road Network, Warehouses, Vehicles, and Seed Users
 */

const districts = [
  { districtId: 1, name: 'Jaipur', latitude: 26.9124, longitude: 75.7873, zone: 'Central' },
  { districtId: 2, name: 'Jodhpur', latitude: 26.2389, longitude: 73.0243, zone: 'Western' },
  { districtId: 3, name: 'Udaipur', latitude: 24.5854, longitude: 73.7125, zone: 'Southern' },
  { districtId: 4, name: 'Kota', latitude: 25.2138, longitude: 75.8648, zone: 'South-Eastern' },
  { districtId: 5, name: 'Bikaner', latitude: 28.0229, longitude: 73.3119, zone: 'Northern' },
  { districtId: 6, name: 'Ajmer', latitude: 26.4499, longitude: 74.6399, zone: 'Central' },
  { districtId: 7, name: 'Alwar', latitude: 27.5530, longitude: 76.6346, zone: 'North-Eastern' },
  { districtId: 8, name: 'Bhilwara', latitude: 25.3216, longitude: 74.6307, zone: 'Southern' },
  { districtId: 9, name: 'Sikar', latitude: 27.6094, longitude: 75.1398, zone: 'Northern' },
  { districtId: 10, name: 'Sri Ganganagar', latitude: 29.9038, longitude: 73.8772, zone: 'Northern' },
  { districtId: 11, name: 'Bharatpur', latitude: 27.2152, longitude: 77.5030, zone: 'Eastern' },
  { districtId: 12, name: 'Pali', latitude: 25.7711, longitude: 73.3234, zone: 'Western' },
  { districtId: 13, name: 'Barmer', latitude: 25.7532, longitude: 71.3967, zone: 'Western' },
  { districtId: 14, name: 'Jaisalmer', latitude: 26.9157, longitude: 70.9083, zone: 'Western' },
  { districtId: 15, name: 'Chittorgarh', latitude: 24.8887, longitude: 74.6269, zone: 'Southern' },
  { districtId: 16, name: 'Nagaur', latitude: 27.2021, longitude: 73.7439, zone: 'Central' },
  { districtId: 17, name: 'Jhunjhunu', latitude: 28.1289, longitude: 75.3995, zone: 'Northern' },
  { districtId: 18, name: 'Churu', latitude: 28.2900, longitude: 74.9600, zone: 'Northern' },
  { districtId: 19, name: 'Tonk', latitude: 26.1664, longitude: 75.7885, zone: 'Central' },
  { districtId: 20, name: 'Dausa', latitude: 26.8924, longitude: 76.3375, zone: 'Eastern' },
  { districtId: 21, name: 'Bundi', latitude: 25.4415, longitude: 75.6441, zone: 'South-Eastern' },
  { districtId: 22, name: 'Jhalawar', latitude: 24.5973, longitude: 76.1610, zone: 'South-Eastern' },
  { districtId: 23, name: 'Baran', latitude: 25.1011, longitude: 76.5132, zone: 'South-Eastern' },
  { districtId: 24, name: 'Rajsamand', latitude: 25.0441, longitude: 73.8860, zone: 'Southern' },
  { districtId: 25, name: 'Dungarpur', latitude: 23.8368, longitude: 73.7147, zone: 'Southern' },
  { districtId: 26, name: 'Banswara', latitude: 23.5461, longitude: 74.4373, zone: 'Southern' },
  { districtId: 27, name: 'Sirohi', latitude: 24.8826, longitude: 72.8585, zone: 'South-Western' },
  { districtId: 28, name: 'Jalore', latitude: 25.3444, longitude: 72.6152, zone: 'South-Western' },
  { districtId: 29, name: 'Hanumangarh', latitude: 29.5817, longitude: 74.3294, zone: 'Northern' },
  { districtId: 30, name: 'Dholpur', latitude: 26.7025, longitude: 77.8934, zone: 'Eastern' },
  { districtId: 31, name: 'Karauli', latitude: 26.4950, longitude: 77.0200, zone: 'Eastern' },
  { districtId: 32, name: 'Sawai Madhopur', latitude: 25.9928, longitude: 76.3526, zone: 'Eastern' },
  { districtId: 33, name: 'Pratapgarh', latitude: 24.0315, longitude: 74.7813, zone: 'Southern' }
];

const roads = [
  // Jaipur connections (Hub)
  { roadId: 'R1-6', fromDistrictId: 1, toDistrictId: 6, distanceKm: 135, averageSpeedKmph: 75, roadType: 'National Highway', name: 'NH-48 Jaipur-Ajmer Expressway' },
  { roadId: 'R1-7', fromDistrictId: 1, toDistrictId: 7, distanceKm: 150, averageSpeedKmph: 70, roadType: 'National Highway', name: 'NH-21 / Delhi-Mumbai Link' },
  { roadId: 'R1-9', fromDistrictId: 1, toDistrictId: 9, distanceKm: 115, averageSpeedKmph: 65, roadType: 'National Highway', name: 'NH-52 Jaipur-Sikar Highway' },
  { roadId: 'R1-19', fromDistrictId: 1, toDistrictId: 19, distanceKm: 95, averageSpeedKmph: 70, roadType: 'National Highway', name: 'NH-52 Jaipur-Tonk Highway' },
  { roadId: 'R1-20', fromDistrictId: 1, toDistrictId: 20, distanceKm: 58, averageSpeedKmph: 80, roadType: 'Expressway', name: 'NE-4 Delhi-Mumbai Expressway' },
  { roadId: 'R1-16', fromDistrictId: 1, toDistrictId: 16, distanceKm: 235, averageSpeedKmph: 65, roadType: 'State Highway', name: 'RJ-SH-7 Jaipur-Nagaur' },

  // Ajmer connections
  { roadId: 'R6-2', fromDistrictId: 6, toDistrictId: 2, distanceKm: 205, averageSpeedKmph: 75, roadType: 'National Highway', name: 'NH-25 Ajmer-Jodhpur Highway' },
  { roadId: 'R6-8', fromDistrictId: 6, toDistrictId: 8, distanceKm: 135, averageSpeedKmph: 75, roadType: 'National Highway', name: 'NH-48 Ajmer-Bhilwara' },
  { roadId: 'R6-12', fromDistrictId: 6, toDistrictId: 12, distanceKm: 145, averageSpeedKmph: 70, roadType: 'National Highway', name: 'NH-162 Ajmer-Pali' },
  { roadId: 'R6-16', fromDistrictId: 6, toDistrictId: 16, distanceKm: 145, averageSpeedKmph: 65, roadType: 'State Highway', name: 'RJ-SH Ajmer-Nagaur' },
  { roadId: 'R6-19', fromDistrictId: 6, toDistrictId: 19, distanceKm: 150, averageSpeedKmph: 60, roadType: 'State Highway', name: 'RJ-SH Ajmer-Tonk' },

  // Jodhpur & Western connections
  { roadId: 'R2-12', fromDistrictId: 2, toDistrictId: 12, distanceKm: 72, averageSpeedKmph: 75, roadType: 'National Highway', name: 'NH-62 Jodhpur-Pali' },
  { roadId: 'R2-13', fromDistrictId: 2, toDistrictId: 13, distanceKm: 200, averageSpeedKmph: 65, roadType: 'National Highway', name: 'NH-25 Jodhpur-Barmer' },
  { roadId: 'R2-14', fromDistrictId: 2, toDistrictId: 14, distanceKm: 285, averageSpeedKmph: 70, roadType: 'National Highway', name: 'NH-125 Jodhpur-Jaisalmer' },
  { roadId: 'R2-16', fromDistrictId: 2, toDistrictId: 16, distanceKm: 135, averageSpeedKmph: 70, roadType: 'National Highway', name: 'NH-62 Jodhpur-Nagaur' },
  { roadId: 'R2-5', fromDistrictId: 2, toDistrictId: 5, distanceKm: 245, averageSpeedKmph: 75, roadType: 'National Highway', name: 'NH-62 Jodhpur-Bikaner' },

  // Barmer & Jaisalmer
  { roadId: 'R13-14', fromDistrictId: 13, toDistrictId: 14, distanceKm: 160, averageSpeedKmph: 75, roadType: 'National Highway', name: 'NH-68 Barmer-Jaisalmer' },
  { roadId: 'R13-28', fromDistrictId: 13, toDistrictId: 28, distanceKm: 150, averageSpeedKmph: 60, roadType: 'State Highway', name: 'RJ-SH Barmer-Jalore' },

  // Pali, Sirohi, Jalore
  { roadId: 'R12-24', fromDistrictId: 12, toDistrictId: 24, distanceKm: 95, averageSpeedKmph: 60, roadType: 'State Highway', name: 'RJ-SH Pali-Rajsamand' },
  { roadId: 'R12-27', fromDistrictId: 12, toDistrictId: 27, distanceKm: 110, averageSpeedKmph: 75, roadType: 'National Highway', name: 'NH-14 Pali-Sirohi' },
  { roadId: 'R12-28', fromDistrictId: 12, toDistrictId: 28, distanceKm: 120, averageSpeedKmph: 60, roadType: 'State Highway', name: 'RJ-SH Pali-Jalore' },
  { roadId: 'R27-28', fromDistrictId: 27, toDistrictId: 28, distanceKm: 85, averageSpeedKmph: 65, roadType: 'State Highway', name: 'RJ-SH Sirohi-Jalore' },
  { roadId: 'R27-3', fromDistrictId: 27, toDistrictId: 3, distanceKm: 105, averageSpeedKmph: 65, roadType: 'National Highway', name: 'NH-27 Sirohi-Udaipur' },

  // Udaipur & Southern Hub
  { roadId: 'R3-24', fromDistrictId: 3, toDistrictId: 24, distanceKm: 65, averageSpeedKmph: 75, roadType: 'National Highway', name: 'NH-58 Udaipur-Rajsamand' },
  { roadId: 'R3-15', fromDistrictId: 3, toDistrictId: 15, distanceKm: 115, averageSpeedKmph: 80, roadType: 'National Highway', name: 'NH-27 Udaipur-Chittorgarh' },
  { roadId: 'R3-25', fromDistrictId: 3, toDistrictId: 25, distanceKm: 105, averageSpeedKmph: 70, roadType: 'National Highway', name: 'NH-48 Udaipur-Dungarpur' },

  // Dungarpur, Banswara, Pratapgarh
  { roadId: 'R25-26', fromDistrictId: 25, toDistrictId: 26, distanceKm: 85, averageSpeedKmph: 60, roadType: 'State Highway', name: 'RJ-SH Dungarpur-Banswara' },
  { roadId: 'R26-33', fromDistrictId: 26, toDistrictId: 33, distanceKm: 85, averageSpeedKmph: 55, roadType: 'State Highway', name: 'RJ-SH Banswara-Pratapgarh' },
  { roadId: 'R33-15', fromDistrictId: 33, toDistrictId: 15, distanceKm: 110, averageSpeedKmph: 60, roadType: 'State Highway', name: 'RJ-SH Pratapgarh-Chittorgarh' },

  // Chittorgarh, Bhilwara, Rajsamand
  { roadId: 'R15-8', fromDistrictId: 15, toDistrictId: 8, distanceKm: 55, averageSpeedKmph: 75, roadType: 'National Highway', name: 'NH-48 Chittorgarh-Bhilwara' },
  { roadId: 'R15-4', fromDistrictId: 15, toDistrictId: 4, distanceKm: 170, averageSpeedKmph: 80, roadType: 'National Highway', name: 'NH-27 Chittor-Kota Highway' },
  { roadId: 'R24-8', fromDistrictId: 24, toDistrictId: 8, distanceKm: 90, averageSpeedKmph: 65, roadType: 'State Highway', name: 'RJ-SH Rajsamand-Bhilwara' },

  // Kota & South-East (Hadoti)
  { roadId: 'R4-21', fromDistrictId: 4, toDistrictId: 21, distanceKm: 40, averageSpeedKmph: 80, roadType: 'National Highway', name: 'NH-52 Kota-Bundi' },
  { roadId: 'R4-22', fromDistrictId: 4, toDistrictId: 22, distanceKm: 85, averageSpeedKmph: 75, roadType: 'National Highway', name: 'NH-52 Kota-Jhalawar' },
  { roadId: 'R4-23', fromDistrictId: 4, toDistrictId: 23, distanceKm: 75, averageSpeedKmph: 75, roadType: 'National Highway', name: 'NH-27 Kota-Baran' },
  { roadId: 'R21-19', fromDistrictId: 21, toDistrictId: 19, distanceKm: 110, averageSpeedKmph: 70, roadType: 'National Highway', name: 'NH-52 Bundi-Tonk' },
  { roadId: 'R21-8', fromDistrictId: 21, toDistrictId: 8, distanceKm: 155, averageSpeedKmph: 65, roadType: 'State Highway', name: 'RJ-SH Bundi-Bhilwara' },

  // Eastern corridor: Sawai Madhopur, Dausa, Bharatpur, Dholpur, Karauli
  { roadId: 'R19-32', fromDistrictId: 19, toDistrictId: 32, distanceKm: 65, averageSpeedKmph: 65, roadType: 'State Highway', name: 'RJ-SH Tonk-Sawai Madhopur' },
  { roadId: 'R32-20', fromDistrictId: 32, toDistrictId: 20, distanceKm: 90, averageSpeedKmph: 70, roadType: 'State Highway', name: 'RJ-SH Sawai Madhopur-Dausa' },
  { roadId: 'R32-31', fromDistrictId: 32, toDistrictId: 31, distanceKm: 85, averageSpeedKmph: 60, roadType: 'State Highway', name: 'RJ-SH Sawai Madhopur-Karauli' },
  { roadId: 'R20-11', fromDistrictId: 20, toDistrictId: 11, distanceKm: 125, averageSpeedKmph: 75, roadType: 'National Highway', name: 'NH-21 Dausa-Bharatpur' },
  { roadId: 'R20-7', fromDistrictId: 20, toDistrictId: 7, distanceKm: 90, averageSpeedKmph: 70, roadType: 'State Highway', name: 'RJ-SH Dausa-Alwar' },
  { roadId: 'R11-30', fromDistrictId: 11, toDistrictId: 30, distanceKm: 55, averageSpeedKmph: 70, roadType: 'National Highway', name: 'NH-123 Bharatpur-Dholpur' },
  { roadId: 'R31-30', fromDistrictId: 31, toDistrictId: 30, distanceKm: 110, averageSpeedKmph: 60, roadType: 'State Highway', name: 'RJ-SH Karauli-Dholpur' },
  { roadId: 'R11-7', fromDistrictId: 11, toDistrictId: 7, distanceKm: 110, averageSpeedKmph: 65, roadType: 'State Highway', name: 'RJ-SH Bharatpur-Alwar' },

  // Northern Network: Bikaner, Nagaur, Churu, Sikar, Jhunjhunu, Hanumangarh, Sri Ganganagar
  { roadId: 'R5-16', fromDistrictId: 5, toDistrictId: 16, distanceKm: 115, averageSpeedKmph: 75, roadType: 'National Highway', name: 'NH-62 Bikaner-Nagaur' },
  { roadId: 'R5-18', fromDistrictId: 5, toDistrictId: 18, distanceKm: 175, averageSpeedKmph: 70, roadType: 'National Highway', name: 'NH-11 Bikaner-Churu' },
  { roadId: 'R5-10', fromDistrictId: 5, toDistrictId: 10, distanceKm: 235, averageSpeedKmph: 70, roadType: 'National Highway', name: 'NH-62 Bikaner-Ganganagar' },
  { roadId: 'R10-29', fromDistrictId: 10, toDistrictId: 29, distanceKm: 65, averageSpeedKmph: 75, roadType: 'National Highway', name: 'NH-54 Ganganagar-Hanumangarh' },
  { roadId: 'R29-18', fromDistrictId: 29, toDistrictId: 18, distanceKm: 170, averageSpeedKmph: 65, roadType: 'National Highway', name: 'NH-62 Hanumangarh-Churu' },
  { roadId: 'R18-9', fromDistrictId: 18, toDistrictId: 9, distanceKm: 90, averageSpeedKmph: 70, roadType: 'National Highway', name: 'NH-52 Churu-Sikar' },
  { roadId: 'R18-17', fromDistrictId: 18, toDistrictId: 17, distanceKm: 55, averageSpeedKmph: 65, roadType: 'State Highway', name: 'RJ-SH Churu-Jhunjhunu' },
  { roadId: 'R17-9', fromDistrictId: 17, toDistrictId: 9, distanceKm: 70, averageSpeedKmph: 65, roadType: 'State Highway', name: 'RJ-SH Jhunjhunu-Sikar' },
  { roadId: 'R17-7', fromDistrictId: 17, toDistrictId: 7, distanceKm: 130, averageSpeedKmph: 60, roadType: 'State Highway', name: 'RJ-SH Jhunjhunu-Alwar' },
  { roadId: 'R16-9', fromDistrictId: 16, toDistrictId: 9, distanceKm: 140, averageSpeedKmph: 65, roadType: 'State Highway', name: 'RJ-SH Nagaur-Sikar' }
];

const warehouses = [
  { warehouseId: 'WH-JPR-01', name: 'Jaipur Central Mega Logistics Hub', districtId: 1, capacityKg: 100000, currentStockKg: 35000, ownerType: 'company', contactNumber: '+91-141-289001' },
  { warehouseId: 'WH-JDH-02', name: 'Jodhpur Marwar Freight Depot', districtId: 2, capacityKg: 75000, currentStockKg: 22000, ownerType: 'company', contactNumber: '+91-291-274002' },
  { warehouseId: 'WH-UDR-03', name: 'Udaipur Mewar Distribution Center', districtId: 3, capacityKg: 60000, currentStockKg: 18500, ownerType: 'company', contactNumber: '+91-294-245003' },
  { warehouseId: 'WH-KTA-04', name: 'Kota Chambal Cargo Terminal', districtId: 4, capacityKg: 50000, currentStockKg: 14000, ownerType: 'company', contactNumber: '+91-744-239004' },
  { warehouseId: 'WH-BKN-05', name: 'Bikaner Thar Logistics Base', districtId: 5, capacityKg: 45000, currentStockKg: 12000, ownerType: 'company', contactNumber: '+91-151-222005' },
  { warehouseId: 'WH-AJM-06', name: 'Ajmer Central Express Depot', districtId: 6, capacityKg: 40000, currentStockKg: 9500, ownerType: 'company', contactNumber: '+91-145-263006' },
  { warehouseId: 'WH-ALW-07', name: 'Alwar NCR Inbound Hub', districtId: 7, capacityKg: 80000, currentStockKg: 41000, ownerType: 'company', contactNumber: '+91-144-278007' },
  { warehouseId: 'WH-BHL-08', name: 'Bhilwara Textile Freight Center', districtId: 8, capacityKg: 50000, currentStockKg: 16000, ownerType: 'company', contactNumber: '+91-148-223008' },
  { warehouseId: 'WH-SKR-09', name: 'Sikar Shekhawati Agro Warehouse', districtId: 9, capacityKg: 35000, currentStockKg: 8000, ownerType: 'company', contactNumber: '+91-157-234009' }
];

const vehicles = [
  { vehicleId: 'VEH-01', vehicleNumber: 'RJ-14-GA-1024', modelType: 'Tata Ace Mini', maxCapacityKg: 750, currentLocationDistrictId: 1, status: 'idle', currentLoadKg: 0, driverName: 'Ramesh Sharma' },
  { vehicleId: 'VEH-02', vehicleNumber: 'RJ-14-GB-2048', modelType: 'Mahindra Bolero Maxi', maxCapacityKg: 1500, currentLocationDistrictId: 1, status: 'idle', currentLoadKg: 0, driverName: 'Suresh Verma' },
  { vehicleId: 'VEH-03', vehicleNumber: 'RJ-19-EA-3301', modelType: 'Eicher Pro 2049', maxCapacityKg: 2500, currentLocationDistrictId: 2, status: 'idle', currentLoadKg: 0, driverName: 'Mukesh Choudhary' },
  { vehicleId: 'VEH-04', vehicleNumber: 'RJ-19-EB-4402', modelType: 'Ashok Leyland Partner', maxCapacityKg: 4500, currentLocationDistrictId: 2, status: 'idle', currentLoadKg: 0, driverName: 'Dinesh Gehlot' },
  { vehicleId: 'VEH-05', vehicleNumber: 'RJ-27-CA-5511', modelType: 'Tata 1109 LPT', maxCapacityKg: 7000, currentLocationDistrictId: 3, status: 'idle', currentLoadKg: 0, driverName: 'Bhanwar Singh' },
  { vehicleId: 'VEH-06', vehicleNumber: 'RJ-20-TA-6622', modelType: 'BharatBenz 1217C', maxCapacityKg: 10000, currentLocationDistrictId: 4, status: 'idle', currentLoadKg: 0, driverName: 'Kailash Meena' },
  { vehicleId: 'VEH-07', vehicleNumber: 'RJ-07-RA-7733', modelType: 'Eicher Pro 3015', maxCapacityKg: 5000, currentLocationDistrictId: 5, status: 'idle', currentLoadKg: 0, driverName: 'Harphool Bishnoi' },
  { vehicleId: 'VEH-08', vehicleNumber: 'RJ-01-SA-8844', modelType: 'Tata 407 Gold', maxCapacityKg: 2000, currentLocationDistrictId: 6, status: 'idle', currentLoadKg: 0, driverName: 'Imran Khan' }
];

const seedUsers = [
  {
    name: 'Logistics Network Admin',
    email: 'admin@rlnet.in',
    password: 'adminpassword123',
    role: 'admin',
    phone: '+91-98290-00001'
  },
  {
    name: 'Fleet Driver Ramesh',
    email: 'driver@rlnet.in',
    password: 'driverpassword123',
    role: 'driver',
    phone: '+91-98290-00002',
    assignedVehicleId: 'VEH-01'
  },
  {
    name: 'Marwar Agro Merchant',
    email: 'client@rlnet.in',
    password: 'clientpassword123',
    role: 'client',
    phone: '+91-98290-00003'
  }
];

module.exports = {
  districts,
  roads,
  warehouses,
  vehicles,
  seedUsers
};
