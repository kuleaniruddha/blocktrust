import { useEffect, useState } from "react";
import { Search, RefreshCw, Filter, ShieldCheck, Download, ExternalLink } from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import TransactionTable from "../../components/Tables/TransactionTable";

export default function Transactions() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [hash, setHash] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    const endpoint = user?.role === "admin"
      ? `/donations${hash ? `?hash=${hash}` : ""}`
      : "/donations/my";

    api.get(endpoint)
      .then((res) => setRows(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to load transactions", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);

  const filteredRows = rows.filter((r) => {
    if (filterMode === "eth") return r.currency === "ETH" || r.paymentMode === "metamask";
    if (filterMode === "upi") return r.currency === "INR" || r.paymentMode === "upi";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-saffron-700 flex items-center gap-1.5 mb-1">
            <ShieldCheck className="h-4 w-4" />
            Public Ledger
          </span>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-stone-900">
            {user?.role === "admin" ? "All Verified Contributions" : "My Transaction Records"}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Immutable records anchored on Ethereum Sepolia and replicated to Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="badge-emerald text-xs">
            {filteredRows.length} Recorded
          </span>
          <button
            onClick={load}
            disabled={loading}
            className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Refresh Ledger"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="panel rounded-2xl p-4 bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            className="input pl-10"
            placeholder="Search by transaction hash or donor name..."
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterMode === "all" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            All ({rows.length})
          </button>
          <button
            onClick={() => setFilterMode("eth")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterMode === "eth" ? "bg-white text-amber-700 shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Ethereum / Web3
          </button>
          <button
            onClick={() => setFilterMode("upi")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterMode === "upi" ? "bg-white text-emerald-700 shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            UPI QR
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <TransactionTable rows={filteredRows} />
    </div>
  );
}
