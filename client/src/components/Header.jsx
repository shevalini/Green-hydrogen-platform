import { useContext, useState } from "react";
import { Menu, RefreshCw, LogOut, User, ChevronDown } from "lucide-react";
import { AuthContext } from "../context/authContext.js";
import { getIndustrialStatusClasses } from "../utils/statusStyles";

const ROLE_BADGES = {
  ADMIN:    "bg-[#aa6e40]/12 text-[#8b4e23] border-[#aa6e40]/30",
  OPERATOR: "bg-[#c68953]/15 text-[#aa6e40] border-[#c68953]/30",
  VIEWER:   "bg-[#8c7e6f]/15 text-[#635548] border-[#8c7e6f]/30",
};

export default function Header({ title, subtitle, isSimulated, onRefresh, isRefreshing, user }) {
  const { logout } = useContext(AuthContext);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const roleClass = ROLE_BADGES[user?.role] || ROLE_BADGES.VIEWER;

  return (
    <header className="h-20 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#e8dfd5] flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[#f6f2ec] text-[#635548] transition cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu size={21} />
        </button>

        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-[#2d241d] tracking-tight">{title}</h2>
            {isSimulated && (
              <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getIndustrialStatusClasses("demo")}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Demo Telemetry
              </span>
            )}
          </div>
          <p className="text-xs text-[#7a6c5f] mt-0.5 font-medium">{subtitle}</p>
        </div>
      </div>

      {/* Header Right */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e8dfd5] bg-[#ffffff] hover:bg-[#fbf8f4] text-[#635548] text-xs font-semibold shadow-2xs transition cursor-pointer"
          title="Refresh telemetry"
          id="header-refresh-btn"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#c68953]" : "text-[#8b4e23]"} />
          <span className="hidden sm:inline">Refresh Data</span>
        </button>

        {/* User menu */}
        {user && (
          <div className="relative">
            <button
              id="user-menu-btn"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 rounded-xl border border-[#e8dfd5] bg-[#ffffff] hover:bg-[#fbf8f4] transition cursor-pointer shadow-2xs"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                   style={{ background: "linear-gradient(135deg, #aa6e40, #c68953)" }}>
                <User size={14} />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#2d241d] leading-tight">{user.name || "Operator"}</p>
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${roleClass}`}>
                  {user.role}
                </span>
              </div>
              <ChevronDown size={14} className={`text-[#8c7e6f] transition ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#ffffff] border border-[#e8dfd5] rounded-2xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-[#f2ebe2] bg-[#fbf8f4]">
                    <p className="text-xs font-bold text-[#2d241d] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#7a6c5f] truncate">{user.email}</p>
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
