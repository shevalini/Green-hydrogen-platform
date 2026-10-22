import { Droplets, Gauge, Zap, CheckCircle, Activity, ArrowUpRight, ShieldCheck } from "lucide-react";
import { getIndustrialStatusClasses } from "../utils/statusStyles";

export default function HydrogenPage({ metrics }) {
  const rate = metrics?.hydrogenProduction?.rate ?? 11.0;
  const powerKw = metrics?.electrolyzer?.powerKw ?? 550;
  const efficiency = metrics?.electrolyzer?.efficiencyPct ?? 65;
  const todayKg = metrics?.todayProduction?.currentKg ?? 142;
  const status = metrics?.electrolyzer?.status ?? "RUNNING";

  const subsystems = [
    { name: "Cathode Hydrogen Separation", status: "Nominal", temp: "68°C", pressure: "30.2 bar" },
    { name: "Anode Oxygen Venting", status: "Active", temp: "66°C", pressure: "29.8 bar" },
    { name: "Gas Drying & Purification", status: "Optimal", temp: "22°C", pressure: "28.5 bar" },
    { name: "Deionized Water Infeed", status: "Supplying", temp: "18°C", flowRate: "99.0 L/h" },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c68642]/15 text-[#aa6e40] border border-[#c68642]/30 uppercase tracking-wide">
              PEM Stack #1 Operations
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getIndustrialStatusClasses(status)}`}>
              ● {status}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#2d241d] mt-2">Hydrogen Production Operations</h2>
          <p className="text-xs text-[#7a6c5f] mt-1 font-medium leading-relaxed">
            Real-time PEM electrolyzer stack operations, current density, specific energy consumption, and high-purity gas drying.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#fbf8f4] border border-[#e8dfd5] rounded-2xl px-4 py-2.5 text-right">
            <p className="text-[11px] text-[#7a6c5f] font-medium">Generation Rate</p>
            <p className="text-2xl font-extrabold text-[#2d241d]">{rate} <span className="text-xs font-semibold text-[#8a8070]">kg/h</span></p>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6c5f]">Production Rate</span>
            <div className="p-2.5 rounded-2xl bg-[#635548]/15 text-[#635548]">
              <Droplets size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2d241d]">{rate}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kg/h</span>
          </div>
          <p className="text-xs text-[#aa6e40] mt-2 font-semibold flex items-center gap-1">
            <ArrowUpRight size={14} /> +14.2% output vs diurnal baseline
          </p>
        </div>

        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6c5f]">Cumulative Mass</span>
            <div className="p-2.5 rounded-2xl bg-[#c68642]/15 text-[#aa6e40]">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2d241d]">{todayKg}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kg H₂</span>
          </div>
          <p className="text-xs text-[#7a6c5f] mt-2 font-medium">Daily Dispatch Target: 200 kg</p>
        </div>

        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6c5f]">Electrolyzer Draw</span>
            <div className="p-2.5 rounded-2xl bg-[#f59e0b]/15 text-[#d97706]">
              <Zap size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2d241d]">{powerKw}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kW</span>
          </div>
          <p className="text-xs text-[#7a6c5f] mt-2 font-medium">Rating: 600 kW Maximum Load</p>
        </div>

        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6c5f]">Stack Efficiency</span>
            <div className="p-2.5 rounded-2xl bg-[#aa6e40]/15 text-[#aa6e40]">
              <Gauge size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2d241d]">{efficiency}</span>
            <span className="text-xs font-semibold text-[#8a8070]">%</span>
          </div>
          <p className="text-xs text-[#aa6e40] mt-2 font-semibold">Specific: ~50 kWh/kg H₂</p>
        </div>
      </div>

      {/* Production Curve & Subsystems */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-[#2d241d]">
                Diurnal Hydrogen Production Ramp
              </h3>
              <p className="text-xs text-[#7a6c5f] mt-1 font-medium">
                Output tracking solar irradiance peak and wind turbine load
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-[#c68642]/15 text-[#aa6e40] rounded-full border border-[#c68642]/30">
              Purity: &gt;99.999%
            </span>
          </div>

          <div className="h-56 flex items-end gap-2 px-1">
            {(
              metrics?.todayProduction?.hourlyTrend || [
                30, 40, 35, 50, 45, 60, 55, 70, 65, 80, 75, 90,
              ]
            ).map((height, index) => (
              <div key={index} className="flex-1 flex flex-col justify-end h-full group relative">
                <div
                  className="rounded-t-md transition-all duration-200 cursor-pointer shadow-xs"
                  style={{
                    height: `${height}%`,
                    background: "linear-gradient(180deg, #d49b55 0%, #aa6e40 70%, #635548 100%)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[11px] text-[#8a8070] mt-3 px-1 font-medium">
            <span>06:00</span>
            <span>09:00</span>
            <span>12:00</span>
            <span>15:00</span>
            <span>18:00</span>
            <span>21:00</span>
          </div>
        </div>

        {/* Quality & Safety Card */}
        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-[#aa6e40]" size={20} />
              <h3 className="font-bold text-base text-[#2d241d]">Gas Quality & Interlocks</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2.5 bg-[#fbf8f4] border border-[#e8dfd5] rounded-xl">
                <span className="text-[#7a6c5f]">Purity Standard</span>
                <span className="font-bold text-[#2d241d]">ISO 14687 Grade D (Fuel Cell)</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#fbf8f4] border border-[#e8dfd5] rounded-xl">
                <span className="text-[#7a6c5f]">Cathode Pressure</span>
                <span className="font-bold text-[#2d241d]">30.2 bar (Regulated)</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#fbf8f4] border border-[#e8dfd5] rounded-xl">
                <span className="text-[#7a6c5f]">Core Temperature</span>
                <span className="font-bold text-[#aa6e40]">68 °C (Active Chiller)</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#fbf8f4] border border-[#e8dfd5] rounded-xl">
                <span className="text-[#7a6c5f]">O₂ in H₂ Trace</span>
                <span className="font-bold text-[#10b981]">&lt; 5 ppm (Safe)</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[#fbf8f4] border border-[#e8dfd5] rounded-xl">
                <span className="text-[#7a6c5f]">DI Water Purity</span>
                <span className="font-bold text-[#2d241d]">18.2 MΩ·cm</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <CheckCircle size={15} />
            <span>Cathode & Anode interlocks nominal</span>
          </div>
        </div>
      </div>

      {/* Subsystem Telemetry Table */}
      <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-6">
        <h3 className="font-bold text-base text-[#2d241d] mb-4">Electrolyzer Subsystem Diagnostics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#635548]">
            <thead className="bg-[#fbf8f4] text-[#2d241d] font-bold border-b border-[#e8dfd5]">
              <tr>
                <th className="py-2.5 px-3">Subsystem Unit</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Core Temperature</th>
                <th className="py-2.5 px-3">Operational Parameter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f6f0e8]">
              {subsystems.map((sub, i) => (
                <tr key={i} className="hover:bg-[#fbf8f4] transition">
                  <td className="py-2.5 px-3 font-semibold text-[#2d241d]">{sub.name}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getIndustrialStatusClasses(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{sub.temp}</td>
                  <td className="py-2.5 px-3 font-mono">{sub.pressure || sub.flowRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
