import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sliders,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Layers,
  ArrowRight,
  Database,
  FileSpreadsheet,
  Activity,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import api from "../api/axios";

// Calibrated 24h default values matching plant baseline
const DEFAULT_SOLAR_FORECAST = [
  0, 0, 0, 0, 0, 25, 90, 210, 360, 480, 560, 600,
  580, 510, 420, 290, 140, 40, 0, 0, 0, 0, 0, 0,
];

const DEFAULT_WIND_FORECAST = [
  180, 190, 175, 160, 150, 140, 150, 165, 170, 180, 190, 185,
  180, 175, 165, 170, 180, 195, 210, 220, 215, 200, 190, 185,
];

const DEFAULT_DEMAND = [
  6, 6, 6, 6, 7, 8, 10, 12, 12, 11, 10, 9,
  8, 8, 9, 10, 12, 12, 11, 9, 8, 7, 6, 6,
];

export default function PlantDataInputPage({
  metaInfo,
  userRole,
  onRunOptimization,
  optimizationResult,
  optLoading,
}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form specifications
  const [solarKw, setSolarKw] = useState(420);
  const [windKw, setWindKw] = useState(180);
  const [maxElectrolyzerPower, setMaxElectrolyzerPower] = useState(600);
  const [specificEnergyConsumption, setSpecificEnergyConsumption] = useState(50);
  const [initialStorageKg, setInitialStorageKg] = useState(500);
  const [maxStorageCapacityKg, setMaxStorageCapacityKg] = useState(1000);
  const [constantDemandInput, setConstantDemandInput] = useState(8);
  const [planningHorizon, setPlanningHorizon] = useState(24);
  const [scenarioName, setScenarioName] = useState("Custom Plant Ingestion Profile");

  // 24-Hour Forecast Arrays
  const [solarForecast, setSolarForecast] = useState([...DEFAULT_SOLAR_FORECAST]);
  const [windForecast, setWindForecast] = useState([...DEFAULT_WIND_FORECAST]);
  const [demandForecast, setDemandForecast] = useState([...DEFAULT_DEMAND]);

  // Operational states
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [csvStatusMsg, setCsvStatusMsg] = useState(null);
  const [activeTab, setActiveTab] = useState("table"); // "table" | "results"
  // Incremented on every Fill so React remounts demand inputs and syncs DOM
  const [fillKey, setFillKey] = useState(0);

  const isViewer = userRole === "VIEWER";

  // Validate form fields and array data
  const validateForm = () => {
    const errors = [];

    if (isNaN(solarKw) || solarKw < 0) {
      errors.push("Current Solar Power must be a non-negative number in kW.");
    }
    if (isNaN(windKw) || windKw < 0) {
      errors.push("Current Wind Power must be a non-negative number in kW.");
    }
    if (isNaN(maxElectrolyzerPower) || maxElectrolyzerPower <= 0) {
      errors.push("Electrolyzer Maximum Power rating must be a positive number in kW (e.g. 600 kW).");
    }
    if (isNaN(specificEnergyConsumption) || specificEnergyConsumption <= 0) {
      errors.push("Specific Energy Consumption must be a positive number in kWh/kg (e.g. 50 kWh/kg).");
    }
    if (isNaN(initialStorageKg) || initialStorageKg < 0) {
      errors.push("Current Hydrogen Inventory must be non-negative in kg.");
    }
    if (isNaN(maxStorageCapacityKg) || maxStorageCapacityKg <= 0) {
      errors.push("Tank Maximum Capacity must be a positive number in kg.");
    }
    if (initialStorageKg > maxStorageCapacityKg) {
      errors.push(
        `Current Inventory (${initialStorageKg} kg) cannot exceed Tank Maximum Capacity (${maxStorageCapacityKg} kg).`
      );
    }
    if (Number(planningHorizon) !== 24) {
      errors.push("Planning Horizon must be exactly 24 hours for the diurnal LP optimization model.");
    }

    if (!Array.isArray(solarForecast) || solarForecast.length !== 24) {
      errors.push("Solar 24-hour forecast must have exactly 24 numerical hourly values.");
    } else if (solarForecast.some((v) => typeof v !== "number" || isNaN(v) || v < 0)) {
      errors.push("Solar forecast contains negative or non-numeric hourly values.");
    }

    if (!Array.isArray(windForecast) || windForecast.length !== 24) {
      errors.push("Wind 24-hour forecast must have exactly 24 numerical hourly values.");
    } else if (windForecast.some((v) => typeof v !== "number" || isNaN(v) || v < 0)) {
      errors.push("Wind forecast contains negative or non-numeric hourly values.");
    }

    if (!Array.isArray(demandForecast) || demandForecast.length !== 24) {
      errors.push("Demand forecast must have exactly 24 numerical hourly values.");
    } else if (demandForecast.some((v) => typeof v !== "number" || isNaN(v) || v < 0)) {
      errors.push("Demand forecast contains negative or non-numeric hourly values.");
    }

    return errors;
  };

  // Downloadable CSV template
  const handleDownloadCsvTemplate = () => {
    const headers = ["Hour", "Time", "Solar_kW", "Wind_kW", "Demand_kg"];
    const rows = Array.from({ length: 24 }, (_, i) => {
      const timeStr = `${String(i).padStart(2, "0")}:00`;
      return [i, timeStr, DEFAULT_SOLAR_FORECAST[i], DEFAULT_WIND_FORECAST[i], DEFAULT_DEMAND[i]].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "green_h2_forecast_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // CSV file upload parser
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvStatusMsg(null);
    setValidationErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== "string") {
          throw new Error("Unable to read CSV file content.");
        }

        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        if (lines.length < 2) {
          throw new Error("CSV file is empty or does not contain a header and 24 data rows.");
        }

        const headerLine = lines[0].toLowerCase();
        const headers = headerLine.split(",").map((h) => h.replace(/["\s]/g, ""));

        // Match column indices
        const solarCol = headers.findIndex((h) => h.includes("solar"));
        const windCol = headers.findIndex((h) => h.includes("wind"));
        const demandCol = headers.findIndex((h) => h.includes("demand"));

        if (solarCol === -1 || windCol === -1 || demandCol === -1) {
          throw new Error(
            `Missing required CSV columns. Required: 'Solar_kW', 'Wind_kW', 'Demand_kg'. Found headers: [${headers.join(", ")}]`
          );
        }

        const dataRows = lines.slice(1, 25);
        if (dataRows.length !== 24) {
          throw new Error(
            `CSV must contain exactly 24 hourly rows (found ${dataRows.length} rows). Please use the provided template.`
          );
        }

        const newSolar = [];
        const newWind = [];
        const newDemand = [];

        for (let i = 0; i < 24; i++) {
          const cols = dataRows[i].split(",").map((c) => c.replace(/["\s]/g, ""));
          const sVal = parseFloat(cols[solarCol]);
          const wVal = parseFloat(cols[windCol]);
          const dVal = parseFloat(cols[demandCol]);

          if (isNaN(sVal) || sVal < 0) {
            throw new Error(`Row ${i + 1} (Hour ${i}): Invalid or negative solar power value '${cols[solarCol]}'.`);
          }
          if (isNaN(wVal) || wVal < 0) {
            throw new Error(`Row ${i + 1} (Hour ${i}): Invalid or negative wind power value '${cols[windCol]}'.`);
          }
          if (isNaN(dVal) || dVal < 0) {
            throw new Error(`Row ${i + 1} (Hour ${i}): Invalid or negative hydrogen demand value '${cols[demandCol]}'.`);
          }

          newSolar.push(Math.round(sVal * 10) / 10);
          newWind.push(Math.round(wVal * 10) / 10);
          newDemand.push(Math.round(dVal * 10) / 10);
        }

        setSolarForecast(newSolar);
        setWindForecast(newWind);
        setDemandForecast(newDemand);
        setCsvStatusMsg(`Successfully loaded 24-hour diurnal profile from '${file.name}'.`);
      } catch (err) {
        setValidationErrors([`CSV Import Error: ${err.message}`]);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  // Quick helper to populate uniform demand across all 24 hours
  const handleApplyUniformDemand = () => {
    const val = parseFloat(String(constantDemandInput));
    if (isNaN(val) || val < 0) {
      setValidationErrors(["Please specify a non-negative constant demand value in kg/h."]);
      return;
    }
    // Spread into a fresh array so React always detects the state change
    const filled = [...Array(24).fill(val)];
    setDemandForecast(filled);
    // Bump fillKey so demand input elements are remounted — forces DOM sync
    setFillKey((k) => k + 1);
    setValidationErrors([]);
    setSaveSuccessMsg(`✓ All 24 demand slots set to ${val} kg/h (${val * 24} kg/day total).`);
  };

  // Quick helper to scale diurnal profile based on ratings
  const handleScaleDiurnalCurve = () => {
    const peakSolar = parseFloat(solarKw) || 420;
    const baseWind = parseFloat(windKw) || 180;

    const scaledSolar = DEFAULT_SOLAR_FORECAST.map((v) =>
      Math.round(((v / 600) * peakSolar) * 10) / 10
    );
    const scaledWind = DEFAULT_WIND_FORECAST.map((v) =>
      Math.round(((v / 180) * baseWind) * 10) / 10
    );

    setSolarForecast(scaledSolar);
    setWindForecast(scaledWind);
    setValidationErrors([]);
    setCsvStatusMsg("Generated 24-hour diurnal curve calibrated to current plant power ratings.");
  };

  // Reset to baseline defaults
  const handleResetDefaults = () => {
    setSolarKw(420);
    setWindKw(180);
    setMaxElectrolyzerPower(600);
    setSpecificEnergyConsumption(50);
    setInitialStorageKg(500);
    setMaxStorageCapacityKg(1000);
    setConstantDemandInput(8);
    setPlanningHorizon(24);
    setSolarForecast([...DEFAULT_SOLAR_FORECAST]);
    setWindForecast([...DEFAULT_WIND_FORECAST]);
    setDemandForecast([...DEFAULT_DEMAND]);
    setValidationErrors([]);
    setSaveSuccessMsg(null);
    setCsvStatusMsg(null);
  };

  // Save plant configuration to backend
  const handleSavePlantData = async () => {
    if (isViewer) {
      setValidationErrors(["Viewer role is read-only. Only Operators and Administrators can submit plant data."]);
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setSaveLoading(true);
    setSaveSuccessMsg(null);

    const payload = {
      solarKw: Number(solarKw),
      windKw: Number(windKw),
      maxElectrolyzerPower: Number(maxElectrolyzerPower),
      specificEnergyConsumption: Number(specificEnergyConsumption),
      initialStorageKg: Number(initialStorageKg),
      maxStorageCapacityKg: Number(maxStorageCapacityKg),
      planningHorizon: 24,
      solarForecast,
      windForecast,
      hydrogenDemand: demandForecast,
    };

    try {
      const res = await api.post("/api/plant-data", payload);
      if (res.data?.success) {
        setSaveSuccessMsg(res.data.message || "Plant configuration validated successfully.");
      } else {
        setValidationErrors([res.data?.error || "Validation failed on backend."]);
      }
    } catch (err) {
      const serverErrors =
        err.response?.data?.validationErrors ||
        [err.response?.data?.error || err.message || "Network error submitting plant data."];
      setValidationErrors(serverErrors);
    } finally {
      setSaveLoading(false);
    }
  };

  // Execute LP optimization with current validated parameters
  const handleExecuteOptimization = async () => {
    if (isViewer) {
      setValidationErrors(["Viewer role is read-only. Cannot trigger optimization runs."]);
      return;
    }

    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setSaveSuccessMsg(null);

    const payload = {
      solarForecast,
      windForecast,
      hydrogenDemand: demandForecast,
      maxElectrolyzerPower: Number(maxElectrolyzerPower),
      specificEnergyConsumption: Number(specificEnergyConsumption),
      initialStorageKg: Number(initialStorageKg),
      maxStorageCapacityKg: Number(maxStorageCapacityKg),
      scenarioName: scenarioName || "Custom Plant Data Ingestion Run",
    };

    try {
      if (onRunOptimization) {
        await onRunOptimization(payload);
        setActiveTab("results");
        setSaveSuccessMsg("24-Hour LP Optimization executed successfully using your plant parameters.");
      }
    } catch (err) {
      setValidationErrors([err.message || "Error executing optimization."]);
    }
  };

  // Inline table cell edit handler
  const handleUpdateHourlyCell = (hour, field, value) => {
    const num = parseFloat(value);
    const validNum = isNaN(num) ? 0 : Math.max(0, num);

    if (field === "solar") {
      const updated = [...solarForecast];
      updated[hour] = validNum;
      setSolarForecast(updated);
    } else if (field === "wind") {
      const updated = [...windForecast];
      updated[hour] = validNum;
      setWindForecast(updated);
    } else if (field === "demand") {
      const updated = [...demandForecast];
      updated[hour] = validNum;
      setDemandForecast(updated);
    }
  };

  // Totals calculations for the preview
  const totalSolarKwh = Math.round(solarForecast.reduce((acc, v) => acc + (Number(v) || 0), 0));
  const totalWindKwh = Math.round(windForecast.reduce((acc, v) => acc + (Number(v) || 0), 0));
  const totalRenewableKwh = totalSolarKwh + totalWindKwh;
  const totalDemandKg = Math.round(demandForecast.reduce((acc, v) => acc + (Number(v) || 0), 0));

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c68642]/15 text-[#8c5832] border border-[#c68642]/30 uppercase tracking-wide">
              Plant Telemetry & Ingestion
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8c5832]/10 text-[#7a4d2c] border border-[#8c5832]/25">
              Role: {userRole || "OPERATOR"}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                metaInfo?.dbStatus === "connected"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              DB: {metaInfo?.dbStatus === "connected" ? "Persistent MongoDB" : "Demo Engine Mode (Volatile)"}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#21150c] mt-2">
            Plant Operational Data Input & Forecast Ingestion
          </h2>
          <p className="text-xs text-[#7a6a58] mt-1 font-medium leading-relaxed max-w-3xl">
            Configure physical plant equipment ratings, instantaneous renewable capacity, and 24-hour diurnal forecasts.
            Validated data directly feeds the 24-Hour Linear Programming (LP) optimization engine.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadCsvTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#faf6f0] border border-[#d4cfc5] hover:bg-[#f4ece1] text-[#5c3a21] text-xs font-semibold transition cursor-pointer"
            title="Download formatted CSV template for 24-hour forecast"
          >
            <Download size={14} className="text-[#8c5832]" />
            <span>Download CSV Template</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#d4cfc5] hover:bg-[#faf6f0] text-[#5c3a21] text-xs font-semibold transition cursor-pointer"
          >
            <RotateCcw size={14} className="text-[#8c5832]" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Demo Mode / Persistence Warning Notice */}
      {metaInfo?.dbStatus !== "connected" && (
        <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 shadow-xs">
          <AlertTriangle className="text-amber-700 shrink-0 mt-0.5" size={18} />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Demo Engine Mode Active: </span>
            The MongoDB database is currently disconnected. Any plant inputs and optimization runs are computed and held
            in active memory for simulation and testing. To persist plant records permanently across server restarts,
            configure a running MongoDB instance in <code className="font-mono bg-amber-100/70 px-1 py-0.5 rounded">server/.env</code>.
          </div>
        </div>
      )}

      {/* VALIDATION ERROR BANNER */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 shadow-xs">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-900">Validation Error (Input Rejected)</h4>
            <ul className="text-xs text-red-700 mt-1 list-disc list-inside space-y-1">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* SUCCESS BANNER */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
          <p className="text-xs font-semibold text-emerald-800">{saveSuccessMsg}</p>
        </div>
      )}

      {/* CSV Status Message */}
      {csvStatusMsg && (
        <div className="p-3.5 bg-[#c68642]/10 border border-[#c68642]/30 rounded-2xl flex items-center gap-2.5">
          <FileSpreadsheet className="text-[#8c5832] shrink-0" size={18} />
          <p className="text-xs font-medium text-[#5c3a21]">{csvStatusMsg}</p>
        </div>
      )}

      {/* MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Physical Plant Parameters Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#e8dcce] pb-3">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-[#8c5832]" />
                <h3 className="font-extrabold text-base text-[#21150c]">Plant Equipment Specifications</h3>
              </div>
              <span className="text-[11px] font-bold text-[#8c5832] bg-[#c68642]/10 px-2 py-0.5 rounded-full">
                Physical Ratings
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Scenario Label */}
              <div>
                <label className="font-bold text-[#5c3a21] block mb-1">Scenario Run Name</label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  disabled={isViewer}
                  className="w-full px-3 py-2 bg-[#faf6f0] border border-[#d4cfc5] rounded-xl text-[#21150c] font-medium focus:outline-none focus:border-[#8c5832]"
                  placeholder="e.g. High Summer Solar Dispatch"
                />
              </div>

              {/* Instantaneous Renewable Power Ratings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#5c3a21] block mb-1">
                    Solar Generation (kW)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={solarKw}
                    onChange={(e) => setSolarKw(parseFloat(e.target.value) || 0)}
                    disabled={isViewer}
                    className="w-full px-3 py-2 bg-[#faf6f0] border border-[#d4cfc5] rounded-xl text-[#21150c] font-mono font-semibold focus:outline-none focus:border-[#8c5832]"
                  />
                  <span className="text-[10px] text-[#7a6a58]">Instantaneous active PV</span>
                </div>

                <div>
                  <label className="font-bold text-[#5c3a21] block mb-1">
                    Wind Generation (kW)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={windKw}
                    onChange={(e) => setWindKw(parseFloat(e.target.value) || 0)}
                    disabled={isViewer}
                    className="w-full px-3 py-2 bg-[#faf6f0] border border-[#d4cfc5] rounded-xl text-[#21150c] font-mono font-semibold focus:outline-none focus:border-[#8c5832]"
                  />
                  <span className="text-[10px] text-[#7a6a58]">Instantaneous wind feed</span>
                </div>
              </div>

              {/* Electrolyzer Ratings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#5c3a21] block mb-1">
                    Max Electrolyzer P (kW)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={maxElectrolyzerPower}
                    onChange={(e) => setMaxElectrolyzerPower(parseFloat(e.target.value) || 0)}
                    disabled={isViewer}
                    className="w-full px-3 py-2 bg-[#faf6f0] border border-[#d4cfc5] rounded-xl text-[#21150c] font-mono font-semibold focus:outline-none focus:border-[#8c5832]"
                  />
                  <span className="text-[10px] text-[#7a6a58]">Rated PEM stack limit (600 kW)</span>
                </div>

                <div>
                  <label className="font-bold text-[#5c3a21] block mb-1">
                    Specific Energy (kWh/kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={specificEnergyConsumption}
                    onChange={(e) => setSpecificEnergyConsumption(parseFloat(e.target.value) || 0)}
                    disabled={isViewer}
                    className="w-full px-3 py-2 bg-[#faf6f0] border border-[#d4cfc5] rounded-xl text-[#21150c] font-mono font-semibold focus:outline-none focus:border-[#8c5832]"
                  />
                  <span className="text-[10px] text-[#7a6a58]">Plant benchmark: 50 kWh/kg</span>
                </div>
              </div>

              {/* Hydrogen Storage Buffer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#5c3a21] block mb-1">
                    Current Inventory (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={initialStorageKg}
                    onChange={(e) => setInitialStorageKg(parseFloat(e.target.value) || 0)}
                    disabled={isViewer}
                    className="w-full px-3 py-2 bg-[#faf6f0] border border-[#d4cfc5] rounded-xl text-[#21150c] font-mono font-semibold focus:outline-none focus:border-[#8c5832]"
                  />
                  <span className="text-[10px] text-[#7a6a58]">Starting storage S₀</span>
                </div>

                <div>
                  <label className="font-bold text-[#5c3a21] block mb-1">
                    Tank Capacity (kg)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={maxStorageCapacityKg}
                    onChange={(e) => setMaxStorageCapacityKg(parseFloat(e.target.value) || 0)}
                    disabled={isViewer}
                    className="w-full px-3 py-2 bg-[#faf6f0] border border-[#d4cfc5] rounded-xl text-[#21150c] font-mono font-semibold focus:outline-none focus:border-[#8c5832]"
                  />
                  <span className="text-[10px] text-[#7a6a58]">Maximum capacity S_max</span>
                </div>
              </div>

              {/* Planning Horizon & Demand Baseline */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#5c3a21] block mb-1">
                    Planning Horizon (Hours)
                  </label>
                  <input
                    type="number"
                    value={planningHorizon}
                    readOnly
                    className="w-full px-3 py-2 bg-[#f0eae1] border border-[#d4cfc5] rounded-xl text-[#5c3a21] font-mono font-bold cursor-not-allowed"
                  />
                  <span className="text-[10px] text-[#7a6a58]">Fixed: 24h Diurnal Horizon</span>
                </div>

                <div>
                  <label className="font-bold text-[#5c3a21] block mb-1">
                    Uniform Demand Fill (kg/h)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={constantDemandInput}
                      onChange={(e) => setConstantDemandInput(e.target.value)}
                      disabled={isViewer}
                      className="w-full px-3 py-2 bg-[#faf6f0] border border-[#d4cfc5] rounded-xl text-[#21150c] font-mono font-semibold focus:outline-none focus:border-[#8c5832]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUniformDemand}
                      disabled={isViewer}
                      className="px-2.5 py-2 bg-[#8c5832] text-white rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer shrink-0"
                      title="Apply this constant rate across all 24 hours"
                    >
                      Fill
                    </button>
                  </div>
                  <span className="text-[10px] text-[#7a6a58]">Quick populate 24h demand</span>
                </div>
              </div>
            </div>

            {/* Quick Curve Generator Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleScaleDiurnalCurve}
                disabled={isViewer}
                className="w-full py-2.5 px-4 bg-[#faf6f0] border border-[#c68642]/40 rounded-xl text-xs font-bold text-[#8c5832] hover:bg-[#f4ece1] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Activity size={14} />
                <span>Calibrate 24h Solar & Wind Curve to Ratings</span>
              </button>
            </div>
          </div>

          {/* CSV Upload & Dropzone Card */}
          <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e8dcce] pb-3">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-[#8c5832]" />
                <h3 className="font-extrabold text-base text-[#21150c]">CSV Forecast Ingestion</h3>
              </div>
              <span className="text-[11px] font-bold text-[#8c5832] bg-[#c68642]/10 px-2 py-0.5 rounded-full">
                Hourly Feed
              </span>
            </div>

            <p className="text-xs text-[#7a6a58] leading-relaxed">
              Upload a 24-row CSV file containing hourly solar (kW), wind (kW), and hydrogen demand (kg).
              Uploaded data automatically updates the table and is validated for numeric integrity.
            </p>

            <div
              onClick={() => !isViewer && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-[#d4cfc5] hover:border-[#8c5832] bg-[#faf6f0] rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                isViewer ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <FileSpreadsheet size={32} className="text-[#8c5832]" />
              <div>
                <p className="text-xs font-bold text-[#21150c]">Click to upload or drag & drop CSV</p>
                <p className="text-[10px] text-[#7a6a58] mt-0.5">Columns: Hour, Time, Solar_kW, Wind_kW, Demand_kg</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isViewer}
                className="hidden"
              />
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-[#5c3a21] uppercase tracking-wider">Execute Workflow</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSavePlantData}
                disabled={saveLoading || isViewer}
                className="w-full py-2.5 px-3 rounded-xl border border-[#8c5832] text-[#8c5832] bg-white hover:bg-[#faf6f0] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {saveLoading ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                <span>{saveLoading ? "Validating..." : "Validate & Save"}</span>
              </button>

              <button
                onClick={handleExecuteOptimization}
                disabled={optLoading || isViewer}
                className="w-full py-2.5 px-3 rounded-xl text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #c68642 0%, #8c5832 60%, #5c3a21 100%)",
                }}
              >
                {optLoading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                <span>{optLoading ? "Solving LP..." : "Run Optimization"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 24-Hour Forecast Table & Dispatch Schedule (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tabs: Forecast Table vs Optimization Results */}
          <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e8dcce] pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("table")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    activeTab === "table"
                      ? "bg-[#8c5832] text-white border-[#8c5832] shadow-sm"
                      : "bg-[#faf6f0] text-[#5c3a21] border-[#d4cfc5] hover:bg-[#f4ece1]"
                  }`}
                >
                  24-Hour Forecast Table
                </button>
                <button
                  onClick={() => setActiveTab("results")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                    activeTab === "results"
                      ? "bg-[#8c5832] text-white border-[#8c5832] shadow-sm"
                      : "bg-[#faf6f0] text-[#5c3a21] border-[#d4cfc5] hover:bg-[#f4ece1]"
                  }`}
                >
                  <Zap size={13} />
                  <span>LP Schedule Output</span>
                  {optimizationResult && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </button>
              </div>

              {/* KPI Summary badges */}
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#7a6a58]">
                <span>Total Renewable: <strong className="text-[#21150c] font-mono">{totalRenewableKwh} kWh</strong></span>
                <span>•</span>
                <span>Demand: <strong className="text-[#21150c] font-mono">{totalDemandKg} kg</strong></span>
              </div>
            </div>

            {/* TAB 1: 24-Hour Editable Forecast Grid */}
            {activeTab === "table" && (
              <div className="space-y-3">
                <p className="text-xs text-[#7a6a58]">
                  Values in the table below are directly editable. Any manual changes dynamically update total daily energy
                  and are validated when running the Linear Program.
                </p>

                <div className="max-h-[520px] overflow-y-auto border border-[#e8dcce] rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#faf6f0] text-[#5c3a21] font-bold sticky top-0 border-b border-[#e8dcce] z-10">
                      <tr>
                        <th className="py-2.5 px-3 w-16">Hour</th>
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">Solar (kW)</th>
                        <th className="py-2.5 px-3">Wind (kW)</th>
                        <th className="py-2.5 px-3">Total (kW)</th>
                        <th className="py-2.5 px-3">Demand (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0eae1] font-mono">
                      {Array.from({ length: 24 }, (_, i) => {
                        const sVal = solarForecast[i] ?? 0;
                        const wVal = windForecast[i] ?? 0;
                        const total = Math.round((sVal + wVal) * 10) / 10;
                        const dVal = demandForecast[i] ?? 0;
                        const timeStr = `${String(i).padStart(2, "0")}:00`;

                        return (
                          <tr key={i} className="hover:bg-[#faf6f0]/70 transition-colors">
                            <td className="py-2 px-3 font-semibold text-[#8c5832]">H{i}</td>
                            <td className="py-2 px-3 text-[#5c3a21]">{timeStr}</td>
                            <td className="py-1 px-3">
                              <input
                                type="number"
                                min="0"
                                value={sVal}
                                onChange={(e) => handleUpdateHourlyCell(i, "solar", e.target.value)}
                                disabled={isViewer}
                                className="w-20 px-2 py-1 bg-white border border-[#d4cfc5] rounded-lg text-[#21150c] font-mono text-xs focus:outline-none focus:border-[#8c5832]"
                              />
                            </td>
                            <td className="py-1 px-3">
                              <input
                                type="number"
                                min="0"
                                value={wVal}
                                onChange={(e) => handleUpdateHourlyCell(i, "wind", e.target.value)}
                                disabled={isViewer}
                                className="w-20 px-2 py-1 bg-white border border-[#d4cfc5] rounded-lg text-[#21150c] font-mono text-xs focus:outline-none focus:border-[#8c5832]"
                              />
                            </td>
                            <td className="py-2 px-3 font-bold text-[#21150c]">{total}</td>
                            <td className="py-1 px-3">
                              <input
                                key={`demand-${i}-${fillKey}`}
                                type="number"
                                min="0"
                                value={dVal}
                                onChange={(e) => handleUpdateHourlyCell(i, "demand", e.target.value)}
                                disabled={isViewer}
                                className="w-20 px-2 py-1 bg-white border border-[#d4cfc5] rounded-lg text-[#21150c] font-mono text-xs focus:outline-none focus:border-[#8c5832]"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-[#faf6f0] font-bold text-xs sticky bottom-0 border-t border-[#e8dcce]">
                      <tr>
                        <td className="py-2.5 px-3" colSpan={2}>
                          24h Sum
                        </td>
                        <td className="py-2.5 px-3 text-[#8c5832] font-mono">{totalSolarKwh} kWh</td>
                        <td className="py-2.5 px-3 text-[#8c5832] font-mono">{totalWindKwh} kWh</td>
                        <td className="py-2.5 px-3 text-[#21150c] font-mono">{totalRenewableKwh} kWh</td>
                        <td className="py-2.5 px-3 text-[#8c5832] font-mono">{totalDemandKg} kg</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: Optimization Dispatch Results & Link to /optimization */}
            {activeTab === "results" && (
              <div className="space-y-4">
                {!optimizationResult ? (
                  <div className="p-8 text-center bg-[#faf6f0] border border-[#e8dcce] rounded-2xl space-y-3">
                    <Zap className="mx-auto text-[#c68642]" size={36} />
                    <h4 className="font-bold text-sm text-[#21150c]">No Optimization Results Computed Yet</h4>
                    <p className="text-xs text-[#7a6a58] max-w-md mx-auto">
                      Click the &quot;Run Optimization&quot; button to calculate the optimal 24-hour Linear Programming
                      electrolyzer dispatch schedule with your entered plant parameters.
                    </p>
                    <button
                      onClick={handleExecuteOptimization}
                      disabled={optLoading || isViewer}
                      className="px-4 py-2 bg-[#8c5832] text-white rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer shadow-sm"
                    >
                      {optLoading ? "Solving..." : "Run Optimization Now"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-[#faf6f0] border border-[#e8dcce] rounded-xl text-center">
                        <span className="text-[10px] text-[#7a6a58] block font-medium">Renewable Utilization</span>
                        <span className="text-lg font-extrabold text-[#8c5832] font-mono">
                          {optimizationResult.summaryMetrics?.optimized?.renewableUtilizationPct ?? 0}%
                        </span>
                      </div>
                      <div className="p-3 bg-[#faf6f0] border border-[#e8dcce] rounded-xl text-center">
                        <span className="text-[10px] text-[#7a6a58] block font-medium">H₂ Produced</span>
                        <span className="text-lg font-extrabold text-[#21150c] font-mono">
                          {optimizationResult.summaryMetrics?.optimized?.totalHydrogenProducedKg ?? 0} <span className="text-xs">kg</span>
                        </span>
                      </div>
                      <div className="p-3 bg-[#faf6f0] border border-[#e8dcce] rounded-xl text-center">
                        <span className="text-[10px] text-[#7a6a58] block font-medium">Unmet Demand</span>
                        <span className="text-lg font-extrabold text-emerald-700 font-mono">
                          {optimizationResult.summaryMetrics?.optimized?.totalUnmetDemandKg ?? 0} <span className="text-xs">kg</span>
                        </span>
                      </div>
                      <div className="p-3 bg-[#faf6f0] border border-[#e8dcce] rounded-xl text-center">
                        <span className="text-[10px] text-[#7a6a58] block font-medium">Final Tank Level</span>
                        <span className="text-lg font-extrabold text-[#8c5832] font-mono">
                          {optimizationResult.summaryMetrics?.optimized?.finalStorageInventoryKg ?? 0} <span className="text-xs">kg</span>
                        </span>
                      </div>
                    </div>

                    {/* Schedule Mini-Table */}
                    <div className="max-h-[380px] overflow-y-auto border border-[#e8dcce] rounded-2xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#faf6f0] text-[#5c3a21] font-bold sticky top-0 border-b border-[#e8dcce]">
                          <tr>
                            <th className="py-2.5 px-2.5">Hour</th>
                            <th className="py-2.5 px-2.5">Avail P (kW)</th>
                            <th className="py-2.5 px-2.5">Electrolyzer (kW)</th>
                            <th className="py-2.5 px-2.5">H₂ Prod (kg)</th>
                            <th className="py-2.5 px-2.5">Supplied (kg)</th>
                            <th className="py-2.5 px-2.5">Storage (kg)</th>
                            <th className="py-2.5 px-2.5">Curtailed (kW)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0eae1] font-mono">
                          {(optimizationResult.hourlyDispatchSchedule || []).map((row) => (
                            <tr key={row.hour} className="hover:bg-[#faf6f0]/70">
                              <td className="py-1.5 px-2.5 font-bold text-[#8c5832]">{row.timeLabel}</td>
                              <td className="py-1.5 px-2.5">{row.availableRenewableKw}</td>
                              <td className="py-1.5 px-2.5 font-semibold text-[#21150c]">{row.electrolyzerPowerKw}</td>
                              <td className="py-1.5 px-2.5 text-emerald-700 font-bold">{row.h2ProducedKg}</td>
                              <td className="py-1.5 px-2.5">{row.h2SuppliedKg}</td>
                              <td className="py-1.5 px-2.5 font-medium">{row.storageInventoryKg}</td>
                              <td className="py-1.5 px-2.5 text-amber-800">{row.curtailedRenewableKw}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Link to Full Optimization Page */}
                    <div className="p-4 bg-[#faf6f0] border border-[#e8dcce] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div>
                        <h5 className="font-bold text-xs text-[#21150c]">Want deep LP analytics & baseline comparison?</h5>
                        <p className="text-[11px] text-[#7a6a58] mt-0.5">
                          View interactive diurnal power curves, tank inventory evolution, and financial savings.
                        </p>
                      </div>
                      <button
                        onClick={() => navigate("/optimization")}
                        className="flex items-center gap-2 px-4 py-2 bg-[#8c5832] hover:bg-[#5c3a21] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer shrink-0"
                      >
                        <span>View Full Optimization Page</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
