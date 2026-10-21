import { useState, useEffect, useCallback, useContext } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import api from "./api/axios";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardPage from "./pages/DashboardPage";
import EnergyMonitoringPage from "./pages/EnergyMonitoringPage";
import HydrogenPage from "./pages/HydrogenPage";
import StoragePage from "./pages/StoragePage";
import OptimizationPage from "./pages/OptimizationPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import PlantDataInputPage from "./pages/PlantDataInputPage.jsx";
import { AuthContext } from "./context/AuthContext.jsx";

const SCENARIO_PRESETS = {
  standard: { name: "Standard 24h Operational Profile", payload: {} },
  highRenewables: {
    name: "High Renewable Availability",
    payload: {
      solarForecast: [0,0,0,0,0,50,150,300,450,550,600,600,580,500,400,250,100,20,0,0,0,0,0,0],
      windForecast: [250,260,240,220,200,180,190,200,220,230,240,250,260,250,240,220,200,210,230,240,250,260,250,240],
      hydrogenDemand: Array(24).fill(8),
      initialStorageKg: 300,
      maxStorageCapacityKg: 1000,
      scenarioName: "High Renewable Availability Scenario",
    },
  },
  lowRenewables: {
    name: "Low Renewable Drought",
    payload: {
      solarForecast: [0,0,0,0,0,10,20,40,60,70,80,70,60,50,30,20,10,0,0,0,0,0,0,0],
      windForecast: Array(24).fill(20),
      hydrogenDemand: Array(24).fill(5),
      initialStorageKg: 50,
      maxStorageCapacityKg: 1000,
      scenarioName: "Low Renewable Energy Drought Scenario",
    },
  },
  constrainedStorage: {
    name: "Constrained Storage (100 kg Tank)",
    payload: {
      initialStorageKg: 80,
      maxStorageCapacityKg: 100,
      hydrogenDemand: 2,
      scenarioName: "Constrained Tank & Cost Arbitrage Scenario",
    },
  },
  zeroGen: {
    name: "Zero Generation Stress Test",
    payload: {
      solarForecast: Array(24).fill(0),
      windForecast: Array(24).fill(0),
      hydrogenDemand: Array(24).fill(4),
      initialStorageKg: 100,
      maxStorageCapacityKg: 1000,
      scenarioName: "Zero Renewable Generation Scenario",
    },
  },
};

const ROUTE_HEADERS = {
  "/": { title: "Green Hydrogen Control Center", subtitle: "Renewable energy & hydrogen production overview" },
  "/plant-data": { title: "Plant Configuration & Data Input", subtitle: "Operational parameter input, telemetry calibration, and forecast ingestion" },
  "/energy-monitoring": { title: "Renewable Energy Monitoring", subtitle: "Solar array, wind turbine generation, and meteorological sensors" },
  "/hydrogen": { title: "Hydrogen Production", subtitle: "PEM electrolyzer stack operations, efficiency, and gas purity" },
  "/storage": { title: "Hydrogen Storage Inventory", subtitle: "Type IV composite tank farm, mass flow balance, and pressure buffer" },
  "/optimization": { title: "Production Scheduling & Optimizer", subtitle: "24-Hour Horizon Linear Program (LP) dispatch and baseline analytics" },
  "/analytics": { title: "Plant Performance Analytics", subtitle: "Efficiency curves, carbon abatement trends, and levelized costs" },
  "/admin": { title: "Administration", subtitle: "User management and system configuration" },
};

// Role-based permission helpers
const ROLE_ROUTE_ACCESS = {
  ADMIN:    ["/", "/plant-data", "/energy-monitoring", "/hydrogen", "/storage", "/optimization", "/analytics", "/admin"],
  OPERATOR: ["/", "/plant-data", "/energy-monitoring", "/hydrogen", "/storage", "/optimization", "/analytics"],
  VIEWER:   ["/", "/energy-monitoring", "/hydrogen", "/storage", "/analytics"],
};

function canAccess(role, path) {
  return (ROLE_ROUTE_ACCESS[role] || []).includes(path);
}

/** Full-page loading spinner shown while AuthContext is restoring session. */
function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-[#140d08] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#c68642] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#d4cfc5] text-xs font-medium tracking-wide">Connecting to Green H₂ Control Room…</p>
      </div>
    </div>
  );
}

/** Redirects unauthenticated users to /login; enforces role-based route access. */
function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  
  const role = user.role || 'VIEWER';
  const isAllowed = allowedRoles
    ? allowedRoles.includes(role)
    : canAccess(role, location.pathname);

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }
  return children;
}

/** The protected shell — sidebar + header + page routes. */
function AppShell({ children, metaInfo, onRefresh, isRefreshing }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const currentHeader = ROUTE_HEADERS[location.pathname] || {
    title: "Green Hydrogen Platform",
    subtitle: "Digital control and monitoring center",
  };

  return (
    <div className="min-h-screen bg-[#f7f2eb] text-[#21150c] flex">
      <Sidebar metaInfo={metaInfo} userRole={user?.role} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title={currentHeader.title}
          subtitle={currentHeader.subtitle}
          isSimulated={metaInfo.isSimulated}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          user={user}
        />
        <main className="flex-1 pb-10">{children}</main>
      </div>
    </div>
  );
}

function App() {
  const { user, loading: authLoading } = useContext(AuthContext);

  // Telemetry state
  const [metrics, setMetrics] = useState(null);
  const [energyData, setEnergyData] = useState(null);
  const [storageData, setStorageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Optimization engine state
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [optLoading, setOptLoading] = useState(false);
  const [optError, setOptError] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState("standard");

  const [metaInfo, setMetaInfo] = useState({
    isSimulated: true,
    dataSource: "simulated",
    dbStatus: "disconnected",
    lastUpdated: null,
  });

  // Fetch telemetry — only runs when user is authenticated
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      setError(null);
      const [metricsRes, energyRes, storageRes] = await Promise.all([
        api.get('/api/metrics'),
        api.get('/api/energy'),
        api.get('/api/storage'),
      ]);

      if (metricsRes.data?.success && metricsRes.data?.data) {
        setMetrics(metricsRes.data.data);
        if (metricsRes.data.meta) setMetaInfo(metricsRes.data.meta);
      }
      if (energyRes.data?.success && energyRes.data?.data) {
        setEnergyData(energyRes.data.data);
      }
      if (storageRes.data?.success && storageRes.data?.data) {
        setStorageData(storageRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching telemetry:", err);
      if (err.response?.status === 401) {
        setError("Authentication required — please log in.");
      } else {
        setError(err.response?.data?.error || err.message || "Could not connect to backend API.");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  // Run optimization engine
  const triggerOptimization = useCallback(async (presetKey = "standard") => {
    if (!user) return;
    const role = user?.role;
    if (role === 'VIEWER') return; // Viewers cannot trigger optimization
    try {
      setOptLoading(true);
      setOptError(null);
      const payload = SCENARIO_PRESETS[presetKey]?.payload || {};
      const res = await api.post('/api/optimization/run', payload);
      if (res.data?.success && res.data?.data) {
        setOptimizationResult(res.data.data);
      } else {
        setOptError("Failed to calculate optimization schedule.");
      }
    } catch (err) {
      console.error("Optimization calculation error:", err);
      if (err.response?.status === 403) {
        setOptError("Insufficient permissions to run optimization.");
      } else {
        setOptError(err.response?.data?.error || err.message || "Failed to execute optimization.");
      }
    } finally {
      setOptLoading(false);
    }
  }, [user]);

  // Fetch data once user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardData();
      if (user.role !== 'VIEWER') {
        triggerOptimization("standard");
      }
    }
  }, [user, authLoading, fetchDashboardData, triggerOptimization]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
    if (user?.role !== 'VIEWER') {
      triggerOptimization(selectedPreset);
    }
  };

  const handleRunPreset = (presetKey) => {
    setSelectedPreset(presetKey);
    triggerOptimization(presetKey);
  };

  const handleRunCustomOptimization = async (customPayload) => {
    if (!user || user.role === 'VIEWER') {
      throw new Error("Insufficient permissions: VIEWER role is read-only.");
    }
    setOptLoading(true);
    setOptError(null);
    try {
      const res = await api.post('/api/optimization/run', customPayload);
      if (res.data?.success && res.data?.data) {
        setOptimizationResult(res.data.data);
        setSelectedPreset("custom");
        return res.data.data;
      } else {
        throw new Error(res.data?.error || "Failed to calculate optimization schedule.");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.validationErrors?.join("; ") ||
        err.response?.data?.error ||
        err.message ||
        "Failed to execute optimization.";
      setOptError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setOptLoading(false);
    }
  };

  // The protected page routes
  const protectedContent = (
    <AppShell metaInfo={metaInfo} onRefresh={handleManualRefresh} isRefreshing={isRefreshing}>
      <Routes>
        <Route path="/" element={
          <DashboardPage
            metrics={metrics} energyData={energyData} storageData={storageData}
            loading={loading} error={error} metaInfo={metaInfo} onRefresh={handleManualRefresh}
            userRole={user?.role}
          />
        } />
        <Route path="/plant-data" element={
          <PrivateRoute allowedRoles={["ADMIN", "OPERATOR"]}>
            <PlantDataInputPage
              metaInfo={metaInfo}
              userRole={user?.role}
              onRunOptimization={handleRunCustomOptimization}
              optimizationResult={optimizationResult}
              optLoading={optLoading}
            />
          </PrivateRoute>
        } />
        <Route path="/energy-monitoring" element={
          <EnergyMonitoringPage energyData={energyData} metrics={metrics} metaInfo={metaInfo} />
        } />
        <Route path="/hydrogen" element={
          <HydrogenPage metrics={metrics} metaInfo={metaInfo} />
        } />
        <Route path="/storage" element={
          <StoragePage storageData={storageData} metrics={metrics} metaInfo={metaInfo} />
        } />
        <Route path="/optimization" element={
          <PrivateRoute allowedRoles={["ADMIN", "OPERATOR"]}>
            <OptimizationPage
              optimizationResult={optimizationResult}
              loading={optLoading}
              error={optError}
              selectedPreset={selectedPreset}
              onRunPreset={handleRunPreset}
              onReRun={() => triggerOptimization(selectedPreset)}
              userRole={user?.role}
            />
          </PrivateRoute>
        } />
        <Route path="/analytics" element={
          <AnalyticsPage metrics={metrics} energyData={energyData} metaInfo={metaInfo} />
        } />
        <Route path="/admin" element={
          <PrivateRoute allowedRoles={["ADMIN"]}>
            <AdminPage userRole={user?.role} />
          </PrivateRoute>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={
        authLoading ? <AuthLoadingScreen /> :
        user ? <Navigate to="/" replace /> : <LoginPage />
      } />

      {/* All other routes require authentication */}
      <Route path="/*" element={
        authLoading ? <AuthLoadingScreen /> :
        !user ? <Navigate to="/login" replace /> :
        protectedContent
      } />
    </Routes>
  );
}

export default App;
