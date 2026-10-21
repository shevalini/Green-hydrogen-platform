<div align="center">

# 🌿 Green Hydrogen Platform

**A full-stack digital control & monitoring platform for renewable-to-hydrogen production facilities**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Data Flow](#data-flow)
4. [Technology Stack](#technology-stack)
5. [Repository Structure](#repository-structure)
6. [LP Optimization Engine](#lp-optimization-engine)
7. [Authentication & Role System](#authentication--role-system)
8. [API Reference](#api-reference)
9. [Frontend Pages](#frontend-pages)
10. [MongoDB Data Models](#mongodb-data-models)
11. [Environment Configuration](#environment-configuration)
12. [Getting Started](#getting-started)
13. [Scenario Presets](#scenario-presets)
14. [Roadmap](#roadmap)

---

## Executive Summary

The **Green Hydrogen Energy Platform** is a production-grade, full-stack supervisory control and monitoring dashboard for renewable-to-hydrogen facilities. It unifies real-time telemetry from solar arrays, wind turbines, PEM electrolyzers, and pressurized hydrogen storage tanks — then intelligently schedules production using a custom **24-hour Linear Programming (LP) optimizer** implemented in pure JavaScript.

---

## System Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥️ CLIENT — React 19 + Vite 8 (Port 5173)"]
        direction TB
        AUTH_CTX["AuthContext\n(JWT State)"]
        ROUTER["React Router v7\n(8 Routes)"]
        AXIOS_CLIENT["Axios HTTP Client\n(credentials: true)"]

        subgraph PAGES["Pages"]
            P1["/ Dashboard"]
            P2["/plant-data\nPlant Data Input"]
            P3["/optimization\nLP Optimizer"]
            P4["/energy-monitoring"]
            P5["/hydrogen"]
            P6["/storage"]
            P7["/analytics"]
            P8["/admin"]
        end

        subgraph COMPONENTS["Shared Components"]
            SIDEBAR["Sidebar\n(Nav + DB status)"]
            HEADER["Header\n(Title + User badge)"]
        end

        RECHARTS["Recharts\n(Data Viz)"]
        FRAMER["Framer Motion\n(Animations)"]
    end

    subgraph SERVER["⚙️ SERVER — Node.js + Express 5 (Port 5000)"]
        direction TB
        CORS_MW["CORS Middleware\n(origin whitelist)"]
        RATE_LIM["Rate Limiter\n(express-rate-limit)"]
        JWT_MW["JWT Middleware\n(verifyToken)"]
        ROLE_MW["Role Guard\n(authorizeRoles)"]

        subgraph ROUTES["Route Handlers"]
            R_AUTH["POST /api/auth/login\nPOST /api/auth/logout\nGET  /api/auth/me"]
            R_DATA["GET /api/metrics\nGET /api/energy\nGET /api/storage"]
            R_OPT["POST /api/optimization/run\nGET  /api/optimization/history"]
            R_PLANT["POST /api/plant-data"]
            R_ADMIN["GET/POST/PATCH/DELETE\n/api/admin/users\n/api/admin/audit-logs"]
        end

        subgraph SERVICES["Services"]
            OPT_SVC["optimizationService.js\n(LP Solver + Baseline)"]
            AUDIT_SVC["auditService.js\n(Event Logging)"]
        end
    end

    subgraph DB["🍃 DATABASE — MongoDB Atlas"]
        M1[("PlantMetric")]
        M2[("ProductionLog")]
        M3[("OptimizationRun")]
        M4[("User")]
        M5[("AuditLog")]
    end

    AXIOS_CLIENT -->|"HTTP REST\nwith httpOnly cookie"| CORS_MW
    CORS_MW --> RATE_LIM --> JWT_MW --> ROLE_MW
    ROLE_MW --> ROUTES
    ROUTES --> SERVICES
    ROUTES -->|"Mongoose ODM"| DB
    SERVICES -->|"store results"| M3
    AUTH_CTX --> AXIOS_CLIENT
    ROUTER --> PAGES
    PAGES --> RECHARTS
    PAGES --> FRAMER
```

---

## Data Flow

### Request / Response Cycle

```mermaid
sequenceDiagram
    actor User
    participant React as React Frontend
    participant Axios as Axios Client
    participant Express as Express Server
    participant JWT as JWT Middleware
    participant LP as LP Optimizer
    participant Mongo as MongoDB Atlas

    User->>React: Enter plant data & click "Run Optimization"
    React->>Axios: POST /api/optimization/run {payload}
    Axios->>Express: HTTP Request + httpOnly Cookie
    Express->>JWT: verifyToken(cookie)
    JWT-->>Express: decoded user {id, role}
    Express->>Express: authorizeRoles(OPERATOR, ADMIN)
    Express->>LP: runOptimization(payload)
    LP->>LP: validateInputs()
    LP->>LP: buildBaselineSchedule()
    LP->>LP: solveSimplexLP() — Two-Phase Simplex
    LP->>LP: recalculateSummaryMetrics()
    LP-->>Express: {hourlyDispatchSchedule, summaryMetrics, comparison}
    Express->>Mongo: OptimizationRun.save()
    Mongo-->>Express: saved document
    Express-->>Axios: 200 {success:true, data:{...}}
    Axios-->>React: res.data.data
    React-->>User: Show LP results table + charts
```

### Plant Data Input Flow

```mermaid
flowchart LR
    A["User edits\n24h table"] --> B{"Input type?"}
    B -->|"Type in cell"| C["handleUpdateHourlyCell()\nupdates single index"]
    B -->|"Fill button"| D["handleApplyUniformDemand()\nArray 24 .fill val\nfillKey++"]
    B -->|"CSV upload"| E["FileReader\nparse CSV rows\nvalidate 24 entries"]
    C --> F["demandForecast state\n24-element array"]
    D --> F
    E --> F
    F --> G["totalDemandKg\nrecalculated live"]
    G --> H{"Action?"}
    H -->|"Validate & Save"| I["POST /api/plant-data"]
    H -->|"Run Optimization"| J["POST /api/optimization/run"]
    J --> K["LP Result\nDisplayed in table"]
```

---

## Technology Stack

### Frontend

```mermaid
graph LR
    subgraph FE["Frontend Dependencies"]
        REACT["React 19.2\nUI Components"]
        VITE["Vite 8.3\nBuild + HMR"]
        TW["Tailwind CSS v4\nUtility Styling"]
        RR["React Router v7\nSPA Routing"]
        AX["Axios 1.20\nHTTP Client"]
        RC["Recharts 3.10\nData Charts"]
        FM["Framer Motion 13\nAnimations"]
        LR["Lucide React 1.49\nIcon Set"]
    end

    REACT --- VITE
    REACT --- TW
    REACT --- RR
    REACT --- AX
    REACT --- RC
    REACT --- FM
    REACT --- LR
```

| Package | Version | Role |
|---|---|---|
| **React** | `^19.2.8` | Core UI component library |
| **Vite** | `^8.3.0` | Ultra-fast build tool & HMR dev server |
| **Tailwind CSS v4** | `^4.3.3` | Utility-first styling (`@tailwindcss/vite`) |
| **React Router DOM** | `^7.18.4` | Client-side SPA routing |
| **Axios** | `^1.20.0` | HTTP client with interceptors |
| **Recharts** | `^3.10.1` | Responsive chart components |
| **Framer Motion** | `^13.4.6` | Animations & micro-interactions |
| **Lucide React** | `^1.49.0` | Industrial icon library |

### Backend

| Package | Version | Role |
|---|---|---|
| **Node.js** | `>= 18.x` | JavaScript runtime |
| **Express** | `^5.2.1` | HTTP server & REST API framework |
| **Mongoose** | `^9.10.3` | MongoDB ODM with schema validation |
| **bcryptjs** | `^3.0.3` | Password hashing |
| **jsonwebtoken** | `^9.0.3` | JWT signing & verification |
| **cookie-parser** | `^1.4.7` | httpOnly JWT cookie handling |
| **express-rate-limit** | `^8.7.1` | Brute-force rate limiting |
| **cors** | `^2.8.6` | Origin-restricted CORS policy |
| **dotenv** | `^18.0.4` | `.env` environment loader |
| **nodemon** | `^3.1.14` | Dev hot-reload daemon |

---

## Repository Structure

```
Green-hydrogen-platform/
│
├── .gitignore                          ← excludes node_modules, .env, dist/
├── README.md
│
├── client/                             ── React Frontend SPA ──────────────
│   ├── index.html
│   ├── vite.config.js                  ← Vite + Tailwind plugin
│   ├── package.json
│   └── src/
│       ├── main.jsx                    ← React 19 root bootstrap
│       ├── App.jsx                     ← Routes, auth shell, global state
│       ├── api/
│       │   └── axios.js               ← Axios instance (baseURL, credentials)
│       ├── context/
│       │   └── AuthContext.jsx        ← JWT auth state provider
│       ├── components/
│       │   ├── Header.jsx
│       │   └── Sidebar.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── DashboardPage.jsx
│           ├── EnergyMonitoringPage.jsx
│           ├── HydrogenPage.jsx
│           ├── StoragePage.jsx
│           ├── OptimizationPage.jsx   ← LP results + scenario presets
│           ├── PlantDataInputPage.jsx ← 24h table, Fill, CSV, Run LP
│           ├── AnalyticsPage.jsx
│           ├── AdminPage.jsx
│           └── NotFoundPage.jsx
│
└── server/                             ── Express Backend ──────────────────
    ├── .env                            ← Secrets (gitignored)
    ├── package.json
    ├── server.js                       ← Entry: middleware, routes, DB connect
    ├── middleware/
    │   └── auth.js                    ← verifyToken, authorizeRoles
    ├── models/
    │   ├── User.js
    │   ├── PlantMetric.js
    │   ├── ProductionLog.js
    │   ├── OptimizationRun.js
    │   └── AuditLog.js
    ├── routes/
    │   ├── auth.js
    │   └── admin.js
    ├── services/
    │   ├── optimizationService.js     ← Two-Phase Simplex LP solver
    │   └── auditService.js
    ├── scripts/
    │   └── seedAdmin.js
    └── tests/
        └── runAuditTests.js
```

---

## LP Optimization Engine

### Algorithm Pipeline

```mermaid
flowchart TD
    A["POST /api/optimization/run\n{solarForecast, windForecast,\nhydrogenDemand, ...params}"] --> B

    B["validateInputs()\nCheck 24-element arrays\nBounds on all parameters"]
    B -->|"Invalid"| ERR["Return 400\n{validationErrors:[...]}"]
    B -->|"Valid"| C

    C["Build Baseline Schedule\nNaive demand-tracking heuristic\n(no lookahead, greedy)"]

    C --> D["Build LP Matrices\n48 Decision Variables\n96 Constraints\n4 Constraint types"]

    D --> E["solveSimplexLP c, A, b\nTwo-Phase Simplex\nBland anti-cycling rule\nmax 6000 iterations"]

    E -->|"Infeasible"| F["Return infeasible status\nwith baseline only"]
    E -->|"Optimal"| G

    G["Reconstruct Optimized Schedule\n24h physical state propagation\nS t+1 = S t + H prod - H sup"]

    G --> H["recalculateSummaryMetrics\nBaseline metrics\nOptimized metrics"]

    H --> I["Comparison Report\nUtilization % improvement\nCurtailment saved kWh\nUnmet demand reduction kg\nCost savings"]

    I --> J["Generate Recommendation Text\nautomated narrative summary"]

    J --> K["Return Result\nhourlyDispatchSchedule 24 rows\nsummaryMetrics\nbaselineSchedule\nrecommendation"]

    K -->|"MongoDB connected"| L["OptimizationRun.save()"]
    K --> M["JSON Response to Client"]
```

### Mathematical Formulation

**Decision Variables** (for each hour `t = 0 … 23`):

| Symbol | Description | Bounds |
|---|---|---|
| `P_t` | Electrolyzer power allocation (kW) | `0 ≤ P_t ≤ min(P_avail,t , P_max)` |
| `U_t` | Unmet hydrogen demand (kg) | `0 ≤ U_t ≤ D_t` |

**Physical Constraints:**

```mermaid
graph LR
    subgraph CONSTRAINTS["LP Constraint Set (96 total for 24h)"]
        C1["① Power Capacity\n0 ≤ P_t ≤ min(Solar_t + Wind_t, P_max)"]
        C2["② Unmet Demand Bound\n0 ≤ U_t ≤ D_t"]
        C3["③ Tank Upper Bound\nS_t+1 ≤ S_max\n(never overfill tank)"]
        C4["④ Tank Lower Bound\nS_t+1 ≥ 0\n(inventory never negative)"]
    end
```

**Objective Function (Minimize):**

```
min Σ_{t=0}^{23} [ W_unmet × U_t  −  W_prod × (P_t / η)  +  price_t × P_t ]
                 − W_terminal × S_24

  W_unmet    = 10,000   (penalty: failing H₂ delivery)
  W_prod     = 100      (incentive: maximize green H₂)
  price_t    = $/kWh    (hourly grid electricity price)
  W_terminal = 5        (incentive: protective end-of-day buffer)
```

**State Equations:**

```
H_prod,t = P_t / η                        kg H₂ produced at hour t
H_sup,t  = D_t − U_t                      kg H₂ supplied to demand
S_{t+1}  = S_t + H_prod,t − H_sup,t      storage inventory update
P_curt,t = P_avail,t − P_t               curtailed renewable power
```

### Default Plant Parameters

| Parameter | Value |
|---|---|
| Max Electrolyzer Power (`P_max`) | 600 kW |
| Specific Energy Consumption (`η`) | 50 kWh/kg |
| Initial Storage (`S_0`) | 500 kg |
| Max Tank Capacity (`S_max`) | 1,000 kg |
| Peak Solar | 600 kW at 12:00 |
| Base Wind | 180–220 kW (diurnal) |
| H₂ Demand | 6–12 kg/h (diurnal profile) |

---

## Authentication & Role System

### JWT Auth Flow

```mermaid
sequenceDiagram
    actor User
    participant Login as LoginPage
    participant API as Express /api/auth
    participant DB as MongoDB Users
    participant MW as JWT Middleware
    participant Route as Protected Route

    User->>Login: Enter email + password
    Login->>API: POST /api/auth/login
    API->>DB: User.findOne({email})
    DB-->>API: user document
    API->>API: bcrypt.compare(password, hash)
    alt Valid credentials
        API->>API: jwt.sign({id, role}, SECRET, 8h)
        API-->>Login: Set-Cookie: token=JWT (httpOnly, Secure)
        Login-->>User: Redirect to Dashboard
    else Invalid
        API-->>Login: 401 Unauthorized
        Login-->>User: Show error message
    end

    Note over User, Route: Subsequent authenticated requests

    User->>Route: Navigate to /plant-data
    Route->>MW: verifyToken(req.cookies.token)
    MW->>MW: jwt.verify(token, SECRET)
    alt Token valid
        MW->>MW: authorizeRoles(OPERATOR, ADMIN)
        MW-->>Route: next() — allow
        Route-->>User: Render PlantDataInputPage
    else Token expired/invalid
        MW-->>User: 401 → Redirect /login
    end
```

### Role-Based Access Control

```mermaid
graph TD
    subgraph ROLES["User Roles"]
        ADMIN["👑 ADMIN"]
        OPERATOR["🔧 OPERATOR"]
        VIEWER["👁️ VIEWER"]
    end

    subgraph ROUTES_ACCESS["Route Access"]
        R1["/ Dashboard"]
        R2["/plant-data ✏️"]
        R3["/optimization ⚡"]
        R4["/energy-monitoring"]
        R5["/hydrogen"]
        R6["/storage"]
        R7["/analytics"]
        R8["/admin 🔒"]
    end

    ADMIN -->|"Full access"| R1
    ADMIN --> R2
    ADMIN --> R3
    ADMIN --> R4
    ADMIN --> R5
    ADMIN --> R6
    ADMIN --> R7
    ADMIN -->|"Only role"| R8

    OPERATOR --> R1
    OPERATOR --> R2
    OPERATOR --> R3
    OPERATOR --> R4
    OPERATOR --> R5
    OPERATOR --> R6
    OPERATOR --> R7

    VIEWER --> R1
    VIEWER --> R4
    VIEWER --> R5
    VIEWER --> R6
    VIEWER --> R7
```

| Role | Dashboard | Plant Data | Run LP | Analytics | Admin Panel |
|---|---|---|---|---|---|
| **ADMIN** | ✅ | ✅ Read/Write | ✅ | ✅ | ✅ Full |
| **OPERATOR** | ✅ | ✅ Read/Write | ✅ | ✅ | ❌ |
| **VIEWER** | ✅ | ❌ Read-only | ❌ | ✅ | ❌ |

---

## API Reference

```mermaid
graph LR
    subgraph AUTH["🔐 Auth  /api/auth"]
        A1["POST /login"]
        A2["POST /logout"]
        A3["GET  /me"]
    end

    subgraph TELEMETRY["📡 Telemetry"]
        T1["GET /api/metrics"]
        T2["GET /api/energy"]
        T3["GET /api/storage"]
    end

    subgraph OPT["🧮 Optimization"]
        O1["POST /api/optimization/run"]
        O2["GET  /api/optimization/history"]
    end

    subgraph PLANT["🏭 Plant Data"]
        PL1["POST /api/plant-data"]
    end

    subgraph ADMIN["👑 Admin  /api/admin"]
        AD1["GET  /users"]
        AD2["POST /users"]
        AD3["PATCH /users/:id"]
        AD4["DELETE /users/:id"]
        AD5["GET /audit-logs"]
    end
```

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

## Frontend Pages

```mermaid
graph TD
    subgraph APP["App.jsx — Protected Shell"]
        SIDEBAR_C["Sidebar"]
        HEADER_C["Header"]
    end

    subgraph PAGE_LIST["Page Components"]
        DB["DashboardPage\n/ \nKPI cards, generation chart,\nstorage viz, electrolyzer widget"]
        PD["PlantDataInputPage\n/plant-data\n24h table, Fill, CSV, Run LP"]
        OP["OptimizationPage\n/optimization\nLP results, scenario presets,\nbaseline comparison"]
        EM["EnergyMonitoringPage\n/energy-monitoring"]
        HP["HydrogenPage\n/hydrogen"]
        SP["StoragePage\n/storage"]
        AN["AnalyticsPage\n/analytics"]
        AD["AdminPage\n/admin"]
    end

    APP --> PAGE_LIST

    DB --> DB1["📊 KPI Stat Cards\nSolar, Wind, Renewable, H₂ Rate"]
    DB --> DB2["📈 Recharts Bar Chart\n24h diurnal generation"]
    DB --> DB3["🛢️ Storage Visualizer\nCylindrical tank + fill level"]
    DB --> DB4["⚡ Electrolyzer Monitor\nRunning status, power, efficiency"]

    PD --> PD1["📋 Editable 24h Forecast Table\nH0–H23 Solar, Wind, Demand"]
    PD --> PD2["🔢 Uniform Fill Button\nFills all 24 demand rows instantly"]
    PD --> PD3["📂 CSV Import\nUpload + validate 24-row CSV"]
    PD --> PD4["🧮 Run LP Optimization\nPOST → show results inline"]

    OP --> OP1["5 Scenario Presets"]
    OP --> OP2["LP vs Baseline KPI Cards"]
    OP --> OP3["24h Hourly Dispatch Table"]
```

---

## MongoDB Data Models

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email
        string passwordHash
        string role
        date createdAt
    }

    PLANT_METRIC {
        ObjectId _id PK
        number solarKw
        number windKw
        number electrolyzerPower
        number efficiency
        number hydrogenProductionRate
        number storageLevel
        string status
        string dataSource
        date timestamp
    }

    OPTIMIZATION_RUN {
        ObjectId _id PK
        string scenarioName
        string status
        object inputParameters
        object summaryMetrics
        array hourlyDispatchSchedule
        array baselineSchedule
        string recommendation
        date createdAt
    }

    PRODUCTION_LOG {
        ObjectId _id PK
        number hourlyProduction
        number cumulativeProduction
        date timestamp
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId userId FK
        string action
        object details
        string ipAddress
        date timestamp
    }

    USER ||--o{ AUDIT_LOG : "generates"
    USER ||--o{ OPTIMIZATION_RUN : "triggers"
    PLANT_METRIC ||--o{ PRODUCTION_LOG : "feeds"
```

---

## Environment Configuration

```mermaid
graph LR
    ENV[".env file\n(server/.env)"] --> P1["PORT=5000"]
    ENV --> P2["MONGO_URI=mongodb+srv://..."]
    ENV --> P3["JWT_SECRET=32+ char secret"]
    ENV --> P4["JWT_EXPIRES_IN=8h"]
    ENV --> P5["NODE_ENV=development"]
    ENV --> P6["FRONTEND_ORIGIN=http://localhost:5173"]
    ENV --> P7["INIT_ADMIN_EMAIL"]
    ENV --> P8["INIT_ADMIN_PASSWORD"]

    P2 -->|"connected"| DB_MODE["💾 Persistent MongoDB Mode\nAll data saved to Atlas"]
    P2 -->|"missing / placeholder"| SIM_MODE["🔁 Demo Engine Mode\nIn-memory simulated data\n(no DB required)"]
```

Create `server/.env`:

```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<USER>:<PASSWORD>@<CLUSTER>.mongodb.net/greenhydrogen?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-strong-random-secret-min-32-chars
JWT_EXPIRES_IN=8h
FRONTEND_ORIGIN=http://localhost:5173
INIT_ADMIN_EMAIL=admin@greenh2.local
INIT_ADMIN_PASSWORD=your-secure-password
INIT_ADMIN_NAME=System Administrator
```

> **Demo Mode:** If `MONGO_URI` is missing or uses placeholder credentials, the server automatically runs in full Demo Engine Mode — completely functional without a database.

---

## Getting Started

### Prerequisites
- Node.js `>= 18.x` · npm `>= 9.x`
- MongoDB Atlas account *(optional — runs in demo mode without it)*

```mermaid
flowchart LR
    A["git clone\ngithub.com/shevalini/\nGreen-hydrogen-platform"] --> B["cd server\nnpm install"]
    B --> C["Edit server/.env\n(add MONGO_URI, JWT_SECRET)"]
    C --> D["npm run dev\nbackend :5000"]
    D --> E["cd ../client\nnpm install"]
    E --> F["npm run dev\nfrontend :5173"]
    F --> G["Open browser\nlocalhost:5173"]
    G --> H["Login\nadmin@greenh2.local\n2024"]
```

```bash
# 1. Clone
git clone https://github.com/shevalini/Green-hydrogen-platform.git
cd Green-hydrogen-platform

# 2. Backend
cd server
npm install
# edit .env with your secrets
npm run dev        # → http://localhost:5000

# 3. Frontend (new terminal)
cd client
npm install
npm run dev        # → http://localhost:5173
```

---

## Scenario Presets

```mermaid
graph TD
    subgraph PRESETS["LP Scenario Presets"]
        S1["⚡ Standard\nCalibrated 720kW diurnal\nTypical operational day"]
        S2["🌞 High Renewables\nPeak 600kW solar\n200-260kW wind\nOptimal green day"]
        S3["🌧️ Low Renewables\nPeak 80kW solar\n20kW wind flat\nDrought simulation"]
        S4["🛢️ Constrained Storage\n100 kg tank only\nStorage stress test"]
        S5["⬛ Zero Generation\n0 kW all 24h\nPure storage depletion"]
    end

    S1 --> R1["Demand: 6-12 kg/h diurnal\nStorage: 500/1000 kg"]
    S2 --> R2["Demand: 8 kg/h uniform\nStorage: 300/1000 kg"]
    S3 --> R3["Demand: 5 kg/h uniform\nStorage: 50/1000 kg"]
    S4 --> R4["Demand: 2 kg/h uniform\nStorage: 80/100 kg"]
    S5 --> R5["Demand: 4 kg/h uniform\nStorage: 100/1000 kg"]
```

---

## Roadmap

```mermaid
timeline
    title Platform Evolution Roadmap
    Phase 1 - Complete : JWT auth + RBAC
                       : Two-Phase Simplex LP optimizer
                       : 24h plant data input with CSV import
                       : Baseline vs optimized comparison
                       : Admin panel + audit logging
                       : MongoDB Atlas persistence
    Phase 2 - Planned  : WebSocket real-time telemetry streaming
                       : 30 and 90 day historical trend charts
                       : LCOH financial calculator
                       : Automated daily re-plan cron job
    Phase 3 - Future   : ML-based renewable generation forecasting
                       : Day-ahead grid price API integration
                       : Multi-site dashboard support
                       : Mobile PWA with push notifications
```

---

<div align="center">

Built with ⚡ renewable energy and ☕ by **shevalini**

</div>
