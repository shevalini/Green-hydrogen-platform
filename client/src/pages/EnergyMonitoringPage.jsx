import { Sun, Wind, Zap, Activity, ArrowUpRight, Compass, Thermometer } from "lucide-react";
import { getIndustrialStatusClasses } from "../utils/statusStyles";

export default function EnergyMonitoringPage({ energyData, metrics, metaInfo }) {
  const solarKw = metrics?.solarEnergy?.value ?? energyData?.solarKw ?? 420;
  const windKw = metrics?.windEnergy?.value ?? energyData?.windKw ?? 180;
  const totalKw = solarKw + windKw;
  const peakKw = energyData?.peakGenerationKw ?? 785;
  const capacityFactor = Math.min(100, Math.round((totalKw / peakKw) * 100));
  const feedStatus = metaInfo?.isSimulated ? "Simulated Test Bench" : "Live Sensors";

  const intervals = energyData?.hourlyForecast || [];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c68642]/15 text-[#aa6e40] border border-[#c68642]/30 uppercase tracking-wide">
              Renewable Telemetry Stream
            </span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getIndustrialStatusClasses(feedStatus)}`}>
              {feedStatus}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#2d241d] mt-2">Renewable Energy Telemetry & Forecast</h2>
          <p className="text-xs text-[#7a6c5f] mt-1 font-medium leading-relaxed">
            Real-time multi-source renewable generation, solar irradiance, wind farm speed, and electrolyzer load tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#fbf8f4] border border-[#e8dfd5] rounded-2xl px-4 py-2.5 text-right">
            <p className="text-[11px] text-[#7a6c5f] font-medium">Combined Clean Output</p>
            <p className="text-xl font-extrabold text-[#2d241d]">{totalKw} kW</p>
          </div>
          <div className="bg-[#c68642]/15 border border-[#c68642]/30 rounded-2xl px-4 py-2.5 text-right">
            <p className="text-[11px] text-[#aa6e40] font-bold">Capacity Factor</p>
            <p className="text-xl font-extrabold text-[#aa6e40]">{capacityFactor}%</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6c5f]">Solar Array</span>
            <div className="p-2.5 rounded-2xl bg-[#f59e0b]/15 text-[#d97706]">
              <Sun size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2d241d]">{solarKw}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kW</span>
          </div>
          <p className="text-xs text-[#aa6e40] mt-2 flex items-center gap-1 font-semibold">
            <ArrowUpRight size={14} /> +12.4% vs diurnal morning baseline
          </p>
        </div>

        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6c5f]">Wind Turbines</span>
            <div className="p-2.5 rounded-2xl bg-[#aa6e40]/15 text-[#aa6e40]">
              <Wind size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2d241d]">{windKw}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kW</span>
          </div>
          <p className="text-xs text-[#aa6e40] mt-2 flex items-center gap-1 font-semibold">
            <ArrowUpRight size={14} /> +6.8% active gust velocity ramp
          </p>
        </div>

        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6c5f]">24h Peak Capacity</span>
            <div className="p-2.5 rounded-2xl bg-[#c68642]/15 text-[#a8693a]">
              <Zap size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2d241d]">{peakKw}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kW</span>
          </div>
          <p className="text-xs text-[#7a6c5f] mt-2 font-medium">Diurnal nameplate cap</p>
        </div>

        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6c5f]">Direct H₂ Utilization</span>
            <div className="p-2.5 rounded-2xl bg-[#635548]/15 text-[#635548]">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2d241d]">
              {metrics?.renewableTotal?.utilizationPct ?? 92.4}%
            </span>
          </div>
          <p className="text-xs text-[#10b981] mt-2 font-bold flex items-center gap-1">
            Minimal grid curtailment recorded
          </p>
        </div>
      </div>

      {/* Hourly Generation Chart */}
      <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-base text-[#2d241d]">
              Diurnal Generation Forecast: Solar vs. Wind (24h)
            </h3>
            <p className="text-xs text-[#7a6c5f] mt-1 font-medium">
              Stacked generation breakdown across diurnal hours with electrolyzer dispatch capacity
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-xs bg-[#d49b55]" />
              <span className="text-[#7a6c5f] font-medium">Solar PV</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-xs bg-[#aa6e40]" />
              <span className="text-[#7a6c5f] font-medium">Wind Turbines</span>
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
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-[#2d241d] text-[#fbf8f4] text-[10px] py-1.5 px-2.5 rounded-lg pointer-events-none z-20 whitespace-nowrap shadow-xl border border-[#c68642]/40">
                    <span className="font-bold text-[#e5ad67]">{item.time}</span>
                    <span>Total: {item.totalKw} kW</span>
                    <span className="text-[#e8dfd5]">Solar: {item.solarKw}kW | Wind: {item.windKw}kW</span>
                  </div>

                  <div className="w-full flex flex-col justify-end h-full">
                    <div
                      className="w-full rounded-t-sm transition-all duration-300"
                      style={{ height: `${solarPct}%`, background: "#d49b55" }}
                    />
                    <div
                      className="w-full transition-all duration-300"
                      style={{ height: `${windPct}%`, background: "#aa6e40" }}
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
        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#f59e0b]/15 text-[#d97706]">
              <Sun size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7a6c5f] font-bold">Solar Irradiance</p>
              <p className="text-lg font-extrabold text-[#2d241d]">842 W/m²</p>
            </div>
          </div>
          <p className="text-xs text-[#7a6c5f] mt-3 font-medium">Clear sky index: 0.94 · Panel temp: 38.2°C</p>
        </div>

        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#aa6e40]/15 text-[#aa6e40]">
              <Compass size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7a6c5f] font-bold">Anemometer Wind Speed</p>
              <p className="text-lg font-extrabold text-[#2d241d]">7.8 m/s (28 km/h)</p>
            </div>
          </div>
          <p className="text-xs text-[#7a6c5f] mt-3 font-medium">Direction: 245° WSW · Rotor RPM: 16.4</p>
        </div>

        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#635548]/15 text-[#635548]">
              <Thermometer size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7a6c5f] font-bold">Ambient Conditions</p>
              <p className="text-lg font-extrabold text-[#2d241d]">24.6°C · 48% RH</p>
            </div>
          </div>
          <p className="text-xs text-[#7a6c5f] mt-3 font-medium">Barometric pressure: 1013.2 hPa</p>
        </div>
      </div>
    </div>
  );
}
