# Rajasthan Logistics Network (RLNet)

An end-to-end, enterprise-grade MERN stack logistics and delivery management platform modeling the state of Rajasthan as a weighted graph network. Built with **Node.js, Express, MongoDB (Mongoose)** on the backend and **React, Vite, Tailwind CSS** on the frontend.

---

## 🗺️ System Architecture & Graph Modeling

The network models all **33 districts of Rajasthan** as nodes (1-indexed for direct algorithmic alignment) connected by realistic National Highways (NH-48, NH-62, NH-52, NH-27), State Highways, and Expressways (NE-4 Delhi-Mumbai Expressway).

- **Nodes (V)**: 33 Rajasthan Districts with authentic GPS coordinates (latitude/longitude), zonal designations, and logistics hubs.
- **Edges (E)**: 50+ arterial highway corridors with realistic distances (km), average speeds (km/h), and dynamic traffic congestion multipliers.
- **Warehouses**: Regional distribution centers (Jaipur Central, Jodhpur Marwar, Udaipur Mewar, Kota Chambal, Bikaner Thar, Ajmer Central, Alwar NCR, Bhilwara Textile, Sikar Shekhawati).
- **Vehicles**: Fleet ranging from Tata Ace Mini (750kg) up to BharatBenz 1217C (10,000kg).

---

## 🚚 Core Features

**Greedy Multi-Vehicle Fleet Assignment (lower-bound)**
Every order is matched against the idle fleet using a greedy `lower_bound` strategy:
repeatedly take the **smallest vehicle that can hold the remaining weight**, falling back to
the largest available vehicle only when no single truck can cover the remainder. A 1,300 kg
order therefore lands on the 1,500 kg mini-truck (not a 10,000 kg truck), keeping heavy
vehicles free for freight. Orders heavier than the **entire fleet capacity are rejected**.
A single order can therefore be split across several vehicles, each with its own load.

**Driver Transit Console (sequential stop-by-stop walk)**
Each vehicle is walked through its plan in phases, shared across all vehicles on the order:

1. **Terminal → Pickup Point** — every assigned vehicle starts from its own depot, routed
   with Dijkstra. 10-second countdown, no deliver action.
2. **Pickup → Nearest Delivery Hub** — the *nearest hub by travel time* (traffic-weighted
   Floyd-Warshall lookups, Dijkstra for the reconstructed path).
3. **"Mark Delivered"** unlocks per vehicle; the vehicle's location moves to that hub.
4. Repeat from that hub to its **next-nearest** hub — never back to the pickup point.

When the last hub is delivered, vehicles reset to `idle`, the order is marked `delivered`,
and it disappears from the transit list.

**Admin Transit History**
The last 20 orders are listed with their order number, status, pickup point, every vehicle
that was allotted with its individual **load in kg**, and the full list of delivery points
with per-stop delivered state. Rows expand to show a load-utilisation bar per vehicle and
the complete route flow. Backed by `GET /api/orders/history`.

**No-setup database**
If no local MongoDB is reachable, the server automatically boots an in-memory MongoDB and
seeds 33 districts, the road network, traffic data, warehouses, the fleet, users and demo
dispatch records — so a fresh clone runs with a single `npm start`.

---

## ⚙️ C++ Algorithm Porting & Feature Mapping

All 8 algorithms have been ported **strictly and faithfully** from the original C++ implementations to JavaScript (`/backend/utils/algorithms`), preserving exact variable roles, iterative techniques, and data structures:

| # | Algorithm Name | C++ Problem Mapping | Technique / Structure Preserved | Logistics Feature Powered |
|---|---|---|---|---|
| **1** | **BFS (Breadth-First Search)** | `Problem 1: Reachable Districts` | Iterative FIFO queue, visited boolean array `vis`, ascending sorting | **Coverage & Reachability API**: Determines which logistics terminals can be serviced from an origin hub. |
| **2** | **Dijkstra** | `Problem 2: Fastest Route` | Iterative binary `MinPriorityQueue`, distance array initialized to `1e18 (INF)`, duplicate skip `d > dist[u]` | **Shortest / Fastest Route API**: Computes optimal delivery trajectory factoring in road distance, speeds, and dynamic traffic congestion. |
| **3** | **DSU (Disjoint Set Union)** | `Problem 3: Are They Connected?` | Iterative two-pass path compression (root search then flattened pointers), union by rank | **Network Connectivity Verification**: Checks if state highway grid is fully connected and returns disconnected partition groups. |
| **4** | **Kruskal's MST** | `Problem 4: Minimum Cost Network` | Edge cost sorting, iterative DSU union, stops at `n - 1` edges | **Infrastructure Backbone API**: Identifies minimum total road network cost required to keep all 33 districts connected. |
| **5** | **Floyd-Warshall** | `Problem 5: All Warehouse Distances` | Triply-nested iterative dynamic programming relaxation ($O(V^3)$) | **All-Pairs Distance API**: Precomputed distance matrix between all statewide warehouses for instant order quotation. |
| **6** | **Tarjan's Bridges** | `Problem 6: Critical Roads` | Explicit iterative DFS stack `st`, `edge_idx` exploration pointers, parent-edge-id tracking | **Critical Roads API**: Discovers single points of failure — roads whose blockage or disruption isolates districts. |
| **7** | **Nearest Neighbor** | `Problem 7: Multi-Stop Delivery Order` | Iterative greedy heuristic ($O(k^2)$), step-by-step nearest unvisited stop selection | **Multi-Stop Delivery Sequencing**: Determines optimal drop-off order for client orders with multiple destinations. |
| **8** | **Best-Fit Vehicle Match** | `Problem 8: Best-Fit Vehicle Assignment` | Emulation of `std::set::lower_bound({w, 0})` with secondary Dijkstra proximity factor | **Order Dispatch & Fleet Assignment**: Assigns the vehicle with smallest sufficient capacity ($cap \ge w$) to prevent wasted capacity. |

---

## 📁 Project Folder Structure

```
rajasthan-logistics-network/
├── .gitignore                         # Excludes node_modules, dist, .env
├── package.json                       # Root scripts (start / seed / build)
├── README.md
│
├── backend/
│   ├── config/
│   │   └── db.js                        # MongoDB connection with automated In-Memory fallback
│   ├── controllers/
│   │   ├── algorithmController.js       # Ports algorithms to REST APIs (Dijkstra, Tarjan, Kruskal, etc.)
│   │   ├── analyticsController.js       # KPI metrics, average delivery time, vehicle utilization %
│   │   ├── authController.js            # JWT login, registration, role checks
│   │   ├── deliveryController.js        # Pre-computes per-vehicle delivery plans (Floyd-Warshall + nearest neighbour)
│   │   ├── networkController.js         # District & road CRUD, traffic simulator
│   │   ├── orderController.js           # Order placement, greedy fleet assignment, queue processing, transit history
│   │   └── vehicleController.js         # Fleet status, per-vehicle route, idle auto-reassignment
│   ├── middleware/
│   │   ├── auth.js                      # JWT protection & role authorization
│   │   └── errorHandler.js              # Centralized API error handler
│   ├── models/
│   │   ├── District.js                  # District node schema
│   │   ├── Order.js                     # Multi-stop order schema (multi-vehicle loads + delivered flags)
│   │   ├── Road.js                      # Weighted road edge schema
│   │   ├── TrafficData.js               # Dynamic congestion simulation schema
│   │   ├── User.js                      # User schema (Admin / Driver / Client)
│   │   ├── Vehicle.js                   # Fleet vehicle schema
│   │   └── Warehouse.js                 # Warehouse hub schema
│   ├── routes/
│   │   ├── algorithmRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── deliveryRoutes.js
│   │   ├── networkRoutes.js
│   │   ├── orderRoutes.js
│   │   └── vehicleRoutes.js
│   ├── seed/
│   │   ├── rajasthanData.js             # 33 districts, 50+ roads, seed users & vehicles
│   │   ├── historicalOrders.js          # Demo dispatch records so Transit History is never empty
│   │   └── seed.js                      # Database population script with precomputed bridges & MST
│   ├── utils/
│   │   └── algorithms/
│   │       ├── minPriorityQueue.js      # C++ std::priority_queue emulator
│   │       ├── problem1_bfsReachable.js # Port of C++ Problem 1
│   │       ├── problem2_dijkstraFastestRoute.js # Port of C++ Problem 2
│   │       ├── problem3_dsuConnected.js # Port of C++ Problem 3
│   │       ├── problem4_kruskalMST.js   # Port of C++ Problem 4
│   │       ├── problem5_floydWarshall.js# Port of C++ Problem 5
│   │       ├── problem6_tarjanBridges.js# Port of C++ Problem 6
│   │       ├── problem7_nearestNeighborRoute.js # Port of C++ Problem 7
│   │       ├── problem8_bestFitVehicle.js # Port of C++ Problem 8
│   │       └── index.js
│   ├── test_algorithms.js               # Standalone verification test for all 8 algorithms
│   ├── package.json
│   ├── server.js
│   ├── .env                             # Local config — GIT-IGNORED, never committed
│   └── .env.example                     # Committed template listing every env variable
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalyticsCards.jsx       # 4 KPI cards & freight corridor rankings
│   │   │   ├── Navbar.jsx               # Navigation bar & one-click demo role switcher
│   │   │   ├── NetworkAlgorithmsPanel.jsx # Interactive workbench for executing algorithms
│   │   │   ├── OrderQueue.jsx           # Live delivery tracker and pending order queue
│   │   │   ├── RajasthanMap.jsx         # GPS-projected SVG map with Tarjan/MST/route layers
│   │   │   ├── TransitHistory.jsx       # Last-20 dispatch records: vehicles, loads, pickup & drop points
│   │   │   └── VehicleTable.jsx         # Live fleet monitoring and payload gauge
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # User credentials & JWT state
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx       # Map, fleet table, queue, transit history, algorithm console
│   │   │   ├── ClientDashboard.jsx      # Order placement wizard with dynamic multi-stop additions
│   │   │   ├── DriverDashboard.jsx      # Sequential terminal→pickup→hub walk with per-hub deliver
│   │   │   ├── Login.jsx                # Role-based sign in with demo shortcuts
│   │   │   └── Register.jsx             # Role-based registration
│   │   ├── services/
│   │   │   └── api.js                   # Frontend fetch client for all backend endpoints
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── package.json
```

---

## ⚙️ Environment Variables

The project runs **without any `.env` file at all** — every variable has a safe
fallback hard-coded in the source. A `.env` is only needed if you want to
override a value (different port, a real MongoDB Atlas URI, a stronger JWT key).

| Variable | Default if unset | Purpose |
|---|---|---|
| `PORT` | `5000` | Port the backend API listens on |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/rajasthan_logistics` | MongoDB connection string |
| `JWT_SECRET` | `rajasthan_secret_key_2026` | Secret used to sign login tokens |
| `NODE_ENV` | `development` | `production` hides stack traces & request logs |

To override them, copy the committed template and edit it:

```bash
cd backend
cp .env.example .env      # Windows CMD: copy .env.example .env
```

> **`.env` is git-ignored and is never committed.** Only `.env.example`
> (which contains placeholders, never real secrets) is pushed to the repo.

---

## 🚀 Setup & Execution Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB (Optional: The application includes an automated in-memory MongoDB fallback server if no local MongoDB instance is running, ensuring zero-setup execution).

### 1. Install Dependencies
From the root directory:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Verify Ported Algorithms
Run the algorithm verification test suite to confirm exact outputs matching the C++ test benchmarks:
```bash
cd backend
node test_algorithms.js
```

### 3. Start Backend Server
```bash
cd backend
npm start
# Server boots at http://localhost:5000 and auto-populates Rajasthan seed data
```

### 4. Start Frontend Application
In a separate terminal:
```bash
cd frontend
npm run dev
# Vite dev server runs at http://localhost:5173
```

---

## 👥 Demo Accounts (Pre-configured)

Use the quick demo buttons on the top bar or sign in with:

| Role | Email | Password | Permissions & Views |
|---|---|---|---|
| **Admin** | `admin@rlnet.in` | `adminpassword123` | Full map topology, live fleet status, pending queue, algorithm workbench, analytics |
| **Driver** | `driver@rlnet.in` | `driverpassword123` | Assigned vehicle, multi-stop checklist, "Mark Delivered" action |
| **Client** | `client@rlnet.in` | `clientpassword123` | Multi-stop order placement, GPS custom node booking, live ETA tracker |

---

## 💡 "Why this algorithm?" Rationale Highlights

- **Dijkstra (Iterative Min-Heap)**: Discovers the mathematically optimal delivery path across Rajasthan's highway grid in $O((V+E)\log V)$ time while dynamically incorporating traffic congestion multipliers.
- **Tarjan's Bridges (Iterative DFS)**: Uncovers critical highway segments whose obstruction would partition the state and sever supply lines to border districts (e.g. Jhalawar, Baran, Jaisalmer).
- **Kruskal's MST**: Computes the minimal spanning road network connecting all 33 districts without cycles, guiding public infrastructure investment and freight line optimization.
- **Nearest Neighbor (TSP)**: Orders multiple delivery stops sequentially starting from the origin hub to minimize fuel consumption and delivery delays.
- **Best-Fit Lower Bound**: Allocates the smallest vehicle capable of carrying the cargo load, preserving heavy-duty vehicles for larger volume orders.
