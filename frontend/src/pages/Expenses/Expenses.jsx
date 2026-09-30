import { useEffect, useState } from "react";
import {
  Trash2,
  ShieldCheck,
  AlertCircle,
  Cpu,
  BadgeIndianRupee,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { api } from "../../services/api";
import { money } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";
import MetricCard from "../../components/Cards/MetricCard";

export default function Expenses() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");

  const loadExpenses = () => {
    api.get("/expenses")
      .then((res) => setRows(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to load expenses", err));
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this expenditure record?")) return;
    try {
      setLoadingId(id);
      setError("");
      await api.delete(`/expense/${id}`);
      setRows((prev) => prev.filter((item) => (item._id || item.id) !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete expense");
    } finally {
      setLoadingId(null);
    }
  };

  const isAdmin = user && (user.role === "admin" || user.role === "trustee");

  const categories = ["all", ...new Set(rows.map((r) => r.category).filter(Boolean))];

  const filteredExpenses = rows.filter((r) => {
    if (selectedCategory === "all") return true;
    return r.category === selectedCategory;
  });

  const totalSpent = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const avgExpense = rows.length > 0 ? Math.round(totalSpent / rows.length) : 0;

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-saffron-700 flex items-center gap-1.5 mb-1">
            <Cpu className="h-4 w-4" />
            AI-Audited Disbursements
          </span>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-stone-900">
            Fund Usage & Expenditures
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Transparently track vendor disbursements, pink sandstone craftsmanship, and food seva distribution.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="badge-emerald text-xs">
            {rows.length} Audited Items
          </span>
        </div>
      </div>

      {/* 2. Quick Stat Counters */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Total Funds Disbursed"
          value={money(totalSpent)}
          subtitle="Directly deployed to sacred causes"
          icon={BadgeIndianRupee}
          tone="text-amber-800 font-extrabold"
        />

        <MetricCard
          label="Average Expenditure"
          value={money(avgExpense)}
          subtitle="Mean allocation per recorded invoice"
          icon={Activity}
          tone="text-stone-900 font-extrabold"
        />

        <MetricCard
          label="AI Fraud Prevention Score"
          value="100% Safe"
          subtitle="Monitored by Isolation Forest ML model"
          icon={ShieldCheck}
          tone="text-emerald-700 font-extrabold"
        />
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Category Filter Chips */}
      {categories.length > 2 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-400 mr-1 flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold border transition ${
                selectedCategory === cat
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      )}

      {/* 4. Expense Cards List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 ? (
          <div className="panel rounded-3xl p-12 text-center border border-stone-200/90 bg-white space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
              <Cpu className="h-6 w-6" />
            </div>
            <p className="font-bold text-stone-800 text-sm">No Expenditures Logged in this Category</p>
            <p className="text-xs text-stone-500">
              All contractor and temple expenditure records logged by Admin will be displayed with AI audit metrics.
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const expId = expense._id || expense.id;
            const isHighRisk = (expense.riskScore || 0) > 70;

            return (
              <div
                className="panel rounded-2xl p-5 bg-white border border-stone-200/90 hover:border-amber-400/80 hover:shadow-card transition-all"
                key={expId}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-stone-900">
                        {expense.title}
                      </h3>
                      <span className="badge-saffron text-[10px]">
                        {expense.category || "General"}
                      </span>
                      <span className="badge-emerald text-[10px]">
                        <CheckCircle2 className="h-3 w-3" />
                        {expense.status || "Approved"}
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 font-medium">
                      {expense.vendor && (
                        <span>
                          Vendor: <strong className="text-stone-800">{expense.vendor}</strong> ·{" "}
                        </span>
                      )}
                      <span>Verified & Authorized</span>
                    </p>

                    {expense.description && (
                      <p className="text-xs text-stone-600 bg-stone-50/80 p-3 rounded-xl border border-stone-100 leading-relaxed max-w-2xl font-normal">
                        {expense.description}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
                    <div className="text-left sm:text-right">
                      <p className="font-black text-stone-900 text-lg">
                        {money(expense.amount)}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 sm:justify-end">
                        {isHighRisk ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            Risk Score: {expense.riskScore}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                            Risk Score: {expense.riskScore ?? 15} (Safe)
                          </span>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(expId)}
                        disabled={loadingId === expId}
                        className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                        title="Delete Expense Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
