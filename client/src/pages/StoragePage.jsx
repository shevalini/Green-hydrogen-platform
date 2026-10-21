import { BatteryCharging, Shield, Activity, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertTriangle } from "lucide-react";

export default function StoragePage({ storageData, metrics, metaInfo }) {
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
      <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#c68642]/15 text-[#8c5832] border border-[#c68642]/30 uppercase tracking-wide">
              Type IV Storage Buffer
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8c5832]/10 text-[#7a4d2c] border border-[#8c5832]/25">
              Unit: {tankId}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#21150c] mt-2">Hydrogen Storage Inventory & Buffer</h2>
          <p className="text-xs text-[#7a6a58] mt-1 font-medium leading-relaxed">
            Composite pressurized storage telemetry, mass flow rate tracking, and pipeline buffer inventory management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#c68642]/15 border border-[#c68642]/30 rounded-2xl px-4 py-2.5 text-right">
            <p className="text-[11px] text-[#8c5832] font-bold">Tank Fill Level</p>
            <p className="text-2xl font-extrabold text-[#8c5832]">{fillPct}%</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6a58]">Current Stored Mass</span>
            <div className="p-2.5 rounded-2xl bg-[#c68642]/15 text-[#8c5832]">
              <BatteryCharging size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#21150c]">{currentKg}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kg</span>
          </div>
          <p className="text-xs text-[#7a6a58] mt-2 font-medium">Of {capacityKg} kg Max Rating</p>
        </div>

        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6a58]">Ullage (Available)</span>
            <div className="p-2.5 rounded-2xl bg-[#5c3a21]/15 text-[#5c3a21]">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#21150c]">{availableKg}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kg buffer</span>
          </div>
          <p className="text-xs text-[#8c5832] mt-2 font-semibold">Ready to absorb peak solar</p>
        </div>

        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6a58]">Operating Pressure</span>
            <div className="p-2.5 rounded-2xl bg-[#8c5832]/15 text-[#8c5832]">
              <Shield size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#21150c]">{pressure}</span>
            <span className="text-xs font-semibold text-[#8a8070]">bar</span>
          </div>
          <p className="text-xs text-[#7a6a58] mt-2 font-medium">Rated: 380 bar Design Limit</p>
        </div>

        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7a6a58]">Net Mass Accumulation</span>
            <div className="p-2.5 rounded-2xl bg-[#d49b55]/20 text-[#a8693a]">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#21150c]">+{netRate}</span>
            <span className="text-xs font-semibold text-[#8a8070]">kg/h</span>
          </div>
          <p className="text-xs text-[#10b981] mt-2 font-bold">Inflow &gt; Offtake (Charging)</p>
        </div>
      </div>

      {/* Main Tank View & Mass Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tank Graphic */}
        <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6 flex flex-col items-center justify-center">
          <h3 className="font-bold text-base text-[#21150c] mb-6 self-start">
            Tank Level Visualization
          </h3>

          <div className="relative w-44 h-60 border-4 border-[#8c5832]/30 rounded-3xl overflow-hidden bg-[#faf6f0] shadow-inner">
            <div
              className="absolute bottom-0 left-0 right-0 transition-all duration-700 shadow-lg"
              style={{
                height: `${fillPct}%`,
                background: "linear-gradient(180deg, #d49b55 0%, #8c5832 50%, #5c3a21 100%)",
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-[#faf6f0]/90 backdrop-blur-sm px-5 py-3 rounded-2xl border border-[#d4cfc5]/50 shadow-xs">
                <p className="text-4xl font-extrabold text-[#21150c] tracking-tight">{fillPct}%</p>
                <p className="text-[11px] font-bold text-[#8c5832] uppercase tracking-wider mt-0.5">Stored Capacity</p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-[#7a6a58]">
            <p className="font-bold text-[#21150c]">{currentKg} kg Stored</p>
            <p className="text-[#8a8070] mt-0.5">Remaining Buffer: {availableKg} kg</p>
          </div>
        </div>

        {/* Mass Balance & Safety Instrumentation */}
        <div className="lg:col-span-2 bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#21150c] mb-4">
              Real-Time Mass Flow Balance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#e8dcce]">
                <div className="flex items-center gap-1.5 text-[#8c5832] text-xs font-bold">
                  <ArrowUpRight size={16} />
                  <span>Inflow (Stack #1)</span>
                </div>
                <p className="text-2xl font-extrabold text-[#21150c] mt-2">+{inflowRate} <span className="text-xs font-normal">kg/h</span></p>
                <p className="text-[10px] text-[#7a6a58] mt-1">Multi-stage diaphragm pump</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#e8dcce]">
                <div className="flex items-center gap-1.5 text-[#5c3a21] text-xs font-bold">
                  <ArrowDownRight size={16} />
                  <span>Outflow (Off-Taker)</span>
                </div>
                <p className="text-2xl font-extrabold text-[#21150c] mt-2">-{outflowRate} <span className="text-xs font-normal">kg/h</span></p>
                <p className="text-[10px] text-[#7a6a58] mt-1">Pipeline & Tube Trailer Depot</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#c68642]/10 border border-[#c68642]/25">
                <div className="flex items-center gap-1.5 text-[#8c5832] text-xs font-bold">
                  <Activity size={16} />
                  <span>Net Accumulation</span>
                </div>
                <p className="text-2xl font-extrabold text-[#8c5832] mt-2">+{netRate} <span className="text-xs font-normal">kg/h</span></p>
                <p className="text-[10px] text-[#8c5832] mt-1">{hoursToFull ? `Buffer full in ~${hoursToFull} hrs` : "Stable inventory"}</p>
              </div>
            </div>

            <h4 className="font-bold text-xs text-[#21150c] uppercase tracking-wider mb-3">
              Valves & Safety Instrumentation Checks
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-3 bg-[#faf6f0] border border-[#e8dcce] rounded-xl">
                <span className="font-medium text-[#7a6a58]">Internal Tank Temperature</span>
                <span className="font-mono text-[#21150c] font-bold">21.4 °C (Normal)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#faf6f0] border border-[#e8dcce] rounded-xl">
                <span className="font-medium text-[#7a6a58]">Pressure Relief Valve (PRV-350)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/15 text-[#059669]">Arm-Ready</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#faf6f0] border border-[#e8dcce] rounded-xl">
                <span className="font-medium text-[#7a6a58]">Combustible H₂ Gas Sniffers</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/15 text-[#059669]">0.00% LEL (Safe)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3.5 bg-[#c68642]/10 border border-[#c68642]/25 rounded-2xl text-xs text-[#8c5832] flex items-center justify-between">
            <span className="font-semibold">Buffer Status: Sufficient to supply 74 continuous hours at base off-take</span>
            <CheckCircle2 size={16} className="text-[#8c5832]" />
          </div>
        </div>
      </div>
    </div>
  );
}
