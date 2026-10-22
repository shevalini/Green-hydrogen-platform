const STATUS_CLASSES = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  fault: "bg-red-50 text-red-700 border-red-200",
  neutral: "bg-slate-50 text-slate-700 border-slate-200",
};

export function getIndustrialStatusClasses(status) {
  const normalizedStatus = String(status ?? "").toUpperCase();

  if (/\b(FAULT(?:ED)?|ERROR|CRITICAL|OFFLINE|INACTIVE|FAILED|FAILURE|TRIP|EMERGENCY|ALARM)\b/.test(normalizedStatus)) {
    return STATUS_CLASSES.fault;
  }

  if (/\b(DEMO|SIMULATED?|WARNING|WARN|DISCONNECTED|VOLATILE|DEGRADED|CAUTION)\b|IN-MEMORY/.test(normalizedStatus)) {
    return STATUS_CLASSES.warning;
  }

  if (/\b(ACTIVE|RUNNING|ONLINE|LIVE|NOMINAL|OPTIMAL|CONNECTED|SAFE|SUPPLYING|ARM-READY|OPERATIONAL)\b/.test(normalizedStatus)) {
    return STATUS_CLASSES.active;
  }

  return STATUS_CLASSES.neutral;
}
