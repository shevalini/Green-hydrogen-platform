import { BatteryCharging, Shield, Activity, ArrowDownRight, ArrowUpRight, CheckCircle2 } from "lucide-react";

export default function StoragePage({ storageData, metrics }) {
  const currentKg = storageData?.currentKg ?? 740;
  const capacityKg = storageData?.capacityKg ?? 1000;
  const availableKg = storageData?.availableKg ?? 260;
  const fillPct = storageData?.filledPercentage ?? 74;
  const pressure = storageData?.pressureBar ?? 350;
  const tankId = storageData?.tankId ?? "H2-TK-01";
  const inflowRate = metrics?.hydrogenProduction?.rate ?? 11.0;
  const outflowRate = 10.0; // Demand outflow rate
  const netRate = Math.round((inflowRate - outflowRate) * 10) / 10;
  const hoursToFull = netRate > 0 ? (availableKg / netRate).toFixed(1) : null;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c68642]/15 text-[#aa6e40] border border-[#c68642]/30 uppercase tracking-wide">
              Type IV Storage Buffer
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#aa6e40]/10 text-[#8b4e23] border border-[#aa6e40]/25">
              Unit: {tankId}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#2d241d] mt-2">Hydrogen Storage Inventory & Buffer</h2>
          <p className="text-xs text-[#7a6c5f] mt-1 font-medium leading-relaxed">
            Composite pressurized storage telemetry, mass flow rate tracking, and pipeline buffer inventory management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#c68642]/15 border border-[#c68642]/30 rounded-2xl px-4 py-2.5 text-right">
            <p className="text-[11px] text-[#aa6e40] font-bold">Tank Fill Level</p>
            <p className="text-2xl font-extrabold text-[#aa6e40]">{fillPct}%</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6c5f]">Current Stored Mass</span>
            <div className="p-2.5 rounded-2xl bg-[#c68642]/15 text-[#aa6e40]">
              <BatteryCharging size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2d241d]">{currentKg}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kg</span>
          </div>
          <p className="text-xs text-[#7a6c5f] mt-2 font-medium">Of {capacityKg} kg Max Rating</p>
        </div>

        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6c5f]">Ullage (Available)</span>
            <div className="p-2.5 rounded-2xl bg-[#635548]/15 text-[#635548]">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2d241d]">{availableKg}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kg buffer</span>
          </div>
          <p className="text-xs text-[#aa6e40] mt-2 font-semibold">Ready to absorb peak solar</p>
        </div>

        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6c5f]">Operating Pressure</span>
            <div className="p-2.5 rounded-2xl bg-[#aa6e40]/15 text-[#aa6e40]">
              <Shield size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2d241d]">{pressure}</span>
            <span className="text-xs font-semibold text-[#8a8070]">bar</span>
          </div>
          <p className="text-xs text-[#7a6c5f] mt-2 font-medium">Rated: 380 bar Design Limit</p>
        </div>

        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6c5f]">Net Mass Accumulation</span>
            <div className="p-2.5 rounded-2xl bg-[#d49b55]/20 text-[#a8693a]">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2d241d]">+{netRate}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kg/h</span>
          </div>
          <p className="text-xs text-[#10b981] mt-2 font-bold">Inflow &gt; Offtake (Charging)</p>
        </div>
      </div>

      {/* Main Tank View & Mass Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tank Graphic */}
        <div className="bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-6 flex flex-col items-center justify-center">
          <h3 className="font-bold text-base text-[#2d241d] mb-6 self-start">
            Tank Level Visualization
          </h3>

          <div className="relative w-44 h-60 border-4 border-[#aa6e40]/30 rounded-3xl overflow-hidden bg-[#fbf8f4] shadow-inner">
            <div
              className="absolute bottom-0 left-0 right-0 transition-all duration-700 shadow-lg"
              style={{
                height: `${fillPct}%`,
                background: "linear-gradient(180deg, #d49b55 0%, #aa6e40 50%, #635548 100%)",
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-[#fbf8f4]/90 backdrop-blur-sm px-5 py-3 rounded-2xl border border-[#e8dfd5]/50 shadow-xs">
                <p className="text-4xl font-extrabold text-[#2d241d] tracking-tight">{fillPct}%</p>
                <p className="text-[11px] font-bold text-[#aa6e40] uppercase tracking-wider mt-0.5">Stored Capacity</p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-[#7a6c5f]">
            <p className="font-bold text-[#2d241d]">{currentKg} kg Stored</p>
            <p className="text-[#8a8070] mt-0.5">Remaining Buffer: {availableKg} kg</p>
          </div>
        </div>

        {/* Mass Balance & Safety Instrumentation */}
        <div className="lg:col-span-2 bg-white border border-[#e8dfd5] shadow-sm rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#2d241d] mb-4">
              Real-Time Mass Flow Balance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-[#fbf8f4] border border-[#e8dfd5]">
                <div className="flex items-center gap-1.5 text-[#aa6e40] text-xs font-bold">
                  <ArrowUpRight size={16} />
                  <span>Inflow (Stack #1)</span>
                </div>
                <p className="text-2xl font-extrabold text-[#2d241d] mt-2">+{inflowRate} <span className="text-xs font-normal">kg/h</span></p>
                <p className="text-[10px] text-[#7a6c5f] mt-1">Multi-stage diaphragm pump</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#fbf8f4] border border-[#e8dfd5]">
                <div className="flex items-center gap-1.5 text-[#635548] text-xs font-bold">
                  <ArrowDownRight size={16} />
                  <span>Outflow (Off-Taker)</span>
                </div>
                <p className="text-2xl font-extrabold text-[#2d241d] mt-2">-{outflowRate} <span className="text-xs font-normal">kg/h</span></p>
                <p className="text-[10px] text-[#7a6c5f] mt-1">Pipeline & Tube Trailer Depot</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#c68642]/10 border border-[#c68642]/25">
                <div className="flex items-center gap-1.5 text-[#aa6e40] text-xs font-bold">
                  <Activity size={16} />
                  <span>Net Accumulation</span>
                </div>
                <p className="text-2xl font-extrabold text-[#aa6e40] mt-2">+{netRate} <span className="text-xs font-normal">kg/h</span></p>
                <p className="text-[10px] text-[#aa6e40] mt-1">{hoursToFull ? `Buffer full in ~${hoursToFull} hrs` : "Stable inventory"}</p>
              </div>
            </div>

            <h4 className="font-bold text-xs text-[#2d241d] uppercase tracking-wider mb-3">
              Valves & Safety Instrumentation Checks
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-3 bg-[#fbf8f4] border border-[#e8dfd5] rounded-xl">
                <span className="font-medium text-[#7a6c5f]">Internal Tank Temperature</span>
                <span className="font-mono text-[#2d241d] font-bold">21.4 °C (Normal)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#fbf8f4] border border-[#e8dfd5] rounded-xl">
                <span className="font-medium text-[#7a6c5f]">Pressure Relief Valve (PRV-350)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/15 text-[#059669]">Arm-Ready</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#fbf8f4] border border-[#e8dfd5] rounded-xl">
                <span className="font-medium text-[#7a6c5f]">Combustible H₂ Gas Sniffers</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/15 text-[#059669]">0.00% LEL (Safe)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3.5 bg-[#c68642]/10 border border-[#c68642]/25 rounded-2xl text-xs text-[#aa6e40] flex items-center justify-between">
            <span className="font-semibold">Buffer Status: Sufficient to supply 74 continuous hours at base off-take</span>
            <CheckCircle2 size={16} className="text-[#aa6e40]" />
          </div>
        </div>
      </div>
    </div>
  );
}
