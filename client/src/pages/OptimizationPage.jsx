import { useState } from "react";
import {
  Zap,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Droplets,
  Sliders,
} from "lucide-react";

export default function OptimizationPage({
  optimizationResult,
  loading,
  error,
  selectedPreset,
  onRunPreset,
  onReRun,
}) {
  const [activeOptChart, setActiveOptChart] = useState("power"); // "power" | "storage"

  const presets = [
    { key: "standard", label: "Standard 24h Profile" },
    { key: "highRenewables", label: "High Renewable Availability" },
    { key: "lowRenewables", label: "Low Renewable Drought" },
    { key: "constrainedStorage", label: "Constrained Tank (100 kg)" },
    { key: "zeroGen", label: "Zero Generation Stress Test" },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Optimization Header Controls */}
      <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c68642]/15 text-[#aa6e40] border border-[#c68642]/30 uppercase tracking-wide">
              LP Optimization Engine
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#aa6e40]/10 text-[#8b4e23] border border-[#aa6e40]/25">
              24-Hour Horizon Dispatch
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#2d241d] mt-2">
            Hydrogen Production & Storage Optimizer
          </h2>
          <p className="text-xs text-[#7a6c5f] mt-1 font-medium leading-relaxed max-w-2xl">
            Solves a 24-hour Linear Program (LP) to maximize renewable power allocation, prevent unmet hydrogen demand, and protect storage inventory limits.
          </p>
        </div>

        {/* Scenario Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((item) => {
            const isSelected = selectedPreset === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onRunPreset(item.key)}
                disabled={loading}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                  isSelected
                    ? "bg-[#aa6e40] text-white border-[#aa6e40] shadow-sm"
                    : "bg-[#fbf8f4] text-[#635548] border-[#e8dfd5] hover:bg-[#f6f0e8]"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <button
            onClick={onReRun}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md hover:brightness-110 active:scale-[0.99] border"
            style={{
              background: "linear-gradient(135deg, #c68642 0%, #aa6e40 60%, #635548 100%)",
              borderColor: "rgba(229, 173, 103, 0.35)",
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#fbf8f4]" : ""} />
            <span>{loading ? "Solving LP..." : "Re-Run Optimization"}</span>
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 shadow-xs">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-red-900">Optimization Calculation Error</h4>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* COMPARISON METRIC CARDS */}
      {optimizationResult?.summaryMetrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* 1. Renewable Utilization */}
          <div className="bg-white border border-[#e8dfd5] rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#7a6c5f]">Renewable Utilization</p>
              <div className="p-2 rounded-2xl bg-[#c68642]/15 text-[#aa6e40]">
                <Zap size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#2d241d]">
                {optimizationResult.summaryMetrics.optimized.renewableUtilizationPct}%
              </span>
              <span className="text-xs text-[#8a8070]">
                vs {optimizationResult.summaryMetrics.baseline.renewableUtilizationPct}% baseline
              </span>
            </div>
            <div className="mt-2 text-xs font-bold text-[#10b981] flex items-center gap-1">
              <TrendingUp size={14} />
              <span>
                {optimizationResult.summaryMetrics.comparison.renewableUtilizationImprovementPct >= 0
                  ? `+${optimizationResult.summaryMetrics.comparison.renewableUtilizationImprovementPct}% improvement`
                  : `${optimizationResult.summaryMetrics.comparison.renewableUtilizationImprovementPct}% delta`}
              </span>
            </div>
          </div>

          {/* 2. Unmet Demand */}
          <div className="bg-white border border-[#e8dfd5] rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#7a6c5f]">Unmet Demand</p>
              <div className="p-2 rounded-2xl bg-[#aa6e40]/15 text-[#aa6e40]">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#2d241d]">
                {optimizationResult.summaryMetrics.optimized.totalUnmetDemandKg}{" "}
                <span className="text-xs font-semibold text-[#8a8070]">kg</span>
              </span>
            </div>
            <p className="mt-2 text-xs text-[#7a6c5f]">
              Supplied:{" "}
              <span className="font-bold text-[#2d241d]">
                {optimizationResult.summaryMetrics.optimized.totalDemandSuppliedKg}
              </span>{" "}
              / {optimizationResult.summaryMetrics.optimized.totalDemandKg} kg total
            </p>
          </div>

          {/* 3. Hydrogen Produced */}
          <div className="bg-white border border-[#e8dfd5] rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#7a6c5f]">Hydrogen Output</p>
              <div className="p-2 rounded-2xl bg-[#635548]/15 text-[#635548]">
                <Droplets size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#2d241d]">
                {optimizationResult.summaryMetrics.optimized.totalHydrogenProducedKg}
              </span>
              <span className="text-xs font-semibold text-[#8a8070]">kg H₂</span>
            </div>
            <p className="mt-2 text-xs text-[#7a6c5f]">
              Final Storage:{" "}
              <span className="font-bold text-[#aa6e40]">
                {optimizationResult.summaryMetrics.optimized.finalStorageInventoryKg} kg
              </span>
            </p>
          </div>

          {/* 4. Operational Cost */}
          <div className="bg-white border border-[#e8dfd5] rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-[#7a6c5f]">Operational Cost</p>
              <div className="p-2 rounded-2xl bg-[#d49b55]/20 text-[#a8693a]">
                <Sliders size={18} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#2d241d]">
                ${optimizationResult.summaryMetrics.optimized.totalCost}
              </span>
              <span className="text-xs text-[#8a8070]">
                base: ${optimizationResult.summaryMetrics.baseline.totalCost}
              </span>
            </div>
            <p className="mt-2 text-xs text-[#aa6e40] font-semibold">
              {optimizationResult.summaryMetrics.comparison.costSavings > 0
                ? `Saved $${optimizationResult.summaryMetrics.comparison.costSavings} via peak tariff lookahead`
                : `Curtailed energy: ${optimizationResult.summaryMetrics.optimized.totalCurtailedKwh} kWh`}
            </p>
          </div>
        </div>
      )}

      {/* RECOMMENDATION BANNER */}
      {optimizationResult?.recommendation && (
        <div
          className="p-5 rounded-3xl flex items-center justify-between gap-4 border text-[#fbf8f4] shadow-md"
          style={{
            background: "linear-gradient(135deg, #2b1d14 0%, #3d281a 60%, #1a110a 100%)",
            borderColor: "rgba(198, 134, 66, 0.3)",
          }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
              style={{
                background: "linear-gradient(135deg, #c68642, #aa6e40)",
                borderColor: "rgba(229, 173, 103, 0.4)",
              }}
            >
              <Zap size={20} className="text-[#fbf8f4]" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#e5ad67]">
                Optimal Dispatch Strategy Recommendation
              </h4>
              <p className="text-xs text-[#e8dfd5] mt-1 leading-relaxed">{optimizationResult.recommendation}</p>
            </div>
          </div>

          <div className="hidden sm:block text-right shrink-0">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl border"
                  style={{
                    background: "rgba(198, 134, 66, 0.15)",
                    borderColor: "rgba(198, 134, 66, 0.35)",
                    color: "#e5ad67",
                  }}>
              LP Solved: {optimizationResult.status}
            </span>
          </div>
        </div>
      )}

      {/* COMPARISON VISUALIZATIONS */}
      <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-base text-[#2d241d]">
              24-Hour Horizon: Optimized (LP) vs. Baseline
            </h3>
            <p className="text-xs text-[#7a6c5f] mt-1 font-medium">
              {activeOptChart === "power"
                ? "Hourly electrolyzer power allocation (kW) against diurnal renewable availability"
                : "Hourly hydrogen storage tank inventory trajectory (kg) within capacity boundaries"}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#fbf8f4] p-1.5 rounded-2xl border border-[#e8dfd5] self-start sm:self-auto">
            <button
              onClick={() => setActiveOptChart("power")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeOptChart === "power"
                  ? "bg-[#aa6e40] text-white shadow-xs"
                  : "text-[#7a6c5f] hover:text-[#2d241d]"
              }`}
            >
              Power Allocation (kW)
            </button>
            <button
              onClick={() => setActiveOptChart("storage")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeOptChart === "storage"
                  ? "bg-[#aa6e40] text-white shadow-xs"
                  : "text-[#7a6c5f] hover:text-[#2d241d]"
              }`}
            >
              Storage Trajectory (kg)
            </button>
          </div>
        </div>

        {/* Chart: Power Allocation */}
        {activeOptChart === "power" && optimizationResult?.hourlyDispatchSchedule && (
          <div>
            <div className="h-64 flex items-end gap-2 px-1">
              {optimizationResult.hourlyDispatchSchedule.map((item, idx) => {
                const maxP = 785;
                const optHeight = Math.min(100, Math.round((item.electrolyzerPowerKw / maxP) * 100));
                const baseItem = optimizationResult.baselineSchedule?.[idx];
                const baseHeight = baseItem
                  ? Math.min(100, Math.round((baseItem.electrolyzerPowerKw / maxP) * 100))
                  : 0;

                return (
                  <div key={idx} className="flex-1 flex flex-col justify-end h-full group relative">
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-[#2d241d] text-[#fbf8f4] text-[10px] py-1.5 px-2.5 rounded-lg pointer-events-none z-20 whitespace-nowrap shadow-xl border border-[#c68642]/40">
                      <span className="font-bold text-[#e5ad67]">{item.timeLabel}</span>
                      <span>Optimized: {item.electrolyzerPowerKw} kW</span>
                      <span>Baseline: {baseItem?.electrolyzerPowerKw ?? 0} kW</span>
                      <span className="text-[#b0a898]">Renewables: {item.availableRenewableKw} kW</span>
                    </div>

                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      <div
                        className="w-1/2 bg-[#e8dfd5] rounded-t-sm hover:bg-[#b0a898] transition"
                        style={{ height: `${baseHeight}%` }}
                      />
                      <div
                        className="w-1/2 rounded-t-sm transition"
                        style={{
                          height: `${optHeight}%`,
                          background: "linear-gradient(180deg, #d49b55 0%, #aa6e40 100%)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[11px] text-[#8a8070] mt-3 px-1 font-medium">
              {optimizationResult.hourlyDispatchSchedule
                .filter((_, i) => i % 3 === 0)
                .map((item, i) => (
                  <span key={i}>{item.timeLabel}</span>
                ))}
            </div>

            <div className="flex items-center gap-6 mt-4 pt-3 border-t border-[#f6f0e8] text-xs text-[#7a6c5f]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-xs" style={{ background: "linear-gradient(135deg, #d49b55, #aa6e40)" }} />
                <span className="font-medium">Optimized Electrolyzer Dispatch (LP)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#e8dfd5] rounded-xs" />
                <span className="font-medium">Baseline Myopic Schedule</span>
              </div>
            </div>
          </div>
        )}

        {/* Chart: Storage Trajectory */}
        {activeOptChart === "storage" && optimizationResult?.hourlyDispatchSchedule && (
          <div>
            <div className="h-64 flex items-end gap-2 px-1">
              {optimizationResult.hourlyDispatchSchedule.map((item, idx) => {
                const cap = optimizationResult.inputParameters?.maxStorageCapacityKg || 1000;
                const optPct = Math.min(100, Math.round((item.storageInventoryKg / cap) * 100));
                const baseItem = optimizationResult.baselineSchedule?.[idx];
                const basePct = baseItem
                  ? Math.min(100, Math.round((baseItem.storageInventoryKg / cap) * 100))
                  : 0;

                return (
                  <div key={idx} className="flex-1 flex flex-col justify-end h-full group relative">
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-[#2d241d] text-[#fbf8f4] text-[10px] py-1.5 px-2.5 rounded-lg pointer-events-none z-20 whitespace-nowrap shadow-xl border border-[#c68642]/40">
                      <span className="font-bold text-[#e5ad67]">{item.timeLabel}</span>
                      <span>Opt Storage: {item.storageInventoryKg} kg</span>
                      <span className="text-[#b0a898]">Base Storage: {baseItem?.storageInventoryKg ?? 0} kg</span>
                    </div>

                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      <div
                        className="w-1/2 bg-[#e8dfd5] rounded-t-sm hover:bg-[#b0a898] transition"
                        style={{ height: `${basePct}%` }}
                      />
                      <div
                        className="w-1/2 rounded-t-sm transition"
                        style={{
                          height: `${optPct}%`,
                          background: "linear-gradient(180deg, #c68642 0%, #635548 100%)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between text-[11px] text-[#8a8070] mt-3 px-1 font-medium">
              {optimizationResult.hourlyDispatchSchedule
                .filter((_, i) => i % 3 === 0)
                .map((item, i) => (
                  <span key={i}>{item.timeLabel}</span>
                ))}
            </div>

            <div className="flex items-center gap-6 mt-4 pt-3 border-t border-[#f6f0e8] text-xs text-[#7a6c5f]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-xs" style={{ background: "linear-gradient(135deg, #c68642, #635548)" }} />
                <span className="font-medium">Optimized Tank Inventory (kg)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#e8dfd5] rounded-xs" />
                <span className="font-medium">Baseline Tank Inventory (kg)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED HOURLY DISPATCH TABLE */}
      <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-[#2d241d]">
            24-Hour Dispatch & Mass Flow Telemetry
          </h3>
          <span className="text-xs text-[#8a8070] font-medium">
            Enforces 600 kW load rating & 1000 kg tank boundaries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#635548]">
            <thead className="bg-[#fbf8f4] text-[#2d241d] font-bold border-b border-[#e8dfd5]">
              <tr>
                <th className="py-2.5 px-3">Hour</th>
                <th className="py-2.5 px-3">Solar (kW)</th>
                <th className="py-2.5 px-3">Wind (kW)</th>
                <th className="py-2.5 px-3">Renewable (kW)</th>
                <th className="py-2.5 px-3 text-[#aa6e40]">Electrolyzer (kW)</th>
                <th className="py-2.5 px-3">H₂ Output (kg)</th>
                <th className="py-2.5 px-3">Demand (kg)</th>
                <th className="py-2.5 px-3">Supplied (kg)</th>
                <th className="py-2.5 px-3">Unmet (kg)</th>
                <th className="py-2.5 px-3">Curtailed (kW)</th>
                <th className="py-2.5 px-3 text-[#c68642] font-bold">Storage (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f6f0e8] font-mono text-[11px]">
              {optimizationResult?.hourlyDispatchSchedule?.map((row, i) => (
                <tr key={i} className="hover:bg-[#fbf8f4] transition">
                  <td className="py-2 px-3 font-bold text-[#2d241d]">{row.timeLabel}</td>
                  <td className="py-2 px-3">{row.solarKw}</td>
                  <td className="py-2 px-3">{row.windKw}</td>
                  <td className="py-2 px-3 font-semibold text-[#635548]">{row.availableRenewableKw}</td>
                  <td className="py-2 px-3 font-bold text-[#aa6e40]">{row.electrolyzerPowerKw}</td>
                  <td className="py-2 px-3">{row.h2ProducedKg}</td>
                  <td className="py-2 px-3">{row.demandKg}</td>
                  <td className="py-2 px-3 text-[#2d241d]">{row.h2SuppliedKg}</td>
                  <td className={`py-2 px-3 ${row.unmetDemandKg > 0 ? "text-red-600 font-bold" : "text-[#8a8070]"}`}>
                    {row.unmetDemandKg}
                  </td>
                  <td className={`py-2 px-3 ${row.curtailedRenewableKw > 0 ? "text-[#c68642] font-medium" : "text-[#8a8070]"}`}>
                    {row.curtailedRenewableKw}
                  </td>
                  <td className="py-2 px-3 font-bold text-[#c68642]">{row.storageInventoryKg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
