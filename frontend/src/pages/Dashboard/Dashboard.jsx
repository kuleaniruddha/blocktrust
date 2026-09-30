import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  ExternalLink,
  ShieldCheck,
  Wallet,
  Lock,
  BadgeCheck,
  Activity,
  Users,
  CheckCircle2,
  Globe,
  BadgeIndianRupee,
  ArrowRight,
  QrCode
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import MetricCard from "../../components/Cards/MetricCard";
import DashboardCharts from "../../components/Charts/DashboardCharts";
import TransactionTable from "../../components/Tables/TransactionTable";
import { money } from "../../utils/format";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [myDonations, setMyDonations] = useState([]);
  const [loadingMy, setLoadingMy] = useState(false);

  useEffect(() => {
    api.get("/dashboard").then((res) => setData(res.data)).catch(console.error);
    api.get("/analytics").then((res) => setAnalytics(res.data)).catch(console.error);

    if (user) {
      setLoadingMy(true);
      api.get("/donations/my")
        .then((res) => setMyDonations(Array.isArray(res.data) ? res.data : []))
        .catch((err) => console.error("Failed fetching user donations", err))
        .finally(() => setLoadingMy(false));
    }
  }, [user]);

  const m = data?.metrics || {};

  const downloadReceipt = (donationId) => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.open(`${apiUrl}/donation/${donationId}/receipt`, "_blank");
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0d121c] p-6 sm:p-8 text-white shadow-xl border border-stone-800">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Real-Time Audit & Tracking Console</span>
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-amber-50">
              {user ? `Namaste, ${user.name || "Devotee"}` : "Trust Dashboard & Transparent Ledger"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
              {user
                ? "Manage your individual contributions, retrieve verifiable cryptographic receipts, and monitor temple expenditures."
                : "Real-time visibility into all public funds, temple construction allocations, and verified on-chain disbursements."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5">
            {!user ? (
              <Link
                className="btn btn-primary text-xs font-bold px-5 py-2.5 shadow-md flex items-center justify-center gap-2"
                to="/login"
              >
                <Lock className="h-4 w-4" />
                Login to Track My Donations
              </Link>
            ) : (
              <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15 backdrop-blur-sm text-xs space-y-1">
                <div className="flex items-center gap-2 text-stone-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>Active Session:</span>
                  <strong className="text-amber-200">{user.email}</strong>
                </div>
                <div className="text-[11px] text-amber-300/80 font-bold uppercase tracking-wider">
                  Role: {user.role} Account
                </div>
              </div>
            )}

            {user?.role !== "admin" && (
              <Link
                to="/donate"
                className="btn bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2 px-4 rounded-xl border border-white/15 transition flex items-center justify-center gap-1.5"
              >
                <BadgeIndianRupee className="h-3.5 w-3.5 text-amber-300" />
                Make New Contribution
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. User Personal Tracked Donations Section (When Logged in as Donor) */}
      {user && user.role !== "admin" && (
        <div className="panel rounded-3xl p-6 sm:p-7 border border-amber-200/90 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
            <div>
              <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-saffron-600" />
                My Verified Contributions ({myDonations.length})
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Your personal contribution ledger with cryptographic PDF receipts and on-chain explorer links.
              </p>
            </div>
            <Link
              to="/donate"
              className="btn btn-primary text-xs px-3.5 py-2 font-bold shadow-xs self-start sm:self-auto"
            >
              + Donate Again
            </Link>
          </div>

          {loadingMy ? (
            <p className="text-xs text-stone-400 py-6 text-center">Loading your contributions...</p>
          ) : myDonations.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-600 bg-white rounded-2xl border border-stone-200/90 space-y-2">
              <p className="font-semibold text-stone-800">You haven't made any donations under this account yet.</p>
              <p className="text-stone-400">Every donation made via MetaMask or UPI will be automatically linked here.</p>
              <Link to="/donate" className="btn btn-primary text-xs font-bold mt-2 inline-flex">
                Make your first donation
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
              <table className="w-full text-left text-sm text-stone-700">
                <thead className="bg-stone-50 text-[11px] font-black text-stone-600 uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3">Receipt No</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Blockchain Tx</th>
                    <th className="px-4 py-3 text-right">Download PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {myDonations.map((d) => {
                    const docId = d._id || d.id;
                    const isEth = d.currency === "ETH" || d.paymentMode === "metamask";

                    return (
                      <tr key={docId || d.receiptNumber} className="hover:bg-amber-50/40 transition">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-stone-900">
                          {d.receiptNumber || "BT-RECEIPT"}
                        </td>
                        <td className="px-4 py-3 font-black text-xs text-emerald-800">
                          {isEth ? `${d.amount} ETH` : money(d.amount)}
                        </td>
                        <td className="px-4 py-3 text-xs text-stone-600 max-w-xs truncate font-medium">
                          {d.purpose || "Shri Ram Mandir Trust"}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="inline-flex items-center gap-1 font-bold text-[11px] bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                            {isEth ? <Wallet className="h-3 w-3 text-amber-600" /> : <QrCode className="h-3 w-3 text-emerald-600" />}
                            {d.paymentMode || (isEth ? "metamask" : "upi")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono">
                          {d.transactionHash ? (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${d.transactionHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-saffron-700 hover:text-saffron-900 hover:underline flex items-center gap-1 font-bold"
                            >
                              {d.transactionHash.substring(0, 10)}...
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-stone-400 italic">Off-Chain UPI</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            className="btn btn-primary text-xs py-1 px-3 rounded-lg flex items-center gap-1.5 ml-auto shadow-xs"
                            onClick={() => downloadReceipt(docId)}
                          >
                            <Download className="h-3.5 w-3.5" />
                            Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. Metrics Row with Rich Icon Cards */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          label="Total Donations"
          value={money(m.totalDonations)}
          tone="text-emerald-700 font-extrabold"
          icon={BadgeIndianRupee}
        />
        <MetricCard
          label="Total Expenses"
          value={money(m.totalExpenses)}
          tone="text-amber-800 font-extrabold"
          icon={Activity}
        />
        <MetricCard
          label="Vault Balance"
          value={money(m.remainingBalance)}
          tone="text-blue-800 font-extrabold"
          icon={Lock}
        />
        <MetricCard
          label="Total Donors"
          value={m.donors || 0}
          tone="text-saffron-700 font-extrabold"
          icon={Users}
        />
        <MetricCard
          label="Transactions"
          value={m.donationCount || 0}
          tone="text-stone-900 font-extrabold"
          icon={CheckCircle2}
        />
        <MetricCard
          label="Active Chain"
          value={data?.network || "Sepolia"}
          tone="text-stone-900 font-extrabold"
          icon={Globe}
        />
      </div>

      {/* 4. Analytics Visual Charts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <Activity className="h-4 w-4 text-saffron-700" />
            Financial Breakdown & Monthly Inflow
          </h2>
          <span className="text-xs text-stone-400">Updated in real-time</span>
        </div>
        <DashboardCharts analytics={analytics} />
      </div>

      {/* 5. Funds Flow: Funds Added vs Funds Spent */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Recent Public Donations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Recent Inflow (Donations)
            </h3>
            <Link to="/transactions" className="text-xs font-bold text-saffron-700 hover:underline">
              View All →
            </Link>
          </div>
          <TransactionTable rows={data?.recentTransactions || []} />
        </div>

        {/* Right Column: Recent Verified Expenditures */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              Recent Outflow (Expenditures)
            </h3>
            <Link to="/expenses" className="text-xs font-bold text-saffron-700 hover:underline">
              View All Audits →
            </Link>
          </div>

          <div className="panel rounded-2xl border border-stone-200/90 overflow-hidden divide-y divide-stone-100 bg-white shadow-card">
            {(!data?.recentExpenses || data.recentExpenses.length === 0) ? (
              <div className="p-8 text-center text-xs text-stone-500 space-y-1">
                <p className="font-bold text-stone-700">No verified expenditures logged yet.</p>
                <p className="text-stone-400">Expenses logged by Admin will appear with category details here.</p>
              </div>
            ) : (
              data.recentExpenses.map((exp) => (
                <div key={exp._id || exp.id} className="p-4 flex justify-between items-center hover:bg-amber-50/20 transition">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{exp.title}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      <span className="font-semibold text-amber-800">{exp.category}</span>
                      {exp.vendor && <span> · {exp.vendor}</span>}
                      <span> · <span className="uppercase text-[10px] font-extrabold text-stone-400">{exp.status || "approved"}</span></span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-stone-900 text-sm">{money(exp.amount)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
