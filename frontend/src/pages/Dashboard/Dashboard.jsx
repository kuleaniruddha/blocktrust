import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, ExternalLink, ShieldCheck, Wallet, Lock, BadgeCheck } from "lucide-react";
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
    <div className="grid gap-8">
      {/* Top Welcome / Auth Banner */}
      <div className="panel rounded-xl p-6 bg-gradient-to-r from-stone-900 to-stone-800 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-saffron font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="h-4 w-4" />
            Shri Ram Mandir Trust Analytics
          </div>
          <h1 className="text-2xl font-black text-amber-100">
            {user ? `Welcome back, ${user.name || user.email}` : "Trust Dashboard & Donation Tracker"}
          </h1>
          <p className="text-xs text-stone-300 mt-1">
            {user
              ? "Track your individual contributions, download cryptographic receipts, and view live trust performance."
              : "Login to access your personal donation history, download receipts, and track contributions on-chain."}
          </p>
        </div>

        {!user ? (
          <div className="flex items-center gap-3">
            <Link className="btn bg-saffron text-white hover:bg-clay text-sm font-bold px-4 py-2" to="/login">
              <Lock className="h-4 w-4" />
              Login to Track My Donations
            </Link>
          </div>
        ) : (
          <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20 text-xs text-stone-200">
            Donor Account: <span className="font-bold text-amber-300">{user.email}</span>
          </div>
        )}
      </div>

      {/* User Specific Donations Section */}
      {user && user.role !== "admin" && (
        <div className="panel rounded-xl p-6 border border-amber-200 bg-amber-50/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
            <div>
              <h2 className="text-xl font-black text-ink flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-saffron" />
                My Tracked Donations
              </h2>
              <p className="text-xs text-stone-600">Your personal contribution history and downloadable PDF receipts.</p>
            </div>
            <Link to="/donate" className="btn bg-saffron text-white hover:bg-clay text-xs px-3 py-1.5 font-bold">
              + Donate Again
            </Link>
          </div>

          {loadingMy ? (
            <p className="text-sm text-stone-500 py-4">Loading your donations...</p>
          ) : myDonations.length === 0 ? (
            <div className="p-6 text-center text-sm text-stone-600 bg-white rounded-lg border border-stone-200">
              <p>You haven't made any recorded donations yet under this account.</p>
              <Link to="/donate" className="text-saffron font-bold underline mt-2 inline-block">
                Make your first donation to Ram Mandir Trust
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
              <table className="w-full text-left text-sm text-stone-700">
                <thead className="bg-stone-100 text-xs font-bold text-stone-700 uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3">Receipt No</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Mode</th>
                    <th className="px-4 py-3">Blockchain Tx</th>
                    <th className="px-4 py-3 text-right">Receipt PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {myDonations.map((d) => (
                    <tr key={d._id || d.receiptNumber} className="hover:bg-amber-50/40 transition">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-stone-900">{d.receiptNumber || "N/A"}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        {d.currency === "ETH" ? `${d.amount} ETH` : money(d.amount)}
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-600 max-w-xs truncate">{d.purpose || "Shri Ram Mandir Trust"}</td>
                      <td className="px-4 py-3 text-xs font-semibold uppercase">{d.paymentMode || "metamask"}</td>
                      <td className="px-4 py-3 text-xs font-mono">
                        {d.transactionHash ? (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${d.transactionHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-saffron hover:underline flex items-center gap-1"
                          >
                            {d.transactionHash.substring(0, 10)}...
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-stone-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="btn bg-saffron text-white hover:bg-clay text-xs py-1 px-3 rounded flex items-center gap-1.5 ml-auto shadow-sm"
                          onClick={() => downloadReceipt(d._id)}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Donations" value={money(m.totalDonations)} tone="text-leaf" />
        <MetricCard label="Expenses" value={money(m.totalExpenses)} tone="text-clay" />
        <MetricCard label="Balance" value={money(m.remainingBalance)} />
        <MetricCard label="Donors" value={m.donors || 0} />
        <MetricCard label="Transactions" value={m.donationCount || 0} />
        <MetricCard label="Network" value={data?.network || "Sepolia"} />
      </div>

      {/* Analytics Charts */}
      <DashboardCharts analytics={analytics} />

      {/* Funds Flow Tracking (Added vs Spent) */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Funds Added: Recent Public Transactions */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Where Funds Are Getting Added (Recent Donations)
          </h3>
          <TransactionTable rows={data?.recentTransactions || []} />
        </div>

        {/* Funds Spent: Recent Verified Expenditures */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-ink flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Where Funds Are Going (Recent Expenditures)
          </h3>
          <div className="panel rounded-xl border border-stone-200 overflow-hidden divide-y divide-stone-200 bg-white">
            {(!data?.recentExpenses || data.recentExpenses.length === 0) ? (
              <p className="p-6 text-center text-xs text-stone-500">No verified expenditures logged yet.</p>
            ) : (
              data.recentExpenses.map((exp) => (
                <div key={exp._id} className="p-4 flex justify-between items-center hover:bg-stone-50/50 transition">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{exp.title}</h4>
                    <p className="text-xs text-stone-500">{exp.category} · {exp.status || "Approved"}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-amber-900 text-sm">{money(exp.amount)}</span>
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
