 import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Sun, Droplets, BatteryCharging,
  BarChart3, Zap, Database, Radio, Cpu, ShieldCheck, Sliders,
} from "lucide-react";
import { getIndustrialStatusClasses } from "../utils/statusStyles";

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
    <aside className="hidden md:flex w-64 flex-col shrink-0" style={{ background: "#faf7f2", borderRight: "1px solid #e8dfd5" }}>
      {/* Logo */}
      <div className="h-20 flex items-center px-6" style={{ background: "#fdfcf9", borderBottom: "1px solid #e8dfd5" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg, #aa6e40, #c68953)" }}>
          <Droplets className="text-white" size={22} />
        </div>
        <div className="ml-3">
          <h1 className="font-bold text-base leading-tight" style={{ color: "#2d241d" }}>Green H₂</h1>
          <p className="text-xs font-medium" style={{ color: "#7a6c5f" }}>Energy Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest px-3 pb-2 pt-1" style={{ color: "#8c7e6f" }}>Navigation</p>
        {navLinks.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `
              flex items-center justify-between
              px-3 py-2.5 rounded-xl transition-all duration-150 group
              ${isActive
                ? "font-bold shadow-2xs"
                : "font-medium hover:bg-[#f5eee4]"}
            `}
            style={({ isActive }) => ({
              background: isActive ? "rgba(170, 110, 64, 0.12)" : undefined,
              color: isActive ? "#8b4e23" : undefined,
            })}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <span style={{ color: isActive ? "#aa6e40" : "#8c7e6f" }}>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(170, 110, 64, 0.16)", color: "#8b4e23" }}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Bottom — Status */}
      <div className="p-4 space-y-3" style={{ background: "#fdfcf9", borderTop: "1px solid #e8dfd5" }}>
      <div className="p-3 rounded-xl border text-xs space-y-2" style={{ background: "#ffffff", borderColor: "#e8dfd5" }}>
          <div className="space-y-1.5">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: "#635548" }}>
              <Database size={12} className="text-[#8c7e6f]" /> Database
            </span>
            <span className={`block px-2 py-1 rounded-md font-bold text-[9px] border text-center leading-relaxed ${getIndustrialStatusClasses(metaInfo?.dbStatus === "connected" ? "connected" : "disconnected")}`}>
              {metaInfo?.dbStatus === "connected"
                ? "MongoDB Connected"
                : "Storage Engine: In-Memory (Demo)"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: "#635548" }}>
              <Radio size={12} className="text-[#8c7e6f]" /> Data Source
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border ${getIndustrialStatusClasses(metaInfo?.dataSource ?? "simulated")}`}>
              {metaInfo?.dataSource ?? "simulated"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: "#635548" }}>
              <Cpu size={12} className="text-[#8c7e6f]" /> Optimizer
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase border ${getIndustrialStatusClasses("active")}`}>
              24h LP Active
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl border" style={{ background: "rgba(74, 140, 58, 0.08)", borderColor: "rgba(74, 140, 58, 0.22)" }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full status-dot" style={{ background: "#4a8c3a" }} />
            <span className="text-xs font-bold" style={{ color: "#2e7d32" }}>System Online</span>
          </div>
          <p className="text-[11px] mt-1 font-medium" style={{ color: "#7a6c5f" }}>
            {metaInfo?.dbStatus === "connected" ? "MongoDB connected" : "Demo mode active"}
          </p>
        </div>
      </div>
    </aside>
  );
}
