<div align="center">

# 🌿 Green Hydrogen Platform

**A full-stack digital control & monitoring platform for renewable-to-hydrogen production facilities**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Live Features](#live-features)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Repository Structure](#repository-structure)
6. [LP Optimization Engine](#lp-optimization-engine)
7. [API Reference](#api-reference)
8. [Authentication & Role System](#authentication--role-system)
9. [Frontend Pages & Components](#frontend-pages--components)
10. [MongoDB Data Models](#mongodb-data-models)
11. [Environment Configuration](#environment-configuration)
12. [Getting Started](#getting-started)
13. [Scenario Presets](#scenario-presets)
14. [Roadmap](#roadmap)

---

## Executive Summary

The **Green Hydrogen Energy Platform** is a production-grade, full-stack supervisory control and monitoring dashboard built for renewable-to-hydrogen facilities. It unifies real-time telemetry from solar arrays, wind turbines, PEM electrolyzers, and pressurized hydrogen storage tanks into a single centralized interface — then intelligently schedules production using a **custom 24-hour Linear Programming (LP) optimizer** running in pure JavaScript on the backend.

> **The platform empowers operators to:**
> - Monitor live renewable energy generation vs. real-time hydrogen demand
> - Track PEM electrolyzer status, efficiency, and power consumption
> - Oversee hydrogen storage tank inventory, capacity, and mass-flow balance
> - Run LP-optimized 24-hour dispatch schedules vs. naive baseline comparison
> - Ingest custom plant data via editable tables or CSV upload
> - Control access via JWT-authenticated role-based permissions

---

## Live Features

| Feature | Status | Description |
|---|---|---|
| 🎛️ **Dashboard** | ✅ Live | KPI cards, generation charts, storage visualizer, electrolyzer monitor |
| 🌞 **Energy Monitoring** | ✅ Live | Solar & wind diurnal generation charts with live telemetry |
| ⚗️ **Hydrogen Production** | ✅ Live | PEM electrolyzer stack operations, efficiency, gas purity |
| 🛢️ **Storage** | ✅ Live | Tank inventory, pressure buffer, mass-flow balance |
| 🧮 **LP Optimizer** | ✅ Live | 24h horizon Linear Program vs. baseline comparison, full schedule table |
| 📊 **Analytics** | ✅ Live | Efficiency curves, carbon abatement trends, LCOH |
| 📥 **Plant Data Input** | ✅ Live | 24h forecast table, uniform fill, CSV import, real-time validation |
| 👤 **Admin Panel** | ✅ Live | User management, audit logs, role assignment |
| 🔐 **JWT Auth** | ✅ Live | Secure login, httpOnly cookies, role-based route guards |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GREEN HYDROGEN PLATFORM                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │               CLIENT  (React 19 + Vite 8)                    │  │
│  │                                                              │  │
│  │  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐  │  │
│  │  │Dashboard │  │ Energy    │  │ Hydrogen  │  │ Storage  │  │  │
│  │  │  Page    │  │ Monitor   │  │  Page     │  │  Page    │  │  │
│  │  └──────────┘  └───────────┘  └───────────┘  └──────────┘  │  │
│  │  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐  │  │
│  │  │   LP     │  │ Analytics │  │Plant Data │  │  Admin   │  │  │
│  │  │Optimizer │  │   Page    │  │  Input    │  │  Panel   │  │  │
│  │  └──────────┘  └───────────┘  └───────────┘  └──────────┘  │  │
│  │                                                              │  │
│  │  AuthContext (JWT) ── Axios (API client) ── React Router v7 │  │
│  └──────────────────────────────┬───────────────────────────────┘  │
│                                 │ HTTP/REST (port 5173 → 5000)     │
│  ┌──────────────────────────────▼───────────────────────────────┐  │
│  │              SERVER  (Node.js + Express 5)                   │  │
│  │                                                              │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │  │
│  │  │  Auth Routes │  │ Data Routes  │  │ Optimization Route │  │  │
│  │  │  /api/auth   │  │ /api/metrics │  │ /api/optimization │  │  │
│  │  │  JWT + bcrypt│  │ /api/energy  │  │   LP Solver       │  │  │
│  │  │              │  │ /api/storage │  │   (Pure JS)       │  │  │
│  │  └─────────────┘  └──────────────┘  └───────────────────┘  │  │
│  │                                                              │  │
│  │  Middleware: CORS · cookieParser · express-rate-limit · JWT  │  │
│  └──────────────────────────────┬───────────────────────────────┘  │
│                                 │ Mongoose ODM                     │
│  ┌──────────────────────────────▼───────────────────────────────┐  │
│  │           DATABASE  (MongoDB Atlas)                          │  │
│  │                                                              │  │
│  │   PlantMetric  │  ProductionLog  │  OptimizationRun  │ User  │  │
│  │   AuditLog                                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action (Plant Data Input)
    │
    ▼
React State (demandForecast, solarForecast, windForecast)
    │
    ▼ POST /api/optimization/run
Express Route Handler (server.js)
    │
    ▼
optimizationService.js → validateInputs() → solveSimplexLP() → runOptimization()
    │
    ▼
{hourlyDispatchSchedule, summaryMetrics, baseline vs. optimized comparison}
    │
    ▼
React OptimizationPage / PlantDataInputPage (Recharts visualization)
    │
    ▼ (if MongoDB connected)
OptimizationRun.save() → MongoDB Atlas
```

---

## Technology Stack

### Frontend (`client/`)

| Package | Version | Role |
|---|---|---|
| **React** | `^19.2.8` | Core UI library, component model |
| **Vite** | `^8.3.0` | Build tool & HMR dev server |
| **Tailwind CSS v4** | `^4.3.3` | Utility-first styling (`@tailwindcss/vite`) |
| **React Router DOM** | `^7.18.4` | Client-side SPA routing |
| **Axios** | `^1.20.0` | HTTP client with interceptors for JWT |
| **Recharts** | `^3.10.1` | Responsive data visualization charts |
| **Framer Motion** | `^13.4.6` | Animations & micro-interactions |
| **Lucide React** | `^1.49.0` | Industrial & scientific icon set |

### Backend (`server/`)

| Package | Version | Role |
|---|---|---|
| **Node.js** | `>= 18.x` | JavaScript runtime |
| **Express** | `^5.2.1` | HTTP server & REST API framework |
| **Mongoose** | `^9.10.3` | MongoDB ODM with schema validation |
| **bcryptjs** | `^3.0.3` | Password hashing |
| **jsonwebtoken** | `^9.0.3` | JWT signing & verification |
| **cookie-parser** | `^1.4.7` | httpOnly JWT cookie handling |
| **express-rate-limit** | `^8.7.1` | API rate limiting (brute-force protection) |
| **cors** | `^2.8.6` | Origin-restricted CORS policy |
| **dotenv** | `^18.0.4` | `.env` environment loader |
| **nodemon** | `^3.1.14` | Dev hot-reload daemon |

---

## Repository Structure

```
Green-hydrogen-platform/
│
├── .gitignore                          # Excludes node_modules, .env, dist/
│
├── client/                             # ── React Frontend SPA ──────────────────
│   ├── index.html                      # App entry HTML
│   ├── vite.config.js                  # Vite + Tailwind plugin config
│   ├── package.json
│   └── src/
│       ├── main.jsx                    # React 19 root bootstrap
│       ├── App.jsx                     # Routing, auth shell, global state
│       ├── App.css / index.css         # Global styles
│       ├── api/
│       │   └── axios.js               # Axios instance (baseURL, credentials)
│       ├── context/
│       │   └── AuthContext.jsx        # JWT auth state (login/logout/user)
│       ├── components/
│       │   ├── Header.jsx             # Top bar (title, refresh, user badge)
│       │   └── Sidebar.jsx            # Navigation sidebar with DB status
│       └── pages/
│           ├── LoginPage.jsx          # Credential form → POST /api/auth/login
│           ├── DashboardPage.jsx      # KPI cards, charts, electrolyzer widget
│           ├── EnergyMonitoringPage.jsx
│           ├── HydrogenPage.jsx
│           ├── StoragePage.jsx
│           ├── OptimizationPage.jsx   # LP results, baseline comparison, presets
│           ├── PlantDataInputPage.jsx # 24h table, CSV import, Fill button, Run LP
│           ├── AnalyticsPage.jsx
│           ├── AdminPage.jsx          # User management, audit log
│           └── NotFoundPage.jsx
│
└── server/                             # ── Express Backend ──────────────────────
    ├── .env                            # Secrets (not committed)
    ├── package.json
    ├── server.js                       # App entry: middleware, routes, DB connect
    ├── middleware/
    │   └── auth.js                    # verifyToken, authorizeRoles middleware
    ├── models/
    │   ├── User.js                    # User schema (name, email, role, password)
    │   ├── PlantMetric.js             # Live telemetry snapshot
    │   ├── ProductionLog.js           # Hourly H₂ production history
    │   ├── OptimizationRun.js         # Persisted LP result records
    │   └── AuditLog.js               # Admin action audit trail
    ├── routes/
    │   ├── auth.js                    # POST /login, POST /logout, GET /me
    │   └── admin.js                   # GET/POST /admin/users, audit routes
    ├── services/
    │   ├── optimizationService.js     # ← Core LP solver (Two-Phase Simplex)
    │   └── auditService.js            # Audit event logging helpers
    ├── scripts/
    │   └── seedAdmin.js               # One-time admin user seeder
    └── tests/
        └── runAuditTests.js           # Audit service integration tests
```

---

## LP Optimization Engine

The heart of the platform is a **pure JavaScript Two-Phase Simplex LP solver** with Bland's anti-cycling rule, implemented in [`optimizationService.js`](server/services/optimizationService.js).

### Mathematical Formulation

**Decision Variables** (for each hour `t = 0 … 23`):

| Symbol | Description | Bounds |
|---|---|---|
| `P_t` | Electrolyzer power allocation (kW) | `0 ≤ P_t ≤ min(P_avail,t , P_max)` |
| `U_t` | Unmet hydrogen demand (kg) | `0 ≤ U_t ≤ D_t` |

**Derived State Variables:**

```
H_prod,t  = P_t / η                      (kg H₂ produced at hour t)
H_sup,t   = D_t - U_t                    (kg H₂ supplied to demand)
S_{t+1}   = S_t + H_prod,t - H_sup,t    (storage inventory, kg)
P_curt,t  = P_avail,t - P_t             (curtailed renewable power, kW)
```

**Physical Constraints:**

```
1. Power Capacity:      0 ≤ P_t ≤ min(Solar_t + Wind_t,  P_max_electrolyzer)
2. Tank Lower Bound:    S_{t+1} ≥ 0      (inventory never negative)
3. Tank Upper Bound:    S_{t+1} ≤ S_max  (inventory never exceeds capacity)
4. Demand Feasibility:  0 ≤ U_t ≤ D_t   (unmet demand bounded by demand)
```

**Objective Function (minimize):**

```
min Σ_{t=0}^{23} [ W_unmet × U_t  -  W_prod × (P_t / η)  +  price_t × P_t ]
                 - W_terminal × S_24

Where:
  W_unmet   = 10,000   Severe penalty for failing H₂ delivery
  W_prod    = 100      Incentive to maximize green H₂ production
  price_t   = $/kWh    Hourly grid electricity price
  W_terminal = 5       Incentive to leave end-of-day storage buffer
```

### Solver Pipeline

```
1. validateInputs()       → Schema checks on all 24-element arrays
2. Baseline Schedule      → Naive demand-tracking heuristic (no lookahead)
3. Build LP matrices      → 96 constraints × 48 decision variables
4. solveSimplexLP()       → Two-Phase Simplex with Bland's anti-cycling rule
5. Reconstruct schedule   → Hour-by-hour physical state reconstruction
6. recalculateSummaryMetrics() → Independent metric verification
7. Comparison report      → LP vs. baseline (utilization %, curtailment, cost)
```

### Default Plant Baseline (720 kW Peak)

| Parameter | Value |
|---|---|
| Max Electrolyzer Power | 600 kW |
| Specific Energy Consumption (η) | 50 kWh/kg |
| Initial Storage | 500 kg |
| Max Tank Capacity | 1,000 kg |
| Peak Solar | 600 kW (at 12:00) |
| Base Wind | 180–220 kW (diurnal) |
| H₂ Demand | 6–12 kg/h (diurnal profile) |

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Login → sets httpOnly JWT cookie |
| `POST` | `/api/auth/logout` | Auth | Clears session cookie |
| `GET` | `/api/auth/me` | Auth | Returns current user profile |

### Telemetry

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/metrics` | Auth | Live KPI snapshot (solar, wind, electrolyzer, storage) |
| `GET` | `/api/energy` | Auth | 24h diurnal energy generation profile |
| `GET` | `/api/storage` | Auth | Tank inventory, mass-flow, pressure status |

### Optimization

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/optimization/run` | Operator/Admin | Run 24h LP optimization with custom payload |
| `GET` | `/api/optimization/history` | Auth | Retrieve persisted optimization run history |

### Plant Data

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/plant-data` | Operator/Admin | Validate and persist plant configuration snapshot |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/users` | Admin | List all users |
| `POST` | `/api/admin/users` | Admin | Create new user |
| `PATCH` | `/api/admin/users/:id` | Admin | Update user role |
| `DELETE` | `/api/admin/users/:id` | Admin | Remove user |
| `GET` | `/api/admin/audit-logs` | Admin | Full audit trail |

### Sample Optimization Payload

```json
POST /api/optimization/run
{
  "solarForecast":  [0,0,0,0,0,25,90,210,360,480,560,600,580,510,420,290,140,40,0,0,0,0,0,0],
  "windForecast":   [180,190,175,160,150,140,150,165,170,180,190,185,180,175,165,170,180,195,210,220,215,200,190,185],
  "hydrogenDemand": [8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8],
  "maxElectrolyzerPower": 600,
  "specificEnergyConsumption": 50,
  "initialStorageKg": 500,
  "maxStorageCapacityKg": 1000,
  "scenarioName": "Uniform 8 kg/h Demand Run"
}
```

---

## Authentication & Role System

JWT tokens are issued at login and stored as **httpOnly cookies** (not localStorage) to prevent XSS attacks.

### Roles

| Role | Dashboard | Plant Data | Optimization | Analytics | Admin |
|---|---|---|---|---|---|
| **ADMIN** | ✅ | ✅ Read/Write | ✅ Run | ✅ | ✅ Full |
| **OPERATOR** | ✅ | ✅ Read/Write | ✅ Run | ✅ | ❌ |
| **VIEWER** | ✅ | ❌ Read-only | ❌ | ✅ | ❌ |

### Default Admin (seeded on first boot)
```
Email:    admin@greenh2.local
Password: 2024
```
> ⚠️ Change this password immediately in production via the Admin panel.

---

## Frontend Pages & Components

### `/` — Dashboard
- Live KPI stat cards: Solar (kW), Wind (kW), Total Renewable (kW), H₂ Production Rate (kg/h)
- Recharts bar chart: 24h diurnal generation profile (solar + wind stacked)
- Storage visualizer: Cylindrical tank with dynamic fill level & mass metrics
- Electrolyzer status widget: RUNNING badge, power utilization bar, efficiency %
- Smart recommendation card: LP-derived dispatch advice

### `/plant-data` — Plant Data Input *(Operator/Admin only)*
- 24-row editable forecast table (H0–H23): Solar (kW), Wind (kW), Total, Demand (kg)
- **Uniform Demand Fill**: Enter a constant kg/h value → click **Fill** → all 24 demand cells update instantly
- CSV import: Upload a 24-row `Solar_kW, Wind_kW, Demand_kg` file
- CSV template download
- Calibrate 24h curve to rated power button
- Inline cell editing with live total recalculation
- Validate & Save → POST to `/api/plant-data`
- Run Optimization → POST to `/api/optimization/run` → switches to LP results tab

### `/optimization` — Production Scheduling & Optimizer *(Operator/Admin only)*
- 5 scenario presets (Standard, High Renewables, Low Renewables, Constrained Storage, Zero Generation)
- Side-by-side LP vs. baseline KPI comparison cards
- Full 24h hourly dispatch schedule table
- Recharts timeline: electrolyzer power, H₂ production, storage inventory

### `/energy-monitoring` — Energy Monitoring
- Solar and wind generation telemetry
- Generation efficiency metrics

### `/hydrogen` — Hydrogen Production
- PEM electrolyzer operational state
- Production rate, efficiency, gas purity indicators

### `/storage` — Storage Inventory
- Tank level, pressure, available capacity
- Mass-flow balance tracker

### `/analytics` — Analytics
- Efficiency curves, LCOH (Levelized Cost of Hydrogen), carbon abatement

### `/admin` — Admin Panel *(Admin only)*
- User list with role management
- Full audit log viewer

---

## MongoDB Data Models

### `PlantMetric`
```js
{
  solarKw: Number,
  windKw: Number,
  electrolyzerPower: Number,
  efficiency: Number,
  hydrogenProductionRate: Number,
  storageLevel: Number,
  status: String,           // "RUNNING" | "STANDBY" | "FAULT"
  dataSource: String,       // "live" | "simulated"
  timestamp: Date
}
```

### `OptimizationRun`
```js
{
  scenarioName: String,
  status: String,           // "optimal" | "infeasible"
  inputParameters: Object,  // maxElectrolyzerPower, eta, initialStorage, etc.
  summaryMetrics: Object,   // optimized vs. baseline comparison
  hourlyDispatchSchedule: Array,  // 24 entries
  recommendation: String,
  createdAt: Date
}
```

### `User`
```js
{
  name: String,
  email: String (unique),
  passwordHash: String,     // bcrypt
  role: String,             // "ADMIN" | "OPERATOR" | "VIEWER"
  createdAt: Date
}
```

### `AuditLog`
```js
{
  userId: ObjectId,
  action: String,           // "LOGIN" | "CREATE_USER" | "RUN_OPTIMIZATION" etc.
  details: Object,
  ipAddress: String,
  timestamp: Date
}
```

---

## Environment Configuration

Create `server/.env` (already gitignored — never commit this):

```ini
# Server
PORT=5000
NODE_ENV=development

# MongoDB (Atlas or local)
MONGO_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>.mongodb.net/greenhydrogen?retryWrites=true&w=majority

# JWT
JWT_SECRET=replace-with-a-strong-random-secret-min-32-chars
JWT_EXPIRES_IN=8h

# CORS (comma-separated for multiple origins)
FRONTEND_ORIGIN=http://localhost:5173

# Initial admin seeding
INIT_ADMIN_EMAIL=admin@greenh2.local
INIT_ADMIN_PASSWORD=your-secure-password
INIT_ADMIN_NAME=System Administrator
```

> If `MONGO_URI` is not provided or contains placeholder credentials, the server automatically falls back to **in-memory simulated data** (Demo Engine Mode) — fully functional for development without a database.

---

## Getting Started

### Prerequisites
- Node.js `>= 18.x`
- npm `>= 9.x`
- MongoDB Atlas account (optional — runs in demo mode without it)

### 1. Clone the repository
```bash
git clone https://github.com/shevalini/Green-hydrogen-platform.git
cd Green-hydrogen-platform
```

### 2. Configure environment
```bash
cp server/.env.example server/.env   # then edit with your MongoDB URI & secrets
```

### 3. Install dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Start the backend
```bash
cd server
npm run dev          # nodemon hot-reload on http://localhost:5000
# or
npm start            # production start
```

### 5. Start the frontend
```bash
cd client
npm run dev          # Vite HMR dev server on http://localhost:5173
```

### 6. Open in browser
Navigate to **[http://localhost:5173](http://localhost:5173)**

Login with:
```
Email:    admin@greenh2.local
Password: 2024
```

---

## Scenario Presets

The LP optimizer ships with 5 built-in scenario presets accessible from the Optimization page:

| Preset | Solar Profile | Wind Profile | H₂ Demand | Use Case |
|---|---|---|---|---|
| **Standard** | Calibrated 720 kW diurnal | 180–220 kW | 6–12 kg/h diurnal | Typical operational day |
| **High Renewables** | Peak 600 kW | 200–260 kW | 8 kg/h uniform | Optimal green generation |
| **Low Renewables** | Peak 80 kW | 20 kW flat | 5 kg/h uniform | Drought / low generation |
| **Constrained Storage** | Default | Default | 2 kg/h | 100 kg tank capacity stress |
| **Zero Generation** | 0 kW all day | 0 kW all day | 4 kg/h uniform | Pure storage depletion test |

---

## Roadmap

```
Phase 1 (Complete ✅)
  ├── Full-stack React + Express + MongoDB architecture
  ├── JWT authentication with role-based access control
  ├── 24h LP optimization engine (Two-Phase Simplex, pure JS)
  ├── Plant data input with CSV import and editable forecast table
  ├── Baseline vs. optimized dispatch comparison
  └── Admin panel with audit logging

Phase 2 (Planned)
  ├── WebSocket / SSE real-time telemetry streaming
  ├── Historical trend charts (30/90 day rolling)
  ├── LCOH (Levelized Cost of Hydrogen) financial calculator
  └── Automated optimization scheduling (cron-based daily re-plan)

Phase 3 (Future)
  ├── ML-based renewable generation forecasting
  ├── Grid price API integration (day-ahead market data)
  ├── Multi-plant / multi-site dashboard support
  └── Mobile PWA with push notifications
```

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ⚡ renewable energy and ☕ by **shevalini**

</div>
