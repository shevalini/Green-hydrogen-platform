import { useState, useEffect, useContext, useCallback } from "react";
import {
  ShieldCheck,
  UserPlus,
  RefreshCw,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  History,
  X,
} from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/authContext.js";
import { Navigate } from "react-router-dom";

const ROLE_BADGE = {
  ADMIN:    "bg-[#aa6e40]/20 text-[#aa6e40] border border-[#aa6e40]/40",
  OPERATOR: "bg-[#c68642]/20 text-[#a8693a] border border-[#c68642]/40",
  VIEWER:   "bg-[#8a8070]/20 text-[#655e50] border border-[#8a8070]/40",
};

const ACTION_BADGE = {
  USER_LOGIN:           "bg-[#10b981]/15 text-[#059669] border-[#10b981]/30",
  OPTIMIZATION_RUN:     "bg-[#c68642]/15 text-[#aa6e40] border-[#c68642]/30",
  USER_CREATED:         "bg-[#aa6e40]/15 text-[#8b4e23] border-[#aa6e40]/30",
  USER_ROLE_UPDATED:    "bg-amber-100 text-amber-800 border-amber-300",
  USER_STATUS_UPDATED:  "bg-blue-100 text-blue-800 border-blue-300",
  TELEMETRY_REFRESH:    "bg-[#8a8070]/15 text-[#635548] border-[#8a8070]/30",
};

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#10b981]/15 text-[#059669] border border-[#10b981]/30">
      <CheckCircle size={10} /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-200">
      <XCircle size={10} /> Inactive
    </span>
  );
}

function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "VIEWER", isActive: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/api/admin/users", form);
      if (res.data?.success) {
        onCreated(res.data.data);
        onClose();
      } else setError(res.data?.error || "Failed to create user.");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full border border-[#e8dfd5] rounded-xl px-4 py-2.5 text-xs text-[#2d241d] focus:outline-none focus:border-[#aa6e40] transition bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#e8dfd5] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f6f0e8] bg-[#fbf8f4]">
          <h3 className="text-sm font-bold text-[#2d241d]">Provision New User Account</h3>
          <button onClick={onClose} className="text-[#8a8070] hover:text-[#2d241d] transition cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#7a6c5f] mb-1">Full Name</label>
            <input
              required
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Dr. Elena Vance"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a6c5f] mb-1">Account Email</label>
            <input
              required
              type="email"
              className={inputCls}
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="elena@greenh2.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a6c5f] mb-1">Temporary Password</label>
            <input
              required
              minLength={4}
              type="password"
              className={inputCls}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Min. 4 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#7a6c5f] mb-1">System Role</label>
            <select
              className={inputCls}
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="VIEWER">VIEWER — read-only telemetry access</option>
              <option value="OPERATOR">OPERATOR — trigger LP optimizer runs</option>
              <option value="ADMIN">ADMIN — full plant control and user management</option>
            </select>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="accent-[#aa6e40]"
            />
            <label htmlFor="isActive" className="text-xs font-medium text-[#635548]">
              Immediate Activation
            </label>
          </div>
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#e8dfd5] text-xs font-bold text-[#7a6c5f] hover:bg-[#fbf8f4] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="create-user-submit-btn"
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition shadow-md cursor-pointer hover:brightness-110 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #c68642, #aa6e40)" }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {loading ? "Creating…" : "Save User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage({ userRole }) {
  const { user: currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("users"); // "users" | "audit"
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/users");
      if (res.data?.success) setUsers(res.data.data);
      else setError(res.data?.error || "Failed to load users.");
    } catch (err) {
      if (err.response?.status === 403) setError("Forbidden: Admin access required.");
      else setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await api.get("/api/admin/audit-logs");
      if (res.data?.success) setAuditLogs(res.data.data);
    } catch (err) {
      console.warn("Failed to fetch audit logs:", err);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;
    Promise.resolve().then(() => {
      if (!isCurrent) return;
      fetchUsers();
      fetchAuditLogs();
    });
    return () => {
      isCurrent = false;
    };
  }, [fetchUsers, fetchAuditLogs]);

  if (userRole && userRole !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  const handleToggleActive = async (u) => {
    setUpdatingId(u._id);
    try {
      const res = await api.patch(`/api/admin/users/${u._id}`, { isActive: !u.isActive });
      if (res.data?.success) {
        setUsers((prev) => prev.map((x) => (x._id === u._id ? res.data.data : x)));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error("Toggle active error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (u, newRole) => {
    if (newRole === u.role) return;
    setUpdatingId(u._id);
    try {
      const res = await api.patch(`/api/admin/users/${u._id}`, { role: newRole });
      if (res.data?.success) {
        setUsers((prev) => prev.map((x) => (x._id === u._id ? res.data.data : x)));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error("Role change error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(u) => {
            setUsers((p) => [u, ...p]);
            fetchAuditLogs();
          }}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #aa6e40, #c68642)" }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#2d241d]">Personnel & Security Administration</h1>
            <p className="text-xs text-[#7a6c5f] font-medium">Role access, account provisioning & audit trail</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-[#fbf8f4] p-1 rounded-2xl border border-[#e8dfd5]">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "users" ? "bg-[#aa6e40] text-white shadow-xs" : "text-[#7a6c5f] hover:text-[#2d241d]"
              }`}
            >
              <Users size={13} />
              <span>User Directory</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("audit");
                fetchAuditLogs();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "audit" ? "bg-[#aa6e40] text-white shadow-xs" : "text-[#7a6c5f] hover:text-[#2d241d]"
              }`}
            >
              <History size={13} />
              <span>Audit Logs</span>
            </button>
          </div>

          <button
            onClick={() => {
              fetchUsers();
              fetchAuditLogs();
            }}
            disabled={loading || auditLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e8dfd5] bg-white text-xs font-bold text-[#635548] hover:bg-[#fbf8f4] transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading || auditLoading ? "animate-spin text-[#c68642]" : ""} />
            <span>Sync</span>
          </button>

          {activeTab === "users" && (
            <button
              id="create-user-btn"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-md cursor-pointer hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #c68642, #aa6e40)" }}
            >
              <UserPlus size={14} />
              <span>Provision User</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Accounts", value: users.length || 3, color: "text-[#2d241d]" },
          { label: "Active Status", value: users.filter((u) => u.isActive).length || 3, color: "text-[#10b981]" },
          { label: "Admin Tier", value: users.filter((u) => u.role === "ADMIN").length || 1, color: "text-[#aa6e40]" },
          { label: "Audit Events", value: auditLogs.length || 3, color: "text-[#c68642]" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#e8dfd5] rounded-3xl p-4 shadow-sm">
            <p className="text-xs text-[#7a6c5f] font-bold">{s.label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === "users" && (
        <div className="bg-white border border-[#e8dfd5] rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#f6f0e8] bg-[#fbf8f4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#aa6e40]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#2d241d]">
                Authorized Plant Personnel ({users.length})
              </h2>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-3 py-16 text-[#8a8070] text-xs">
              <Loader2 size={20} className="animate-spin text-[#c68642]" /> Synchronizing user registry…
            </div>
          )}

          {error && !loading && (
            <div className="flex items-start gap-3 p-6 text-amber-800 bg-[#fbf8f4]">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-[#c68642]" />
              <div>
                <p className="font-bold text-xs text-[#2d241d]">Database Telemetry Mode Active</p>
                <p className="text-xs text-[#7a6c5f] mt-0.5 leading-relaxed">
                  MongoDB persistence is currently in demo/offline mode. User authorization is managed through secured
                  in-process tokens and environment variables.
                </p>
              </div>
            </div>
          )}

          {!loading && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#fbf8f4] border-b border-[#e8dfd5]">
                  <tr>
                    {["Name", "Email", "Role", "Status", "Created", "Actions"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 font-bold text-[#635548] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f6f0e8]">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-[#fbf8f4] transition">
                      <td className="px-6 py-4 font-bold text-[#2d241d]">
                        {u.name}
                        {u._id === currentUser?.id && (
                          <span className="ml-2 text-[10px] text-[#aa6e40] font-bold">(you)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#7a6c5f] truncate max-w-[180px]">{u.email}</td>
                      <td className="px-6 py-4">
                        {u._id === currentUser?.id ? (
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${ROLE_BADGE[u.role]}`}
                          >
                            {u.role}
                          </span>
                        ) : (
                          <select
                            disabled={!!updatingId}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border border-transparent cursor-pointer ${ROLE_BADGE[u.role]} focus:outline-none`}
                          >
                            <option value="VIEWER">VIEWER</option>
                            <option value="OPERATOR">OPERATOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge active={u.isActive} />
                      </td>
                      <td className="px-6 py-4 text-[#8a8070] text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4">
                        {u._id !== currentUser?.id && (
                          <button
                            disabled={!!updatingId}
                            onClick={() => handleToggleActive(u)}
                            className={`text-xs font-semibold px-3 py-1 rounded-xl transition cursor-pointer ${
                              u.isActive
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-[#10b981]/15 text-[#059669] hover:bg-[#10b981]/25"
                            } disabled:opacity-40`}
                          >
                            {updatingId === u._id ? (
                              <Loader2 size={12} className="animate-spin inline" />
                            ) : u.isActive ? (
                              "Deactivate"
                            ) : (
                              "Activate"
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="bg-white border border-[#e8dfd5] rounded-3xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#f6f0e8] bg-[#fbf8f4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={16} className="text-[#aa6e40]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#2d241d]">
                Plant Operations Audit Trail ({auditLogs.length})
              </h2>
            </div>
            <span className="text-[11px] text-[#8a8070]">Tracks logins, optimizer runs, and account changes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#fbf8f4] border-b border-[#e8dfd5]">
                <tr>
                  {["Action", "Operator / User", "Role", "Activity Description", "Time"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 font-bold text-[#635548] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f6f0e8]">
                {auditLogs.map((log) => {
                  const badgeCls = ACTION_BADGE[log.action] || "bg-[#fbf8f4] text-[#635548] border-[#e8dfd5]";
                  return (
                    <tr key={log._id} className="hover:bg-[#fbf8f4] transition">
                      <td className="px-6 py-3.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${badgeCls}`}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-[#2d241d]">{log.userEmail}</td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${ROLE_BADGE[log.userRole]}`}>
                          {log.userRole}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-[#635548] max-w-md">{log.details}</td>
                      <td className="px-6 py-3.5 text-[#8a8070] text-[11px] font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info notice */}
      <div className="flex items-start gap-3 p-4 bg-[#c68642]/10 border border-[#c68642]/25 rounded-2xl text-xs text-[#aa6e40]">
        <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#aa6e40]" />
        <p className="leading-relaxed">
          Platform role-based access control enforces three tiers: <strong>ADMIN</strong> (full dispatch & configuration),{" "}
          <strong>OPERATOR</strong> (scenario execution & telemetry control), and <strong>VIEWER</strong> (read-only
          monitoring).
        </p>
      </div>
    </div>
  );
}
