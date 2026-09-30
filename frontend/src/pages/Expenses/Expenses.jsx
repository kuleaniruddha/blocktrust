import { useEffect, useState } from "react";
import { Trash2, ShieldCheck, AlertCircle } from "lucide-react";
import { api } from "../../services/api";
import { money } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

export default function Expenses() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
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
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
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

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">Fund Usage & Expenditures</h1>
          <p className="text-xs text-stone-500">Track how temple donations are deployed with AI audit logs.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          {error}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="panel rounded-xl p-8 text-center border border-stone-200 bg-white">
          <p className="text-stone-600 text-sm">No expenditures logged yet for the trust.</p>
        </div>
      ) : (
        rows.map((expense) => {
          const expId = expense._id || expense.id;
          return (
            <div className="panel rounded-lg p-4 bg-white border border-stone-200 hover:border-amber-300 transition shadow-sm" key={expId}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-stone-900">{expense.title}</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-stone-100 text-stone-700 border border-stone-200">
                      {expense.status || "verified"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Category: <span className="font-semibold text-stone-700">{expense.category}</span>
                    {expense.vendor && <span> · Vendor: <span className="text-stone-700">{expense.vendor}</span></span>}
                  </p>
                  {expense.description && (
                    <p className="text-xs text-stone-600 mt-2 bg-stone-50 p-2 rounded border border-stone-100">
                      {expense.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-black text-amber-900 text-base">{money(expense.amount)}</p>
                    <p className={expense.riskScore > 70 ? "text-xs font-bold text-red-700" : "text-xs text-stone-500"}>
                      Risk Score: {expense.riskScore ?? 0}
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(expId)}
                      disabled={loadingId === expId}
                      className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
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
  );
}
