import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
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
      desc: "Full dispatch, user management & optimizer control",
      badgeColor: "bg-[#8c5832]/25 text-[#d49b55] border-[#8c5832]/50",
    },
    {
      role: "OPERATOR",
      title: "Plant Operator",
      email: "operator@greenh2.com",
      pass: "2024",
      desc: "Telemetry monitoring & optimizer scenario runs",
      badgeColor: "bg-[#c68642]/20 text-[#e5ad67] border-[#c68642]/40",
    },
    {
      role: "VIEWER",
      title: "Energy Analyst",
      email: "viewer@greenh2.com",
      pass: "2024",
      desc: "Read-only access to KPIs, storage & forecasts",
      badgeColor: "bg-[#5c3a21]/30 text-[#e8dcce] border-[#5c3a21]/50",
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
        background: "linear-gradient(135deg, #140d08 0%, #21150c 35%, #2d1c10 65%, #180f09 100%)",
      }}
    >
      {/* Decorative ambient coffee/amber glows */}
      <div
        className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none blur-[120px] opacity-25"
        style={{ background: "#c68642" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none blur-[120px] opacity-20"
        style={{ background: "#8c5832" }}
      />
      <div
        className="absolute top-[40%] right-[20%] w-[350px] h-[350px] rounded-full pointer-events-none blur-[100px] opacity-15"
        style={{ background: "#d49b55" }}
      />

      <div className="w-full max-w-xl relative z-10 py-8">
        {/* Main Card */}
        <div
          className="rounded-3xl shadow-2xl overflow-hidden border backdrop-blur-xl"
          style={{
            background: "rgba(33, 21, 12, 0.75)",
            borderColor: "rgba(198, 134, 66, 0.22)",
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(198, 134, 66, 0.08)",
          }}
        >
          {/* Header Banner */}
          <div
            className="px-8 pt-8 pb-7 text-center border-b relative"
            style={{
              background: "linear-gradient(180deg, rgba(92, 58, 33, 0.4) 0%, rgba(33, 21, 12, 0.2) 100%)",
              borderColor: "rgba(198, 134, 66, 0.15)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl border"
              style={{
                background: "linear-gradient(135deg, #c68642 0%, #8c5832 60%, #5c3a21 100%)",
                borderColor: "rgba(229, 173, 103, 0.4)",
              }}
            >
              <Droplets className="text-[#faf6f0]" size={32} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-2 border"
                 style={{ background: "rgba(198, 134, 66, 0.15)", color: "#e5ad67", borderColor: "rgba(198, 134, 66, 0.3)" }}>
              <Sparkles size={12} />
              <span>Optimized Energy & Storage Management</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#faf6f0]">
              Green H₂ Energy Platform
            </h1>
            <p className="text-xs mt-2 max-w-md mx-auto leading-relaxed text-[#d4cfc5]">
              Optimizing solar & wind energy allocation, hydrogen production scheduling, and storage inventory.
            </p>
          </div>

          {/* Quick Demo Credentials Switcher */}
          <div className="px-8 pt-6 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#b0a898]">
                Select Demo Role
              </span>
              <span className="text-[10px] text-[#c68642] font-medium">Click to instant-fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_PRESETS.map((p) => {
                const isSelected = email === p.email;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => selectDemoRole(p)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#c68642] bg-[#c68642]/20 shadow-md"
                        : "border-[#5c3a21]/40 bg-[#2b1d14]/40 hover:bg-[#3d281a]/40 hover:border-[#8c5832]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase text-[#e5ad67]"
                            style={{ background: "rgba(198, 134, 66, 0.18)", borderColor: "rgba(198, 134, 66, 0.35)" }}>
                        {p.role}
                      </span>
                      {isSelected && <Check size={12} className="text-[#e5ad67]" />}
                    </div>
                    <p className="text-xs font-semibold text-[#faf6f0] truncate">{p.title}</p>
                    <p className="text-[10px] text-[#b0a898] truncate">{p.pass}</p>
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
                  background: "rgba(185, 28, 28, 0.18)",
                  borderColor: "rgba(239, 68, 68, 0.35)",
                  color: "#fca5a5",
                }}
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-medium text-[#d4cfc5] mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a8070] pointer-events-none" />
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
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-[#faf6f0] placeholder-[#655e50] border outline-none transition"
                    style={{
                      background: "rgba(24, 15, 9, 0.65)",
                      borderColor: fieldErrors.email ? "rgba(239, 68, 68, 0.6)" : "rgba(198, 134, 66, 0.25)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#c68642")}
                    onBlur={(e) =>
                      (e.target.style.borderColor = fieldErrors.email
                        ? "rgba(239, 68, 68, 0.6)"
                        : "rgba(198, 134, 66, 0.25)")
                    }
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-medium text-[#d4cfc5] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a8070] pointer-events-none" />
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
                    className="w-full rounded-xl pl-10 pr-12 py-3 text-sm text-[#faf6f0] placeholder-[#655e50] border outline-none transition"
                    style={{
                      background: "rgba(24, 15, 9, 0.65)",
                      borderColor: fieldErrors.password ? "rgba(239, 68, 68, 0.6)" : "rgba(198, 134, 66, 0.25)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#c68642")}
                    onBlur={(e) =>
                      (e.target.style.borderColor = fieldErrors.password
                        ? "rgba(239, 68, 68, 0.6)"
                        : "rgba(198, 134, 66, 0.25)")
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a8070] hover:text-[#d49b55] transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg text-sm text-[#faf6f0] cursor-pointer hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2 border"
                style={{
                  background: "linear-gradient(135deg, #c68642 0%, #8c5832 60%, #5c3a21 100%)",
                  borderColor: "rgba(229, 173, 103, 0.35)",
                  boxShadow: "0 6px 20px rgba(198, 134, 66, 0.25)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-[#faf6f0]" />
                    <span>Signing in to Control Room…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Sign In to Plant Console</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div
            className="px-8 py-4 text-center border-t text-[11px]"
            style={{
              background: "rgba(20, 13, 8, 0.4)",
              borderColor: "rgba(198, 134, 66, 0.12)",
              color: "#8a8070",
            }}
          >
            <span>Authorized Plant Personnel · MERN Stack Production Architecture</span>
          </div>
        </div>

        {/* Branding under card */}
        <p className="text-center text-xs mt-4 text-[#8a8070]">
          Clean H₂ Dispatch · Diurnal Solar/Wind Balance · 24-Hour Horizon LP
        </p>
      </div>
    </div>
  );
}
