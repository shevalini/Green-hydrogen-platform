import { Link } from "react-router-dom";
import {
  Sun,
  Wind,
  Droplets,
  BatteryCharging,
  Zap,
  Activity,
  Gauge,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function DashboardPage({
  metrics,
  energyData,
  storageData,
  loading,
  error,
  metaInfo,
  onRefresh,
  userRole,
}) {
  const isViewer = userRole === "VIEWER";

  if (error) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3.5 shadow-sm">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-900">
              Telemetry Connection Interrupted
            </h3>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">{error}</p>
            <button
              onClick={onRefresh}
              className="mt-3 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !metrics) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#e8dcce] rounded-2xl p-5 h-36 animate-pulse"
            >
              <div className="h-4 bg-[#f4ece1] rounded w-1/2 mb-4" />
              <div className="h-8 bg-[#e8dcce] rounded w-3/4 mb-2" />
              <div className="h-3 bg-[#f4ece1] rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#21150c] tracking-tight">
              Control Room Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#c68642]/15 text-[#8c5832] border border-[#c68642]/30">
              {isViewer ? "Analyst Monitoring" : "Active Dispatch"}
            </span>
          </div>
          <p className="text-xs text-[#7a6a58] mt-1 font-medium">
            Diurnal renewable allocation, PEM electrolyzer load scheduling, and high-pressure storage balancing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isViewer ? (
            <Link
              to="/optimization"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition shadow-md cursor-pointer hover:brightness-110 active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #c68642 0%, #8c5832 60%, #5c3a21 100%)",
                boxShadow: "0 4px 14px rgba(140, 88, 50, 0.25)",
              }}
            >
              <Zap size={14} className="text-[#faf6f0]" />
              <span>Launch LP Optimizer</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#d4cfc5] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span className="text-xs font-bold text-[#5c3a21]">Read-Only Mode</span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#d4cfc5] shadow-xs">
            <span className="text-xs text-[#8a8070]">Mode:</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#8c5832]/15 text-[#7a4d2c]">
              24h Horizon LP
            </span>
          </div>
        </div>
      </div>

      {metrics && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title="Solar Generation"
              value={metrics.solarEnergy?.value ?? "--"}
              unit={metrics.solarEnergy?.unit ?? "kW"}
              icon={<Sun size={20} />}
              accentBg="bg-[#f59e0b]/15 text-[#d97706]"
              description={`+${metrics.solarEnergy?.changePct ?? 0}% vs. morning baseline`}
            />

            <StatCard
              title="Wind Generation"
              value={metrics.windEnergy?.value ?? "--"}
              unit={metrics.windEnergy?.unit ?? "kW"}
              icon={<Wind size={20} />}
              accentBg="bg-[#8c5832]/15 text-[#8c5832]"
              description={`+${metrics.windEnergy?.changePct ?? 0}% active gust index`}
            />

            <StatCard
              title="Total Renewables"
              value={metrics.renewableTotal?.value ?? "--"}
              unit={metrics.renewableTotal?.unit ?? "kW"}
              icon={<Zap size={20} />}
              accentBg="bg-[#c68642]/15 text-[#a8693a]"
              description={`${metrics.renewableTotal?.utilizationPct ?? 0}% utilized for H₂`}
            />

            <StatCard
              title="Hydrogen Production"
              value={metrics.hydrogenProduction?.rate ?? "--"}
              unit={metrics.hydrogenProduction?.unit ?? "kg/h"}
              icon={<Droplets size={20} />}
              accentBg="bg-[#5c3a21]/15 text-[#5c3a21]"
              description={metrics.hydrogenProduction?.status ?? "PEM Stack Synchronized"}
            />
          </div>

          {/* Row 2: Renewable Generation Chart + Hydrogen Storage Tank */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Renewable Generation Chart */}
            <div className="xl:col-span-2 bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#21150c]">
                      Renewable Energy Diurnal Profile
                    </h3>
                    <Activity size={17} className="text-[#c68642]" />
                  </div>
                  <p className="text-xs text-[#7a6a58] mt-1 font-medium">
                    Solar bell curve + wind generation telemetry with electrolyzer load threshold
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-[#c68642]/15 text-[#8c5832] px-3 py-1 rounded-full border border-[#c68642]/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#c68642] animate-pulse" />
                    {metaInfo?.isSimulated ? "SIMULATED FEED" : "LIVE TELEMETRY"}
                  </span>
                </div>
              </div>

              {energyData?.generationIntervals && energyData.generationIntervals.length > 0 ? (
                <div className="h-64 flex items-end gap-3 px-2 pt-4">
                  {energyData.generationIntervals.map((item, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col justify-end h-full group relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-[#21150c] text-[#faf6f0] text-[11px] py-1.5 px-2.5 rounded-lg pointer-events-none z-20 whitespace-nowrap shadow-xl border border-[#c68642]/40">
                        <span className="font-bold text-[#e5ad67]">{item.totalKw} kW Total</span>
                        <span className="text-[10px] text-[#d4cfc5]">
                          {item.time} · Solar: {item.solarKw}kW | Wind: {item.windKw}kW
                        </span>
                      </div>

                      <div
                        className="rounded-t-lg transition-all duration-300 cursor-pointer shadow-xs"
                        style={{
                          height: `${item.heightPct}%`,
                          background: "linear-gradient(180deg, #d49b55 0%, #8c5832 70%, #5c3a21 100%)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.filter = "brightness(1.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.filter = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-[#8a8070] text-xs">
                  No generation interval data available
                </div>
              )}

              {/* Time Labels */}
              <div className="flex justify-between text-xs text-[#8a8070] mt-3 px-2 font-medium">
                {energyData?.generationIntervals ? (
                  energyData.generationIntervals.map((item, idx) => (
                    <span key={idx}>{item.time}</span>
                  ))
                ) : (
                  <>
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>23:00</span>
                  </>
                )}
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#f4ece1]">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-md" style={{ background: "linear-gradient(135deg, #d49b55, #8c5832)" }} />
                    <span className="text-xs text-[#7a6a58] font-medium">Solar & Wind Generation Blend</span>
                  </div>
                </div>

                <div className="text-xs font-bold text-[#5c3a21]">
                  Peak Generation: {energyData?.peakGenerationKw ?? 785} kW
                </div>
              </div>
            </div>

            {/* Hydrogen Storage Tank Card */}
            <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#21150c]">Storage Buffer</h3>
                  <p className="text-xs text-[#7a6a58] mt-1 font-medium">
                    Tank {storageData?.tankId ?? "H2-TK-01"} (Type IV 350-bar)
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#c68642]/15 text-[#8c5832]">
                  <BatteryCharging size={20} />
                </div>
              </div>

              {/* Cylindrical Storage Tank Graphic */}
              <div className="flex justify-center py-5">
                <div className="relative w-36 h-48 border-4 border-[#8c5832]/30 rounded-3xl overflow-hidden bg-[#faf6f0] shadow-inner">
                  {/* Fluid level */}
                  <div
                    className="absolute bottom-0 left-0 right-0 transition-all duration-700 shadow-lg"
                    style={{
                      height: `${storageData?.filledPercentage ?? 74}%`,
                      background: "linear-gradient(180deg, #d49b55 0%, #8c5832 50%, #5c3a21 100%)",
                    }}
                  />

                  {/* Glass overlay badge */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-[#faf6f0]/90 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-[#d4cfc5]/50 shadow-md">
                      <p className="text-3xl font-extrabold text-[#21150c] tracking-tight">
                        {storageData?.filledPercentage ?? 74}%
                      </p>
                      <p className="text-[11px] font-semibold text-[#8c5832] uppercase tracking-wider">
                        Tank Fill
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 bg-[#faf6f0] p-4 rounded-2xl border border-[#e8dcce]">
                <div className="flex justify-between text-xs">
                  <span className="text-[#7a6a58]">Stored Inventory</span>
                  <span className="font-bold text-[#21150c]">
                    {storageData?.currentKg ?? 740} kg
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-[#7a6a58]">Max Capacity</span>
                  <span className="font-bold text-[#21150c]">
                    {storageData?.capacityKg ?? 1000} kg
                  </span>
                </div>

                <div className="flex justify-between text-xs pt-1 border-t border-[#e8dcce]">
                  <span className="text-[#7a6a58]">Ullage (Available)</span>
                  <span className="font-bold text-[#8c5832]">
                    {storageData?.availableKg ?? 260} kg
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Electrolyzer + Daily Trend + Optimization Callout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Electrolyzer Stack Health */}
            <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#21150c]">PEM Electrolyzer</h3>
                  <p className="text-xs text-[#7a6a58] font-medium">Stack load & specific power</p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-[#c68642]/15 flex items-center justify-center text-[#8c5832]">
                  <Gauge size={20} />
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-[#10b981] rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-[#10b981] uppercase tracking-wider">
                    {metrics.electrolyzer?.status ?? "ONLINE - LOAD TRACKING"}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between mb-1.5 text-xs">
                    <span className="text-[#7a6a58] font-medium">Load Utilization</span>
                    <span className="font-bold text-[#21150c]">
                      {metrics.electrolyzer?.utilizationPct ?? 78}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-[#f4ece1] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${metrics.electrolyzer?.utilizationPct ?? 78}%`,
                        background: "linear-gradient(90deg, #8c5832, #c68642)",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="bg-[#faf6f0] border border-[#e8dcce] rounded-2xl p-3.5">
                    <p className="text-[11px] text-[#7a6a58] font-medium">Draw Power</p>
                    <p className="text-lg font-extrabold text-[#21150c] mt-0.5">
                      {metrics.electrolyzer?.powerKw ?? 550} kW
                    </p>
                  </div>

                  <div className="bg-[#faf6f0] border border-[#e8dcce] rounded-2xl p-3.5">
                    <p className="text-[11px] text-[#7a6a58] font-medium">Stack Efficiency</p>
                    <p className="text-lg font-extrabold text-[#21150c] mt-0.5">
                      {metrics.electrolyzer?.efficiencyPct ?? 65}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Cumulative Hydrogen Production */}
            <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#21150c]">Today's Output</h3>
                  <p className="text-xs text-[#7a6a58] font-medium">Net mass generated</p>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#8c5832]/15 text-[#8c5832]">
                  <TrendingUp size={20} />
                </div>
              </div>

              <div className="mt-5">
                <p className="text-4xl font-extrabold text-[#21150c] tracking-tight">
                  {metrics.todayProduction?.currentKg ?? 142}
                  <span className="text-base font-semibold text-[#8a8070] ml-1.5">
                    {metrics.todayProduction?.unit ?? "kg H₂"}
                  </span>
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-[#10b981]">
                    +{metrics.todayProduction?.changeVsYesterdayPct ?? 14.2}%
                  </span>
                  <span className="text-xs text-[#8a8070]">vs. previous 24h cycle</span>
                </div>
              </div>

              {/* Sparkline bars */}
              <div className="mt-6 h-16 flex items-end gap-2 pt-2">
                {(
                  metrics.todayProduction?.hourlyTrend || [
                    30, 40, 35, 50, 45, 60, 55, 70, 65, 80, 75, 90,
                  ]
                ).map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-md transition-all duration-200 cursor-pointer"
                    style={{
                      height: `${height}%`,
                      background: "linear-gradient(180deg, #c68642, #8c5832)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                  />
                ))}
              </div>
            </div>

            {/* Smart Dispatch Card */}
            <div
              className="rounded-3xl p-6 flex flex-col justify-between text-white shadow-lg border"
              style={{
                background: "linear-gradient(135deg, #2b1d14 0%, #3d281a 60%, #1a110a 100%)",
                borderColor: "rgba(198, 134, 66, 0.3)",
              }}
            >
              <div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md border"
                    style={{
                      background: "linear-gradient(135deg, #c68642, #8c5832)",
                      borderColor: "rgba(229, 173, 103, 0.4)",
                    }}
                  >
                    <Zap size={20} className="text-[#faf6f0]" />
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e5ad67]">
                      Optimizer Dispatch
                    </span>
                    <h3 className="font-bold text-sm text-[#faf6f0]">
                      24-Hour Horizon LP
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-[#d4cfc5] mt-4 leading-relaxed font-normal">
                  {metrics.recommendation?.message ??
                    "Linear programming schedule dynamically pre-charges composite tanks during high diurnal solar generation, preventing expensive grid curtailment."}
                </p>
              </div>

              {isViewer ? (
                <Link
                  to="/analytics"
                  className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold text-[#faf6f0] transition cursor-pointer flex items-center justify-center gap-2 border hover:brightness-110 shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #c68642, #8c5832)",
                    borderColor: "rgba(229, 173, 103, 0.35)",
                  }}
                >
                  <span>Explore Plant Analytics</span>
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <Link
                  to="/optimization"
                  className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold text-[#faf6f0] transition cursor-pointer flex items-center justify-center gap-2 border hover:brightness-110 shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #c68642, #8c5832)",
                    borderColor: "rgba(229, 173, 103, 0.35)",
                  }}
                >
                  <span>View Optimization Schedule</span>
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-[#8a8070] border-t border-[#e8dcce]">
            <p>
              Last Telemetry Sync:{" "}
              <span className="font-semibold text-[#5c3a21]">
                {metaInfo?.lastUpdated
                  ? new Date(metaInfo.lastUpdated).toLocaleTimeString()
                  : "Just now"}
              </span>
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Data Feed:</span>
                <span className="font-bold text-[#5c3a21] capitalize">
                  {metaInfo?.dataSource ?? "simulated"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#10b981] rounded-full" />
                <span className="font-medium text-[#5c3a21]">Telemetry Pipeline Active</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, unit, icon, description, accentBg }) {
  return (
    <div className="bg-white border border-[#e8dcce] shadow-sm rounded-3xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#7a6a58] font-bold">{title}</p>
        <div className={`p-2.5 rounded-2xl ${accentBg}`}>{icon}</div>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-extrabold text-[#21150c] tracking-tight">{value}</span>
        <span className="text-xs font-semibold text-[#8a8070]">{unit}</span>
      </div>

      <p className="text-xs text-[#8c5832] font-medium mt-2">{description}</p>
    </div>
  );
}
