import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Sun, Droplets, BatteryCharging,
  BarChart3, Zap, Database, Radio, Cpu, ShieldCheck, Sliders,
} from "lucide-react";

const ALL_NAV_LINKS = [
  { to: "/",                label: "Dashboard",        icon: <LayoutDashboard size={18} />, end: true,   roles: ["ADMIN","OPERATOR","VIEWER"] },
  { to: "/plant-data",      label: "Plant Data Input", icon: <Sliders size={18} />,                        roles: ["ADMIN","OPERATOR"] },
  { to: "/optimization",   label: "Optimization",      icon: <Zap size={18} />,             badge: "LP",  roles: ["ADMIN","OPERATOR"] },
  { to: "/energy-monitoring", label: "Energy Monitor",  icon: <Sun size={18} />,                          roles: ["ADMIN","OPERATOR","VIEWER"] },
  { to: "/hydrogen",       label: "Hydrogen",           icon: <Droplets size={18} />,                     roles: ["ADMIN","OPERATOR","VIEWER"] },
  { to: "/storage",        label: "Storage",            icon: <BatteryCharging size={18} />,              roles: ["ADMIN","OPERATOR","VIEWER"] },
  { to: "/analytics",      label: "Analytics",          icon: <BarChart3 size={18} />,                    roles: ["ADMIN","OPERATOR","VIEWER"] },
  { to: "/admin",          label: "Administration",     icon: <ShieldCheck size={18} />,    badge: "Admin",roles: ["ADMIN"] },
];

export default function Sidebar({ metaInfo, userRole }) {
  const effectiveRole = userRole || "VIEWER";
  const navLinks = ALL_NAV_LINKS.filter((l) => l.roles.includes(effectiveRole));

  return (
    <aside className="hidden md:flex w-64 flex-col shrink-0" style={{ background: "#1e1a14", borderRight: "1px solid #3a2a1a" }}>
      {/* Logo */}
      <div className="h-20 flex items-center px-6" style={{ borderBottom: "1px solid #3a2a1a" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, #8b5230, #c4874e)" }}>
          <Droplets className="text-white" size={22} />
        </div>
        <div className="ml-3">
          <h1 className="font-bold text-base leading-tight" style={{ color: "#f5e9d8" }}>Green H₂</h1>
          <p className="text-xs" style={{ color: "#8a8070" }}>Energy Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest px-3 pb-2 pt-1" style={{ color: "#655e50" }}>Navigation</p>
        {navLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `
              flex items-center justify-between
              px-3 py-2.5 rounded-xl transition-all duration-150 group
              ${isActive
                ? "font-semibold"
                : "font-medium"}
            `}
            style={({ isActive }) => ({
              background: isActive ? "rgba(168,105,58,0.25)" : "transparent",
              color: isActive ? "#eacfb0" : "#8a8070",
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains("active-nav")) {
                e.currentTarget.style.background = "rgba(168,105,58,0.12)";
                e.currentTarget.style.color = "#d9ae82";
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.dataset.active) {
                // NavLink handles its own active detection
              }
            }}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <span style={{ color: isActive ? "#c4874e" : "#655e50" }}>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(168,105,58,0.3)", color: "#d9ae82" }}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Bottom — Status */}
      <div className="p-4 space-y-3" style={{ borderTop: "1px solid #3a2a1a" }}>
        <div className="p-3 rounded-xl border text-xs space-y-2" style={{ background: "#2a1f14", borderColor: "#3a2a1a" }}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: "#8a8070" }}>
              <Database size={12} /> Database
            </span>
            <span className={`px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase`}
              style={{
                background: metaInfo?.dbStatus === "connected" ? "rgba(74,140,58,0.2)" : "rgba(168,105,58,0.2)",
                color: metaInfo?.dbStatus === "connected" ? "#7ec862" : "#d9ae82",
              }}>
              {metaInfo?.dbStatus ?? "disconnected"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: "#8a8070" }}>
              <Radio size={12} /> Data Source
            </span>
            <span className="px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase"
              style={{ background: "rgba(168,105,58,0.2)", color: "#d9ae82" }}>
              {metaInfo?.dataSource ?? "simulated"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: "#8a8070" }}>
              <Cpu size={12} /> Optimizer
            </span>
            <span className="px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase"
              style={{ background: "rgba(196,135,78,0.2)", color: "#c4874e" }}>
              24h LP Active
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl border" style={{ background: "rgba(139,82,48,0.15)", borderColor: "rgba(139,82,48,0.3)" }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full status-dot" style={{ background: "#c4874e" }} />
            <span className="text-sm font-medium" style={{ color: "#d9ae82" }}>System Online</span>
          </div>
          <p className="text-xs mt-1" style={{ color: "#655e50" }}>
            {metaInfo?.dbStatus === "connected" ? "MongoDB connected" : "Demo mode active"}
          </p>
        </div>
      </div>
    </aside>
  );
}
