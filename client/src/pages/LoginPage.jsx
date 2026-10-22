import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/authContext.js";
import {
  Eye,
  EyeOff,
  Droplets,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Zap,
  Check,
  Sparkles,
  Leaf,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@greenh2.local");
  const [password, setPassword] = useState("2024");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const DEMO_PRESETS = [
    {
      role: "ADMIN",
      title: "System Admin",
      email: "admin@greenh2.local",
      pass: "2024",
      subtitle: "Full System Access",
      desc: "Full dispatch, user management & optimizer control",
    },
    {
      role: "OPERATOR",
      title: "Plant Operator",
      email: "operator@greenh2.com",
      pass: "2024",
      subtitle: "Operations & Control",
      desc: "Telemetry monitoring & optimizer scenario runs",
    },
    {
      role: "VIEWER",
      title: "Energy Analyst",
      email: "viewer@greenh2.com",
      pass: "2024",
      subtitle: "Analytics & Monitoring",
      desc: "Read-only access to KPIs, storage & forecasts",
    },
  ];

  function validate() {
    const errs = {};
    if (!email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 3) errs.password = "Password must be at least 3 characters.";
    return errs;
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    const result = await login(email.trim().toLowerCase(), password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || "Login failed. Please check your credentials.");
    }
  };

  const selectDemoRole = (preset) => {
    setEmail(preset.email);
    setPassword(preset.pass);
    setFieldErrors({});
    setError(null);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #fdfcfb 0%, #f7f3ee 35%, #eee6db 75%, #fbf9f6 100%)",
      }}
    >
      {/* Subtle background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(#7b4928 1.5px, transparent 1.5px), radial-gradient(#7b4928 1.5px, #fdfcfb 1.5px)",
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0, 16px 16px",
        }}
      />

      {/* Decorative ambient soft glows with low darkness */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full pointer-events-none blur-[130px] opacity-45"
        style={{ background: "#f5e8da" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[550px] h-[550px] rounded-full pointer-events-none blur-[140px] opacity-40"
        style={{ background: "#eedcc9" }}
      />
      <div
        className="absolute top-[35%] right-[18%] w-[380px] h-[380px] rounded-full pointer-events-none blur-[110px] opacity-30"
        style={{ background: "#faf0e3" }}
      />

      <div className="w-full max-w-xl relative z-10 py-8">
        {/* Main Clean Card */}
        <div
          className="rounded-3xl overflow-hidden border backdrop-blur-2xl transition-all"
          style={{
            background: "rgba(255, 255, 255, 0.96)",
            borderColor: "rgba(232, 223, 213, 0.9)",
            boxShadow:
              "0 20px 50px -12px rgba(92, 56, 32, 0.08), 0 6px 20px -4px rgba(170, 110, 64, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.9) inset",
          }}
        >
          {/* Header Banner */}
          <div
            className="px-8 pt-8 pb-7 text-center border-b relative"
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #faf6f1 100%)",
              borderColor: "rgba(232, 223, 213, 0.8)",
            }}
          >
            {/* Logo Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border transition-transform hover:scale-105 duration-200"
              style={{
                background: "linear-gradient(135deg, #aa6e40 0%, #c68953 100%)",
                borderColor: "rgba(245, 230, 215, 0.9)",
                boxShadow: "0 8px 20px rgba(170, 110, 64, 0.22)",
              }}
            >
              <Droplets className="text-[#ffffff]" size={32} />
            </div>

            {/* Pill Tag */}
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 border shadow-2xs"
              style={{
                background: "rgba(170, 110, 64, 0.08)",
                color: "#7b4928",
                borderColor: "rgba(170, 110, 64, 0.2)",
              }}
            >
              <Sparkles size={12} className="text-[#aa6e40]" />
              <span>Optimized Energy & Storage Management</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-extrabold tracking-tight text-[#2d241d]">
              Green H₂ Energy Platform
            </h1>

            {/* Description */}
            <p className="text-xs mt-2 max-w-md mx-auto leading-relaxed text-[#6c5e52] font-medium">
              Optimizing solar & wind energy allocation, hydrogen production scheduling, and storage inventory.
            </p>
          </div>

          {/* Quick Demo Role Switcher */}
          <div className="px-8 pt-6 pb-2">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#635548]">
                Select Demo Role
              </span>
              <span className="text-[11px] font-semibold text-[#8b4e23] flex items-center gap-1">
                <Zap size={12} className="text-[#aa6e40]" />
                Instant Profile Access
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {DEMO_PRESETS.map((p) => {
                const isSelected = email === p.email;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => selectDemoRole(p)}
                    className={`p-3 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[#aa6e40] bg-[#fffaf5] shadow-xs ring-2 ring-[#aa6e40]/20"
                        : "border-[#eadecf] bg-[#fcfbfa] hover:bg-[#f6eee4] hover:border-[#c68953]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider"
                        style={{
                          background: isSelected ? "rgba(170, 110, 64, 0.12)" : "rgba(170, 110, 64, 0.06)",
                          color: isSelected ? "#7b4928" : "#8b4e23",
                          borderColor: isSelected ? "rgba(170, 110, 64, 0.28)" : "rgba(170, 110, 64, 0.18)",
                        }}
                      >
                        {p.role}
                      </span>
                      {isSelected ? (
                        <Check size={14} className="text-[#8b4e23] stroke-[2.5]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#dccdbc]" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#2d241d] truncate">{p.title}</p>
                    <p className="text-[11px] font-medium text-[#7a6c5f] truncate mt-0.5">{p.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-5">
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 p-3.5 rounded-xl text-xs border"
                style={{
                  background: "rgba(254, 242, 242, 0.9)",
                  borderColor: "rgba(248, 113, 113, 0.45)",
                  color: "#991b1b",
                }}
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-[#4c4035] mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c7e6f] pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((p) => ({ ...p, email: null }));
                    }}
                    placeholder="admin@greenh2.local"
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-[#2d241d] placeholder-[#a69687] bg-white border outline-none transition font-medium"
                    style={{
                      borderColor: fieldErrors.email ? "rgba(220, 38, 38, 0.6)" : "rgba(232, 223, 213, 0.9)",
                      boxShadow: "0 1px 3px rgba(70, 40, 20, 0.04)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#aa6e40";
                      e.target.style.boxShadow = "0 0 0 3px rgba(170, 110, 64, 0.16)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = fieldErrors.email
                        ? "rgba(220, 38, 38, 0.6)"
                        : "rgba(232, 223, 213, 0.9)";
                      e.target.style.boxShadow = "0 1px 3px rgba(70, 40, 20, 0.04)";
                    }}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-[#4c4035] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c7e6f] pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((p) => ({ ...p, password: null }));
                    }}
                    placeholder="••••••••"
                    className="w-full rounded-xl pl-10 pr-12 py-3 text-sm text-[#2d241d] placeholder-[#a69687] bg-white border outline-none transition font-medium"
                    style={{
                      borderColor: fieldErrors.password ? "rgba(220, 38, 38, 0.6)" : "rgba(232, 223, 213, 0.9)",
                      boxShadow: "0 1px 3px rgba(70, 40, 20, 0.04)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#aa6e40";
                      e.target.style.boxShadow = "0 0 0 3px rgba(170, 110, 64, 0.16)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = fieldErrors.password
                        ? "rgba(220, 38, 38, 0.6)"
                        : "rgba(232, 223, 213, 0.9)";
                      e.target.style.boxShadow = "0 1px 3px rgba(70, 40, 20, 0.04)";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c7e6f] hover:text-[#5c3820] transition cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs font-medium text-red-600">{fieldErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all duration-200 text-sm text-white cursor-pointer hover:brightness-105 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2 border shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #aa6e40 0%, #c68953 100%)",
                  borderColor: "rgba(245, 230, 215, 0.6)",
                  boxShadow: "0 6px 20px rgba(170, 110, 64, 0.22)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Signing in to Control Room…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={17} />
                    <span>Sign In to Plant Console</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div
            className="px-8 py-3.5 text-center border-t text-[11px] font-medium"
            style={{
              background: "#fbf9f6",
              borderColor: "rgba(232, 223, 213, 0.8)",
              color: "#7a6c5f",
            }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Leaf size={12} className="text-[#aa6e40]" />
              Authorized Plant Personnel · MERN Stack Production Architecture
            </span>
          </div>
        </div>

        {/* Branding under card */}
        <p className="text-center text-xs mt-4 text-[#7a6c5f] font-medium">
          Clean H₂ Dispatch · Diurnal Solar/Wind Balance · 24-Hour Horizon LP
        </p>
      </div>
    </div>
  );
}
