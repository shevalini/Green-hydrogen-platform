import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="p-12 max-w-lg mx-auto text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
        <AlertCircle size={28} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">404 - Page Not Found</h2>
      <p className="text-sm text-slate-500">
        The requested route does not exist on the Green Hydrogen Platform.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
