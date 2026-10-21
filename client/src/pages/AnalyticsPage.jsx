import { BarChart3, TrendingUp, Leaf, DollarSign, Activity, FileSpreadsheet, Download } from "lucide-react";

export default function AnalyticsPage({ metrics, energyData, metaInfo }) {
  const todayKg = metrics?.todayProduction?.currentKg ?? 142;
  const avoidedCo2Kg = Math.round(todayKg * 10); // 10 kg CO2 avoided per kg green H2
  const totalRenewableKwh = energyData?.totalSolarKwh && energyData?.totalWindKwh
    ? energyData.totalSolarKwh + energyData.totalWindKwh
    : 8625;

  const intervals = energyData?.hourlyForecast || [];

  const handleExportCSV = () => {
    if (!intervals || intervals.length === 0) {
      alert("No telemetry forecast data currently available to export.");
      return;
    }

    const headers = [
      "Hour",
      "Time",
      "Solar_Power_kW",
      "Wind_Power_kW",
      "Combined_Renewable_kW",
      "Hydrogen_Production_kg_h",
    ];

    const rows = intervals.map((row, idx) => {
      const solar = Number(row.solarKw ?? 0);
      const wind = Number(row.windKw ?? 0);
      const total = Number(row.totalKw ?? (solar + wind));
      // Hydrogen production calculated strictly using specific consumption = 50 kWh/kg, capped at 600 kW rating
      const allocatedPower = Math.min(600, total);
      const h2Rate = Math.round((allocatedPower / 50) * 100) / 100;
      const time = row.timeLabel || row.time || `${String(idx).padStart(2, "0")}:00`;

      return [
        idx,
        `"${String(time).replace(/"/g, '""')}"`,
        solar,
        wind,
        total,
        h2Rate,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `green_h2_plant_analytics_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c68642]/15 text-[#8c5832] border border-[#c68642]/30 uppercase tracking-wide">
              Performance Intelligence
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8c5832]/10 text-[#7a4d2c] border border-[#8c5832]/25">
              {metaInfo?.isSimulated ? "Simulated Analytics" : "Telemetry Aggregation"}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#21150c] mt-2">Plant Performance & Lifecycle Analytics</h2>
          <p className="text-xs text-[#7a6a58] mt-1 font-medium leading-relaxed">
            Historical efficiency trends, greenhouse gas abatement metrics, and levelized hydrogen cost (LCOH) analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#d4cfc5] hover:bg-[#faf6f0] text-[#5c3a21] text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Download size={14} className="text-[#8c5832]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6a58]">Daily Green H₂ Yield</span>
            <div className="p-2.5 rounded-2xl bg-[#5c3a21]/15 text-[#5c3a21]">
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#21150c]">{todayKg}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kg H₂</span>
          </div>
          <p className="text-xs text-[#8c5832] mt-2 font-semibold">99.8% Renewable Share</p>
        </div>

        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6a58]">Avoided CO₂</span>
            <div className="p-2.5 rounded-2xl bg-[#8c5832]/15 text-[#8c5832]">
              <Leaf size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#21150c]">{avoidedCo2Kg}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kg CO₂e</span>
          </div>
          <p className="text-xs text-[#10b981] mt-2 font-bold">vs Steam Methane Reforming</p>
        </div>

        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6a58]">Specific Energy Cons.</span>
            <div className="p-2.5 rounded-2xl bg-[#c68642]/15 text-[#8c5832]">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#21150c]">50.0</span>
            <span className="text-xs font-semibold text-[#8a8070]">kWh/kg</span>
          </div>
          <p className="text-xs text-[#7a6a58] mt-2 font-medium">65% Stack Higher Heating Value</p>
        </div>

        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6a58]">Estimated LCOH</span>
            <div className="p-2.5 rounded-2xl bg-[#d49b55]/20 text-[#a8693a]">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#21150c]">$4.20</span>
            <span className="text-xs font-semibold text-[#8a8070]">/ kg H₂</span>
          </div>
          <p className="text-xs text-[#8c5832] mt-2 font-semibold">Optimized off-peak dispatch</p>
        </div>
      </div>

      {/* Correlation Chart */}
      <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-base text-[#21150c]">
              24-Hour Renewable Power vs. Hydrogen Output Correlation
            </h3>
            <p className="text-xs text-[#7a6a58] mt-1 font-medium">
              Electrolyzer hydrogen production dynamically tracking diurnal clean generation
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs" style={{ background: "linear-gradient(135deg, #d49b55, #8c5832)" }} />
              <span className="text-[#5c3a21]">Renewable Power (kW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-[#c68642]" />
              <span className="text-[#5c3a21]">H₂ Output Rate (kg/h)</span>
            </div>
          </div>
        </div>

        <div className="h-64 flex items-end gap-2 px-1">
          {intervals.map((item, idx) => {
            const maxP = energyData?.peakGenerationKw || 785;
            const powerPct = Math.min(100, Math.round((item.totalKw / maxP) * 100));
            const h2Pct = Math.min(100, Math.round(powerPct * 0.95));

            return (
              <div key={idx} className="flex-1 flex flex-col justify-end h-full group relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-[#21150c] text-[#faf6f0] text-[10px] py-1.5 px-2.5 rounded-lg pointer-events-none z-20 whitespace-nowrap shadow-xl border border-[#c68642]/40">
                  <span className="font-bold text-[#e5ad67]">{item.timeLabel}</span>
                  <span>Power: {item.totalKw} kW</span>
                  <span>H₂ Rate: {(item.totalKw / 50).toFixed(1)} kg/h</span>
                </div>

                <div className="w-full flex items-end justify-center gap-0.5 h-full">
                  <div
                    className="w-1/2 rounded-t-sm transition"
                    style={{
                      height: `${powerPct}%`,
                      background: "linear-gradient(180deg, #d49b55 0%, #8c5832 100%)",
                    }}
                  />
                  <div
                    className="w-1/2 rounded-t-sm transition bg-[#c68642]"
                    style={{ height: `${h2Pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between text-[11px] text-[#8a8070] mt-3 px-1 font-medium">
          {intervals
            .filter((_, i) => i % 3 === 0)
            .map((item, i) => (
              <span key={i}>{item.timeLabel}</span>
            ))}
        </div>
      </div>

      {/* Analytics Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6">
          <h3 className="font-bold text-base text-[#21150c] mb-4">
            Electrolyzer Efficiency Across Load Bands
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 bg-[#faf6f0] border border-[#e8dcce] rounded-2xl">
              <div>
                <span className="font-bold text-[#21150c]">15% - 40% Partial Load</span>
                <p className="text-[#8a8070] text-[11px]">Low solar morning & evening</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#8c5832] font-mono">68.4% HHV</span>
                <p className="text-[#8a8070] text-[11px]">47.5 kWh/kg</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#faf6f0] border border-[#e8dcce] rounded-2xl">
              <div>
                <span className="font-bold text-[#21150c]">40% - 80% Optimal Range</span>
                <p className="text-[#8a8070] text-[11px]">Design nominal operating point</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#8c5832] font-mono">65.0% HHV</span>
                <p className="text-[#8a8070] text-[11px]">50.0 kWh/kg</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-[#faf6f0] border border-[#e8dcce] rounded-2xl">
              <div>
                <span className="font-bold text-[#21150c]">80% - 100% Maximum Surge</span>
                <p className="text-[#8a8070] text-[11px]">Peak solar noon absorption</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#c68642] font-mono">62.1% HHV</span>
                <p className="text-[#8a8070] text-[11px]">52.3 kWh/kg</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#21150c] mb-1">
              Carbon Abatement Summary
            </h3>
            <p className="text-xs text-[#7a6a58] mb-4">
              Estimated lifecycle environmental benefits vs fossil SMR
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-3 bg-[#c68642]/10 border border-[#c68642]/20 rounded-2xl text-[#5c3a21]">
                <span>Avoided Diesel / SMR CO₂</span>
                <span className="font-bold font-mono">1,420 kg CO₂e / day</span>
              </div>
              <div className="flex justify-between p-3 bg-[#c68642]/10 border border-[#c68642]/20 rounded-2xl text-[#5c3a21]">
                <span>Equivalent Car KM Displaced</span>
                <span className="font-bold font-mono">11,833 km</span>
              </div>
              <div className="flex justify-between p-3 bg-[#c68642]/10 border border-[#c68642]/20 rounded-2xl text-[#5c3a21]">
                <span>Annualized Abatement Trajectory</span>
                <span className="font-bold font-mono">518 Metric Tons CO₂e</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#faf6f0] rounded-2xl border border-[#e8dcce] text-xs text-[#7a6a58]">
            Certified green hydrogen accounting compliant with EU RED II and US IRA 45V criteria.
          </div>
        </div>
      </div>
    </div>
  );
}
