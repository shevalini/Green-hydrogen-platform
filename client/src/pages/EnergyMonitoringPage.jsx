import { Sun, Wind, Zap, Activity, Gauge, ArrowUpRight, Compass, Thermometer } from "lucide-react";

export default function EnergyMonitoringPage({ energyData, metrics, metaInfo }) {
  const solarKw = metrics?.solarEnergy?.value ?? energyData?.solarKw ?? 420;
  const windKw = metrics?.windEnergy?.value ?? energyData?.windKw ?? 180;
  const totalKw = solarKw + windKw;
  const peakKw = energyData?.peakGenerationKw ?? 785;
  const capacityFactor = Math.min(100, Math.round((totalKw / peakKw) * 100));

  const intervals = energyData?.hourlyForecast || [];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c68642]/15 text-[#8c5832] border border-[#c68642]/30 uppercase tracking-wide">
              Renewable Telemetry Stream
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8c5832]/10 text-[#7a4d2c] border border-[#8c5832]/25">
              {metaInfo?.isSimulated ? "Simulated Test Bench" : "Live Sensors"}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#21150c] mt-2">Renewable Energy Telemetry & Forecast</h2>
          <p className="text-xs text-[#7a6a58] mt-1 font-medium leading-relaxed">
            Real-time multi-source renewable generation, solar irradiance, wind farm speed, and electrolyzer load tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#faf6f0] border border-[#e8dcce] rounded-2xl px-4 py-2.5 text-right">
            <p className="text-[11px] text-[#7a6a58] font-medium">Combined Clean Output</p>
            <p className="text-xl font-extrabold text-[#21150c]">{totalKw} kW</p>
          </div>
          <div className="bg-[#c68642]/15 border border-[#c68642]/30 rounded-2xl px-4 py-2.5 text-right">
            <p className="text-[11px] text-[#8c5832] font-bold">Capacity Factor</p>
            <p className="text-xl font-extrabold text-[#8c5832]">{capacityFactor}%</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6a58]">Solar Array</span>
            <div className="p-2.5 rounded-2xl bg-[#f59e0b]/15 text-[#d97706]">
              <Sun size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#21150c]">{solarKw}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kW</span>
          </div>
          <p className="text-xs text-[#8c5832] mt-2 flex items-center gap-1 font-semibold">
            <ArrowUpRight size={14} /> +12.4% vs diurnal morning baseline
          </p>
        </div>

        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6a58]">Wind Turbines</span>
            <div className="p-2.5 rounded-2xl bg-[#8c5832]/15 text-[#8c5832]">
              <Wind size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#21150c]">{windKw}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kW</span>
          </div>
          <p className="text-xs text-[#8c5832] mt-2 flex items-center gap-1 font-semibold">
            <ArrowUpRight size={14} /> +6.8% active gust velocity ramp
          </p>
        </div>

        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6a58]">24h Peak Capacity</span>
            <div className="p-2.5 rounded-2xl bg-[#c68642]/15 text-[#a8693a]">
              <Zap size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#21150c]">{peakKw}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kW</span>
          </div>
          <p className="text-xs text-[#7a6a58] mt-2 font-medium">Diurnal nameplate cap</p>
        </div>

        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6a58]">Direct H₂ Utilization</span>
            <div className="p-2.5 rounded-2xl bg-[#5c3a21]/15 text-[#5c3a21]">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#21150c]">
              {metrics?.renewableTotal?.utilizationPct ?? 92.4}%
            </span>
          </div>
          <p className="text-xs text-[#10b981] mt-2 font-bold flex items-center gap-1">
            Minimal grid curtailment recorded
          </p>
        </div>
      </div>

      {/* Hourly Generation Chart */}
      <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-base text-[#21150c]">
              Diurnal Generation Forecast: Solar vs. Wind (24h)
            </h3>
            <p className="text-xs text-[#7a6a58] mt-1 font-medium">
              Stacked generation breakdown across diurnal hours with electrolyzer dispatch capacity
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-xs bg-[#d49b55]" />
              <span className="text-[#7a6a58] font-medium">Solar PV</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-xs bg-[#8c5832]" />
              <span className="text-[#7a6a58] font-medium">Wind Turbines</span>
            </div>
          </div>
        </div>

        {intervals.length > 0 ? (
          <div className="h-64 flex items-end gap-2 px-1 pt-4">
            {intervals.map((item, idx) => {
              const maxKw = peakKw || 785;
              const solarPct = Math.min(100, Math.round((item.solarKw / maxKw) * 100));
              const windPct = Math.min(100, Math.round((item.windKw / maxKw) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col justify-end h-full group relative">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-[#21150c] text-[#faf6f0] text-[10px] py-1.5 px-2.5 rounded-lg pointer-events-none z-20 whitespace-nowrap shadow-xl border border-[#c68642]/40">
                    <span className="font-bold text-[#e5ad67]">{item.time}</span>
                    <span>Total: {item.totalKw} kW</span>
                    <span className="text-[#d4cfc5]">Solar: {item.solarKw}kW | Wind: {item.windKw}kW</span>
                  </div>

                  <div className="w-full flex flex-col justify-end h-full">
                    <div
                      className="w-full rounded-t-sm transition-all duration-300"
                      style={{ height: `${solarPct}%`, background: "#d49b55" }}
                    />
                    <div
                      className="w-full transition-all duration-300"
                      style={{ height: `${windPct}%`, background: "#8c5832" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-[#8a8070] text-xs">
            Forecast telemetry loading…
          </div>
        )}

        <div className="flex justify-between text-[11px] text-[#8a8070] mt-3 px-1 font-medium">
          {intervals.filter((_, i) => i % 4 === 0).map((item, i) => (
            <span key={i}>{item.time}</span>
          ))}
        </div>
      </div>

      {/* Environmental & Meteorological Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#f59e0b]/15 text-[#d97706]">
              <Sun size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7a6a58] font-bold">Solar Irradiance</p>
              <p className="text-lg font-extrabold text-[#21150c]">842 W/m²</p>
            </div>
          </div>
          <p className="text-xs text-[#7a6a58] mt-3 font-medium">Clear sky index: 0.94 · Panel temp: 38.2°C</p>
        </div>

        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#8c5832]/15 text-[#8c5832]">
              <Compass size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7a6a58] font-bold">Anemometer Wind Speed</p>
              <p className="text-lg font-extrabold text-[#21150c]">7.8 m/s (28 km/h)</p>
            </div>
          </div>
          <p className="text-xs text-[#7a6a58] mt-3 font-medium">Direction: 245° WSW · Rotor RPM: 16.4</p>
        </div>

        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#5c3a21]/15 text-[#5c3a21]">
              <Thermometer size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7a6a58] font-bold">Ambient Conditions</p>
              <p className="text-lg font-extrabold text-[#21150c]">24.6°C · 48% RH</p>
            </div>
          </div>
          <p className="text-xs text-[#7a6a58] mt-3 font-medium">Barometric pressure: 1013.2 hPa</p>
        </div>
      </div>
    </div>
  );
}
