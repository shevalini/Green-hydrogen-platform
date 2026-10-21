import { useContext, useState } from "react";
import { Menu, RefreshCw, LogOut, User, ChevronDown, Droplets } from "lucide-react";
import { AuthContext } from "../context/AuthContext.jsx";

const ROLE_BADGES = {
  ADMIN:    "bg-[#8c5832]/15 text-[#7a4d2c] border-[#8c5832]/30",
  OPERATOR: "bg-[#c68642]/15 text-[#a8693a] border-[#c68642]/30",
  VIEWER:   "bg-[#8a8070]/15 text-[#655e50] border-[#8a8070]/30",
};

export default function Header({ title, subtitle, isSimulated, onRefresh, isRefreshing, user }) {
  const { logout } = useContext(AuthContext);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const roleClass = ROLE_BADGES[user?.role] || ROLE_BADGES.VIEWER;

  return (
    <header className="h-20 bg-[#faf6f0]/90 backdrop-blur-md border-b border-[#e8dcce] flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[#f4ece1] text-[#5c3a21] transition cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu size={21} />
        </button>

        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#21150c] tracking-tight">{title}</h2>
            {isSimulated && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c68642]/15 text-[#8c5832] border border-[#c68642]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c68642]" />
                Demo Telemetry
              </span>
            )}
          </div>
          <p className="text-xs text-[#7a6a58] mt-0.5 font-medium">{subtitle}</p>
        </div>
      </div>

      {/* Header Right */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#d4cfc5] bg-[#ffffff] hover:bg-[#f4ece1] text-[#5c3a21] text-xs font-semibold shadow-xs transition cursor-pointer"
          title="Refresh telemetry"
          id="header-refresh-btn"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#c68642]" : "text-[#7a4d2c]"} />
          <span className="hidden sm:inline">Refresh Data</span>
        </button>

        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              id="user-menu-btn"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 rounded-xl border border-[#d4cfc5] bg-[#ffffff] hover:bg-[#f4ece1] transition cursor-pointer shadow-xs"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                   style={{ background: "linear-gradient(135deg, #8c5832, #c68642)" }}>
                <User size={14} />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#21150c] leading-tight">{user.name || "Operator"}</p>
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${roleClass}`}>
                  {user.role}
                </span>
              </div>
              <ChevronDown size={14} className={`text-[#8a8070] transition ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#ffffff] border border-[#d4cfc5] rounded-2xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-[#f4ece1] bg-[#faf6f0]">
                    <p className="text-xs font-bold text-[#21150c] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#7a6a58] truncate">{user.email}</p>
                    <div className="mt-1.5">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${roleClass}`}>
                        Role: {user.role}
                      </span>
                    </div>
                  </div>
                  <button
                    id="logout-btn"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
