require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { verifyToken, authorizeRoles } = require('./middleware/auth');
const PlantMetric = require("./models/PlantMetric");
const ProductionLog = require("./models/ProductionLog");
const OptimizationRun = require("./models/OptimizationRun");
const {
  runOptimization,
  DEFAULT_24H_FORECAST,
  validateInputs,
} = require("./services/optimizationService");

const app = express();

// ================= MIDDLEWARE =================
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ================= MONGODB CONNECTION =================
let isDbConnected = false;
const MONGO_URI = process.env.MONGO_URI || "";

function connectDatabase() {
  if (!MONGO_URI || MONGO_URI.includes("YOUR_USERNAME") || MONGO_URI.includes("YOUR_PASSWORD")) {
    console.warn("⚠️  MongoDB URI not configured or contains placeholder credentials. Running with fallback simulated data.");
    isDbConnected = false;
    return;
  }

  mongoose
    .connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(async () => {
      isDbConnected = true;
      console.log("✅ Successfully connected to MongoDB.");
      await seedBaselineIfEmpty();
    })
    .catch((err) => {
      isDbConnected = false;
      console.warn("⚠️  MongoDB connection failed:", err.message);
      console.warn("   Falling back to labeled simulated data. Database persistence will be disabled.");
    });
}

mongoose.connection.on("disconnected", () => {
  isDbConnected = false;
  console.warn("⚠️  MongoDB disconnected.");
});

mongoose.connection.on("reconnected", () => {
  isDbConnected = true;
  console.log("✅ MongoDB reconnected.");
});

// Seed baseline record if database is empty upon first connection
async function seedBaselineIfEmpty() {
  if (!isDbConnected) return;
  try {
    const metricCount = await PlantMetric.countDocuments();
    if (metricCount === 0) {
      await PlantMetric.create({
        solarKw: 420,
        windKw: 180,
        electrolyzerPower: 550,
        efficiency: 65,
        hydrogenProductionRate: 11.0,
        storageLevel: 740,
        status: "RUNNING",
        dataSource: "simulated",
      });
      console.log("🌱 Baseline PlantMetric record seeded in MongoDB.");
    }
  } catch (err) {
    console.error("Error seeding initial data:", err.message);
  }
}

connectDatabase();

// In-memory cache for the latest active optimization run
let latestOptimizationRun = runOptimization(DEFAULT_24H_FORECAST);

// ================= BASELINE SIMULATED DATA =================
const SIMULATED_DATA = {
  metrics: {
    solarEnergy: {
      value: 420,
      unit: "kW",
      changePct: 12.4,
      trend: "up",
    },
    windEnergy: {
      value: 180,
      unit: "kW",
      changePct: 6.8,
      trend: "up",
    },
    renewableTotal: {
      value: 600,
      unit: "kW",
      utilizationPct: 82,
      trend: "nominal",
    },
    hydrogenProduction: {
      rate: 11.0,
      unit: "kg/h",
      status: "Electrolyzer running",
    },
    electrolyzer: {
      status: "RUNNING",
      utilizationPct: 78,
      powerKw: 550,
      efficiencyPct: 65,
    },
    todayProduction: {
      currentKg: 142,
      unit: "kg",
      changeVsYesterdayPct: 14.2,
      hourlyTrend: [30, 40, 35, 50, 45, 60, 55, 70, 65, 80, 75, 90],
    },
    recommendation: {
      title: "Smart Recommendation",
      category: "OPTIMIZATION",
      message:
        latestOptimizationRun?.recommendation ||
        "High renewable energy availability detected. Increase electrolyzer utilization to 550 kW for the next operating period.",
      targetPowerKw: 550,
      confidence: "94%",
    },
  },
  storage: {
    currentKg: 740,
    capacityKg: 1000,
    availableKg: 260,
    filledPercentage: 74,
    pressureBar: 350,
    status: "Nominal",
    tankId: "H2-TK-01",
  },
};

// Helper: Format 24h energy forecast for dashboard
function buildEnergyForecastPayload() {
  const sArr = DEFAULT_24H_FORECAST.solarForecast;
  const wArr = DEFAULT_24H_FORECAST.windForecast;
  const maxKw = Math.max(...sArr.map((s, i) => s + wArr[i]));

  const hourlyForecast = sArr.map((solarKw, hour) => {
    const windKw = wArr[hour];
    const totalKw = solarKw + windKw;
    return {
      hour,
      timeLabel: `${String(hour).padStart(2, "0")}:00`,
      solarKw,
      windKw,
      totalKw,
      heightPct: maxKw > 0 ? Math.round((totalKw / maxKw) * 100) : 0,
    };
  });

  // 12-interval summary for immediate dashboard display
  const generationIntervals = hourlyForecast
    .filter((_, idx) => idx % 2 === 0)
    .map((item) => ({
      time: item.timeLabel,
      heightPct: item.heightPct,
      solarKw: item.solarKw,
      windKw: item.windKw,
      totalKw: item.totalKw,
    }));

  return {
    generationIntervals,
    hourlyForecast,
    peakGenerationKw: maxKw,
    currentRenewableKw: 600,
    solarKw: 420,
    windKw: 180,
    totalSolarKwh: sArr.reduce((a, b) => a + b, 0),
    totalWindKwh: wArr.reduce((a, b) => a + b, 0),
  };
}

// ================= ROUTES =================

// 1. Health-check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Green Hydrogen Platform API is running!",
    status: "success",
    timestamp: new Date().toISOString(),
    database: isDbConnected ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || "development",
    phase: "Phase 2: Optimization Engine Active",
  });
});
// Authentication routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// Global auth guard – all routes after this require a valid JWT
/*
 * Conditional auth middleware – protect all API routes except health‑check and auth endpoints.
 * This replaces the previous global `app.use(verifyToken)` which blocked unauthenticated
 * requests to the front‑end pages.
 */
app.use((req, res, next) => {
  // Allow health‑check
  if (req.path === '/' && req.method === 'GET') {
    return next();
  }
  // Allow auth routes (login, me, logout)
  if (req.path.startsWith('/api/auth')) {
    return next();
  }
  // All other routes require a valid JWT
  return verifyToken(req, res, next);
});

// Admin routes – require ADMIN role
const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);

// 2. Current Plant Metrics
app.get("/api/metrics", async (req, res) => {
  try {
    const responseData = { ...SIMULATED_DATA.metrics };
    let dataSource = "simulated";

    // Incorporate latest optimization recommendation if available
    if (latestOptimizationRun?.recommendation) {
      responseData.recommendation.message = latestOptimizationRun.recommendation;
      if (latestOptimizationRun.hourlyDispatchSchedule?.[12]?.electrolyzerPowerKw) {
        responseData.recommendation.targetPowerKw =
          latestOptimizationRun.hourlyDispatchSchedule[12].electrolyzerPowerKw;
      }
    }

    if (isDbConnected) {
      try {
        const latestDbMetric = await PlantMetric.findOne().sort({ timestamp: -1 });
        if (latestDbMetric) {
          dataSource = "mongodb";
          responseData.solarEnergy.value = latestDbMetric.solarKw;
          responseData.windEnergy.value = latestDbMetric.windKw;
          responseData.renewableTotal.value = latestDbMetric.solarKw + latestDbMetric.windKw;
          responseData.hydrogenProduction.rate = latestDbMetric.hydrogenProductionRate;
          responseData.electrolyzer.powerKw = latestDbMetric.electrolyzerPower;
          responseData.electrolyzer.efficiencyPct = latestDbMetric.efficiency;
          responseData.electrolyzer.status = latestDbMetric.status;
        }
      } catch (dbErr) {
        console.error("Database query failed, using simulated data fallback:", dbErr.message);
      }
    }

    res.json({
      success: true,
      data: responseData,
      meta: {
        isSimulated: dataSource === "simulated",
        dataSource: dataSource,
        dbStatus: isDbConnected ? "connected" : "disconnected",
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in /api/metrics:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error retrieving metrics",
      details: error.message,
    });
  }
});

// 3. Hourly Energy Generation & Forecast
app.get("/api/energy", async (req, res) => {
  try {
    const energyData = buildEnergyForecastPayload();
    const dataSource = "simulated";

    res.json({
      success: true,
      data: energyData,
      meta: {
        isSimulated: dataSource === "simulated",
        dataSource: dataSource,
        dbStatus: isDbConnected ? "connected" : "disconnected",
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in /api/energy:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error retrieving energy generation data",
      details: error.message,
    });
  }
});

// 4. Hydrogen Inventory & Storage Tank Capacity
app.get("/api/storage", async (req, res) => {
  try {
    const storageData = { ...SIMULATED_DATA.storage };
    let dataSource = "simulated";

    if (isDbConnected) {
      try {
        const latestDbMetric = await PlantMetric.findOne().sort({ timestamp: -1 });
        if (latestDbMetric && typeof latestDbMetric.storageLevel === "number") {
          dataSource = "mongodb";
          storageData.currentKg = latestDbMetric.storageLevel;
          storageData.availableKg = Math.max(0, storageData.capacityKg - latestDbMetric.storageLevel);
          storageData.filledPercentage = Math.round((storageData.currentKg / storageData.capacityKg) * 100);
        }
      } catch (dbErr) {
        console.error("Database query failed in /api/storage:", dbErr.message);
      }
    }

    res.json({
      success: true,
      data: storageData,
      meta: {
        isSimulated: dataSource === "simulated",
        dataSource: dataSource,
        dbStatus: isDbConnected ? "connected" : "disconnected",
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in /api/storage:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error retrieving storage metrics",
      details: error.message,
    });
  }
});

// 5. POST /api/metrics — Ingest Plant Metric (Admin & Operator only)
app.post("/api/metrics", authorizeRoles('ADMIN', 'OPERATOR'), async (req, res) => {
  try {
    const { solarKw, windKw, electrolyzerPower, efficiency, hydrogenProductionRate, storageLevel, status } = req.body;

    if (
      typeof solarKw !== "number" ||
      typeof windKw !== "number" ||
      typeof electrolyzerPower !== "number" ||
      typeof efficiency !== "number" ||
      typeof hydrogenProductionRate !== "number" ||
      typeof storageLevel !== "number"
    ) {
      return res.status(400).json({
        success: false,
        error: "Validation failed: all metric values must be numeric (solarKw, windKw, electrolyzerPower, efficiency, hydrogenProductionRate, storageLevel).",
      });
    }

    if (!isDbConnected) {
      return res.status(503).json({
        success: false,
        persisted: false,
        error: "Database is disconnected. Cannot persist plant metrics. Configure valid MONGO_URI in .env to enable persistence.",
      });
    }

    const newRecord = await PlantMetric.create({
      solarKw,
      windKw,
      electrolyzerPower,
      efficiency,
      hydrogenProductionRate,
      storageLevel,
      status: status || "RUNNING",
      dataSource: "telemetry",
    });

    res.status(201).json({
      success: true,
      persisted: true,
      data: newRecord,
      message: "Plant metric persisted to MongoDB successfully.",
    });
  } catch (error) {
    console.error("Error creating plant metric:", error);
    res.status(500).json({
      success: false,
      persisted: false,
      error: "Failed to persist metric",
      details: error.message,
    });
  }
});

// 5b. POST /api/plant-data — Ingest & Validate Plant Configuration (Admin & Operator only)
app.post("/api/plant-data", authorizeRoles('ADMIN', 'OPERATOR'), async (req, res) => {
  try {
    const {
      solarKw,
      windKw,
      maxElectrolyzerPower,
      specificEnergyConsumption,
      initialStorageKg,
      maxStorageCapacityKg,
      planningHorizon,
      solarForecast,
      windForecast,
      hydrogenDemand,
    } = req.body || {};

    const validationErrors = [];

    // Numerical & limit checks
    if (typeof solarKw !== "number" || isNaN(solarKw) || solarKw < 0) {
      validationErrors.push("solarKw must be a non-negative number in kW.");
    }
    if (typeof windKw !== "number" || isNaN(windKw) || windKw < 0) {
      validationErrors.push("windKw must be a non-negative number in kW.");
    }
    if (typeof maxElectrolyzerPower !== "number" || isNaN(maxElectrolyzerPower) || maxElectrolyzerPower <= 0) {
      validationErrors.push("maxElectrolyzerPower must be a positive number in kW.");
    }
    if (typeof specificEnergyConsumption !== "number" || isNaN(specificEnergyConsumption) || specificEnergyConsumption <= 0) {
      validationErrors.push("specificEnergyConsumption must be a positive number in kWh/kg.");
    }
    if (typeof initialStorageKg !== "number" || isNaN(initialStorageKg) || initialStorageKg < 0) {
      validationErrors.push("initialStorageKg must be a non-negative number in kg.");
    }
    if (typeof maxStorageCapacityKg !== "number" || isNaN(maxStorageCapacityKg) || maxStorageCapacityKg <= 0) {
      validationErrors.push("maxStorageCapacityKg must be a positive number in kg.");
    }
    if (
      typeof initialStorageKg === "number" &&
      typeof maxStorageCapacityKg === "number" &&
      initialStorageKg > maxStorageCapacityKg
    ) {
      validationErrors.push(`initialStorageKg (${initialStorageKg} kg) cannot exceed maxStorageCapacityKg (${maxStorageCapacityKg} kg).`);
    }
    if (planningHorizon !== undefined && Number(planningHorizon) !== 24) {
      validationErrors.push("planningHorizon must be exactly 24 hours for the diurnal LP optimization model.");
    }

    if (!Array.isArray(solarForecast) || solarForecast.length !== 24) {
      validationErrors.push("solarForecast must be an array of exactly 24 numerical hourly values in kW.");
    } else if (solarForecast.some(v => typeof v !== "number" || isNaN(v) || v < 0)) {
      validationErrors.push("solarForecast contains invalid or negative generation values.");
    }

    if (!Array.isArray(windForecast) || windForecast.length !== 24) {
      validationErrors.push("windForecast must be an array of exactly 24 numerical hourly values in kW.");
    } else if (windForecast.some(v => typeof v !== "number" || isNaN(v) || v < 0)) {
      validationErrors.push("windForecast contains invalid or negative generation values.");
    }

    if (Array.isArray(hydrogenDemand)) {
      if (hydrogenDemand.length !== 24) {
        validationErrors.push("hydrogenDemand array must contain exactly 24 numerical hourly values in kg.");
      } else if (hydrogenDemand.some(v => typeof v !== "number" || isNaN(v) || v < 0)) {
        validationErrors.push("hydrogenDemand contains invalid or negative demand values.");
      }
    } else if (typeof hydrogenDemand !== "number" || isNaN(hydrogenDemand) || hydrogenDemand < 0) {
      validationErrors.push("hydrogenDemand must be a non-negative number or an array of 24 non-negative numbers in kg.");
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Plant data validation failed",
        validationErrors,
      });
    }

    // Audit log
    const { logAuditAction } = require('./services/auditService');
    logAuditAction({
      action: 'PLANT_DATA_INPUT',
      userEmail: req.user?.email || 'operator@greenh2.com',
      userRole: req.user?.role || 'OPERATOR',
      details: `Validated plant parameters: Max P=${maxElectrolyzerPower}kW, SEC=${specificEnergyConsumption}kWh/kg, Tank=${initialStorageKg}/${maxStorageCapacityKg}kg`,
      ipAddress: req.ip,
      metadata: { solarKw, windKw, maxElectrolyzerPower, specificEnergyConsumption },
    }).catch(() => {});

    const persisted = isDbConnected;
    const message = persisted
      ? "Plant data validated and persisted to MongoDB."
      : "Demo Engine Mode: Plant data successfully validated and loaded in active memory. Note: MongoDB is disconnected, so data will not persist across server restarts.";

    return res.status(200).json({
      success: true,
      message,
      persisted,
      data: {
        solarKw,
        windKw,
        maxElectrolyzerPower,
        specificEnergyConsumption,
        initialStorageKg,
        maxStorageCapacityKg,
        planningHorizon: 24,
        solarForecast,
        windForecast,
        hydrogenDemand,
      },
      meta: {
        isSimulated: !isDbConnected,
        dbStatus: isDbConnected ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in /api/plant-data:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error processing plant data",
      details: error.message,
    });
  }
});

// ================= PHASE 2: OPTIMIZATION APIS =================

// 6. POST /api/optimization/run — Calculate baseline & optimized 24h schedule
// Requires OPERATOR or ADMIN role — VIEWERs are read-only
app.post("/api/optimization/run", authorizeRoles('ADMIN', 'OPERATOR'), async (req, res) => {
  try {
    const inputPayload = req.body && Object.keys(req.body).length > 0 ? req.body : DEFAULT_24H_FORECAST;
    const result = runOptimization(inputPayload);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        validationErrors: result.validationErrors,
      });
    }

    latestOptimizationRun = result;
    let persisted = false;

    // Persist to MongoDB if connected; otherwise return computed result without claiming persistence
    if (isDbConnected) {
      try {
        const savedDoc = await OptimizationRun.create({
          scenarioName: result.scenarioName,
          inputParameters: result.inputParameters,
          hourlyDispatchSchedule: result.hourlyDispatchSchedule,
          baselineSchedule: result.baselineSchedule,
          summaryMetrics: result.summaryMetrics,
          recommendation: result.recommendation,
          status: result.status,
          dataSource: "engine",
        });
        persisted = true;
        result._id = savedDoc._id;
      } catch (dbErr) {
        console.error("Failed to persist optimization run to MongoDB:", dbErr.message);
      }
    }

    // Record audit event
    const { logAuditAction } = require('./services/auditService');
    logAuditAction({
      action: 'OPTIMIZATION_RUN',
      userEmail: req.user?.email || 'operator@greenh2.com',
      userRole: req.user?.role || 'OPERATOR',
      details: `Executed 24h LP scheduler: "${result.scenarioName || 'Standard Scenario'}" (Utilization: ${result.summaryMetrics?.optimized?.renewableUtilizationPct || 85}%)`,
      ipAddress: req.ip,
      metadata: { scenarioName: result.scenarioName, status: result.status },
    }).catch(() => {});

    res.json({
      success: true,
      data: result,
      meta: {
        persisted,
        isSimulated: !isDbConnected,
        dataSource: isDbConnected ? "mongodb" : "simulated-engine",
        dbStatus: isDbConnected ? "connected" : "disconnected",
        message: persisted
          ? "Optimization run computed and persisted to MongoDB."
          : "Optimization computed in simulated engine mode (database disconnected).",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error running optimization:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error executing optimization",
      details: error.message,
    });
  }
});

// 7. GET /api/optimization/history — Retrieve saved runs from MongoDB
app.get("/api/optimization/history", async (req, res) => {
  try {
    if (isDbConnected) {
      const runs = await OptimizationRun.find().sort({ creationTime: -1 }).limit(10);
      return res.json({
        success: true,
        count: runs.length,
        data: runs,
        meta: {
          persisted: true,
          isSimulated: false,
          dbStatus: "connected",
        },
      });
    }

    // Fallback when MongoDB is disconnected: return the latest in-memory run without claiming persistence
    const inMemoryRuns = latestOptimizationRun ? [latestOptimizationRun] : [];
    res.json({
      success: true,
      count: inMemoryRuns.length,
      data: inMemoryRuns,
      meta: {
        persisted: false,
        isSimulated: true,
        dbStatus: "disconnected",
        message: "Database disconnected. Returning volatile in-memory runs.",
      },
    });
  } catch (error) {
    console.error("Error retrieving optimization history:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error retrieving optimization history",
      details: error.message,
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error occurred",
    details: err.message,
  });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Green Hydrogen Platform Server running on http://localhost:${PORT}`);
  console.log(`📡 Health-check:       http://localhost:${PORT}/`);
  console.log(`📊 Metrics API:        http://localhost:${PORT}/api/metrics`);
  console.log(`⚡ Energy API:         http://localhost:${PORT}/api/energy`);
  console.log(`🔋 Storage API:        http://localhost:${PORT}/api/storage`);
  console.log(`⚙️  Optimization Run:   POST http://localhost:${PORT}/api/optimization/run`);
  console.log(`📜 Optimization Log:   GET  http://localhost:${PORT}/api/optimization/history`);
});