import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeIndianRupee,
  ShieldCheck,
  Wallet,
  Trophy,
  Activity,
  ArrowRight
} from "lucide-react";
import { api } from "../../services/api";
import { money } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dashRes, donRes, campRes] = await Promise.all([
          api.get("/dashboard").catch(() => ({ data: null })),
          api.get("/donations").catch(() => ({ data: [] })),
          api.get("/campaigns").catch(() => ({ data: [] }))
        ]);

        setDashboardData(dashRes.data);
        setDonations(Array.isArray(donRes.data) ? donRes.data : []);
        setCampaigns(Array.isArray(campRes.data) ? campRes.data : []);
      } catch (err) {
        console.error("Failed loading home data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const metrics = dashboardData?.metrics || {
    totalDonations: 0,
    totalExpenses: 0,
    remainingBalance: 0
  };

  // Group and calculate top donors in-memory (unified in INR)
  const donorContributions = donations.reduce((acc, d) => {
    if (d.status !== "confirmed" && d.status !== "approved") return acc;
    const name = d.donorName || "Anonymous";
    
    // Approximate conversion rate: 1 ETH = 3,00,000 INR for ranking
    const amountInInr = d.currency === "ETH" ? Number(d.amount) * 300000 : Number(d.amount);

    if (!acc[name]) {
      acc[name] = { name, total: 0, ethTotal: 0, inrTotal: 0 };
    }
    acc[name].total += amountInInr;
    if (d.currency === "ETH") {
      acc[name].ethTotal += Number(d.amount);
    } else {
      acc[name].inrTotal += Number(d.amount);
    }
    return acc;
  }, {});

  const topDonors = Object.values(donorContributions)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // Get top 5 donors

  return (
    <div className="space-y-10">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-stone-900 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('/ram_mandir.png')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/80 to-transparent"></div>
        
        <div className="relative z-10 max-w-3xl p-8 sm:p-12 lg:p-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-saffron/20 px-3.5 py-1.5 text-xs font-bold text-amber-300 border border-saffron/30 mb-4 backdrop-blur-sm">
            <ShieldCheck className="h-4 w-4 text-saffron" />
            100% On-Chain Transparent Ledger
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl text-amber-100 leading-tight">
            Shri Ram Mandir Trust
          </h1>
          <p className="mt-4 text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl">
            Welcome to the official transparent crowdfunding portal of the Shri Ram Mandir Trust. Every single contribution is permanently recorded on-chain, providing absolute accountability on how funds are received and utilized.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {user ? (
              <Link className="btn bg-saffron hover:bg-clay text-white font-bold px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2" to="/donate">
                <BadgeIndianRupee className="h-5 w-5" />
                Make a Contribution
              </Link>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Link className="btn bg-saffron hover:bg-clay text-white font-bold px-6 py-3 rounded-xl shadow-lg transition flex items-center gap-2" to="/login">
                  <Wallet className="h-5 w-5" />
                  Log In to Contribute
                </Link>
                <Link className="btn bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl backdrop-blur border border-white/20 transition flex items-center gap-2" to="/register">
                  Register Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Fund Usage Progress Section (Target Tracker Campaigns) */}
      <section className="panel rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-saffron font-bold text-xs uppercase tracking-wider mb-1">
            <Activity className="h-4 w-4" />
            Live Project Crowdfunding Campaigns
          </div>
          <h2 className="text-2xl font-black text-ink">Active Donation Drives</h2>
          <p className="text-sm text-stone-600 mt-1">
            Track active fundraising campaigns set by the Admin and choose where you would like to allocate your donation.
          </p>
        </div>

        <div className="space-y-8">
          {campaigns.length === 0 ? (
            // Fallback General Progress tracker if no campaigns exist yet
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-bold text-stone-700">
                <span>General Fund Raised: <strong className="text-emerald-700 text-lg">{money(metrics.totalDonations)}</strong></span>
                <span>Target: <strong className="text-stone-900 text-lg">{money(1500000)}</strong></span>
              </div>
              <div className="w-full bg-stone-200 h-5 rounded-full overflow-hidden shadow-inner relative flex items-center">
                <div
                  className="bg-saffron h-full rounded-full transition-all duration-700 flex items-center justify-end pr-3 text-xs font-black text-white"
                  style={{ width: `${Math.min(100, Math.round((metrics.totalDonations / 1500000) * 100))}%` }}
                >
                  {Math.min(100, Math.round((metrics.totalDonations / 1500000) * 100))}%
                </div>
              </div>
            </div>
          ) : (
            // Render active campaigns from database
            campaigns.map((camp) => {
              const raised = camp.raisedAmount || 0;
              const target = camp.targetAmount || 1;
              const percent = Math.min(100, Math.round((raised / target) * 100));
              const remaining = Math.max(0, target - raised);
              
              return (
                <div key={camp._id || camp.title} className="p-5 border border-stone-200 rounded-xl bg-stone-50/50 hover:bg-stone-50 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-stone-900">{camp.title}</h3>
                      <p className="text-xs text-stone-500">{camp.description || "No description provided."}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
                        {camp.status || "active"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-stone-600">
                      <span>Raised: <strong className="text-emerald-700">{money(raised)}</strong></span>
                      <span>Target: <strong className="text-stone-900">{money(target)}</strong></span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-stone-200 h-5 rounded-full overflow-hidden shadow-inner relative flex items-center">
                      <div
                        className="bg-saffron h-full rounded-full transition-all duration-700 flex items-center justify-end pr-3 text-xs font-black text-white"
                        style={{ width: `${Math.max(8, percent)}%` }}
                      >
                        {percent}%
                      </div>
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium flex justify-between">
                      <span>Remaining needed: {money(remaining)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 3. Top Donors Section */}
      <section className="panel rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 text-saffron font-bold text-xs uppercase tracking-wider mb-1">
            <Trophy className="h-4 w-4" />
            Honorable Contributors
          </div>
          <h2 className="text-2xl font-black text-ink">Top Donors</h2>
          <p className="text-sm text-stone-600 mt-1">
            Recognizing the leading contributors who have helped support the temple construction and welfare services.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-sm text-stone-500 col-span-full py-4 text-center">Loading top contributors...</p>
          ) : topDonors.length === 0 ? (
            <p className="text-sm text-stone-500 col-span-full py-4 text-center">No donations recorded yet.</p>
          ) : (
            topDonors.map((donor, idx) => (
              <div
                key={donor.name}
                className="rounded-xl border border-stone-200 p-5 bg-gradient-to-br from-amber-50/20 to-white flex items-center gap-4 hover:shadow-md transition"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-saffron font-black text-lg">
                  #{idx + 1}
                </div>
                <div>
                  <h3 className="font-black text-stone-900 text-base">{donor.name}</h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Total:{" "}
                    <strong className="text-emerald-700">
                      {donor.inrTotal > 0 && donor.ethTotal > 0
                        ? `${money(donor.inrTotal)} + ${donor.ethTotal.toFixed(3)} ETH`
                        : donor.ethTotal > 0
                        ? `${donor.ethTotal.toFixed(3)} ETH`
                        : money(donor.inrTotal)}
                    </strong>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
