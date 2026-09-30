import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeIndianRupee,
  ShieldCheck,
  Wallet,
  Trophy,
  Activity,
  ArrowRight,
  Cpu,
  Lock,
  FileCheck,
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle2
} from "lucide-react";
import { api } from "../../services/api";
import { money } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";
import MetricCard from "../../components/Cards/MetricCard";

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
    remainingBalance: 0,
    donationCount: 0,
    donors: 0
  };

  // Group top donors
  const donorContributions = donations.reduce((acc, d) => {
    if (d.status !== "confirmed" && d.status !== "approved") return acc;
    const name = d.donorName || "Anonymous Devotee";
    const amountInInr = d.currency === "ETH" ? Number(d.amount) * 300000 : Number(d.amount);

    if (!acc[name]) {
      acc[name] = { name, total: 0, ethTotal: 0, inrTotal: 0, count: 0 };
    }
    acc[name].total += amountInInr;
    acc[name].count += 1;
    if (d.currency === "ETH") {
      acc[name].ethTotal += Number(d.amount);
    } else {
      acc[name].inrTotal += Number(d.amount);
    }
    return acc;
  }, {});

  const topDonors = Object.values(donorContributions)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  return (
    <div className="space-y-12">
      {/* 1. Hero Section with Spiritual Radiant Lighting */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0c1017] text-white shadow-2xl border border-stone-800">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-saffron-600/10 blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('/ram_mandir.png')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1017] via-[#0c1017]/90 to-transparent"></div>

        <div className="relative z-10 max-w-4xl p-8 sm:p-12 lg:p-16 space-y-6">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300 border border-amber-500/30 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>100% On-Chain Cryptographic Ledger • Sepolia Active</span>
          </div>

          <div className="space-y-2">
            <p className="font-cinzel text-xs font-extrabold tracking-widest uppercase text-amber-400">
              Shri Ram Janmabhoomi Teerth Kshetra
            </p>
            <h1 className="font-cinzel text-4xl sm:text-6xl font-black tracking-tight text-amber-50 leading-tight">
              Shri Ram Mandir Trust
            </h1>
          </div>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl font-normal">
            Welcome to the official digital transparency portal. Utilizing Ethereum smart contracts and AI-assisted audit checks, every rupee and Wei contributed towards the sacred mandir, pilgrim seva, and Annakshetra is publicly verifiable forever.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {user ? (
              <Link
                className="btn btn-primary text-sm font-bold px-6 py-3.5 shadow-glow rounded-xl flex items-center gap-2"
                to="/donate"
              >
                <BadgeIndianRupee className="h-5 w-5" />
                Make a Contribution
              </Link>
            ) : (
              <>
                <Link
                  className="btn btn-primary text-sm font-bold px-6 py-3.5 shadow-glow rounded-xl flex items-center gap-2"
                  to="/login"
                >
                  <Wallet className="h-5 w-5" />
                  Log In to Contribute
                </Link>
                <Link
                  className="btn bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-xl backdrop-blur border border-white/20 transition flex items-center gap-2 text-sm"
                  to="/register"
                >
                  Create Donor Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}

            <Link
              to="/transactions"
              className="btn text-xs font-bold text-amber-300 hover:text-white px-4 py-3 flex items-center gap-1.5 transition"
            >
              Verify Public Ledger
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Live Key Performance Metrics Bar */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Collected"
          value={money(metrics.totalDonations)}
          subtitle="All-time verified contributions"
          icon={BadgeIndianRupee}
          tone="text-emerald-700 font-extrabold"
          badge="100% Reconciled"
        />

        <MetricCard
          label="Verified Disbursed"
          value={money(metrics.totalExpenses)}
          subtitle="Disbursed for construction & seva"
          icon={Activity}
          tone="text-amber-700 font-extrabold"
          badge="AI Audited"
        />

        <MetricCard
          label="Treasury Balance"
          value={money(metrics.remainingBalance)}
          subtitle="Available in multisig vault"
          icon={Lock}
          tone="text-blue-800 font-extrabold"
          badge="Multi-Sig Vault"
        />

        <MetricCard
          label="Honorable Donors"
          value={metrics.donors || donations.length || "1"}
          subtitle="Registered devout contributors"
          icon={Trophy}
          tone="text-saffron-700 font-extrabold"
          badge="Global Community"
        />
      </section>

      {/* 3. The 4 Pillars of BlockTrust Architectural Transparency */}
      <section className="panel rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-saffron-700 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Cryptographic Integrity
            </span>
            <h2 className="text-2xl font-black text-stone-900 mt-1">
              How Transparency is Guaranteed
            </h2>
          </div>
          <p className="text-xs text-stone-500 max-w-md">
            Combining Ethereum Sepolia blockchain with real-time Firebase syncing and AI expenditure risk checks.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-2.5 hover:border-amber-300 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-saffron-700 font-bold">
              <BadgeIndianRupee className="h-5 w-5" />
            </div>
            <h3 className="font-black text-stone-900 text-sm">1. Multi-Modal Giving</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Donate via MetaMask Web3 (ETH) or scan Instant UPI QR codes (GPay, PhonePe, BHIM) securely.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-2.5 hover:border-amber-300 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-black text-stone-900 text-sm">2. Smart Contract Vault</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every on-chain Wei is locked into the verified Solidity Treasury contract with role-based governance.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-2.5 hover:border-amber-300 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="font-black text-stone-900 text-sm">3. AI Anomaly Audit</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Vendor expenditures are audited by Python ML Isolation Forest to flag irregular pricing or vendor risks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-2.5 hover:border-amber-300 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold">
              <FileCheck className="h-5 w-5" />
            </div>
            <h3 className="font-black text-stone-900 text-sm">4. Cryptographic Receipts</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Instant downloadable PDF receipts with digital serial signatures, transaction hashes, and QR verification.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Active Donation Drives (Target Campaigns) */}
      <section className="panel rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-saffron-700 font-bold text-xs uppercase tracking-wider mb-1">
              <Flame className="h-4 w-4 text-emerald-600" />
              Live Crowdfunding Drives
            </div>
            <h2 className="text-2xl font-black text-stone-900">Active Mandir Campaigns</h2>
            <p className="text-xs text-stone-500 mt-1">
              Direct your contributions toward specific sacred goals established by the Trust.
            </p>
          </div>

          <Link
            to="/donate"
            className="btn btn-secondary text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View All & Donate</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-stone-700">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  General Mandir Infrastructure Fund
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  Target: <strong className="text-stone-900">{money(1500000)}</strong>
                </span>
              </div>
              <div className="w-full bg-stone-200 h-4 rounded-full overflow-hidden shadow-inner flex items-center">
                <div
                  className="bg-gradient-to-r from-saffron-500 to-amber-500 h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2 text-[10px] font-black text-white"
                  style={{ width: `${Math.max(10, Math.min(100, Math.round((metrics.totalDonations / 1500000) * 100)))}%` }}
                >
                  {Math.round((metrics.totalDonations / 1500000) * 100)}%
                </div>
              </div>
              <div className="flex justify-between text-xs text-stone-500 font-medium">
                <span>Raised so far: <strong className="text-emerald-700">{money(metrics.totalDonations)}</strong></span>
                <span>Open for all devotees</span>
              </div>
            </div>
          ) : (
            campaigns.map((camp) => {
              const raised = camp.raisedAmount || 0;
              const target = camp.targetAmount || 1;
              const percent = Math.min(100, Math.round((raised / target) * 100));
              const remaining = Math.max(0, target - raised);

              return (
                <div
                  key={camp._id || camp.title}
                  className="p-6 border border-stone-200/90 rounded-2xl bg-gradient-to-r from-stone-50/70 to-white hover:border-amber-300 transition-all shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-stone-900">{camp.title}</h3>
                        <span className="badge-emerald text-[10px]">
                          {camp.status || "Active Drive"}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        {camp.description || "Support the construction and seva of Shri Ram Mandir."}
                      </p>
                    </div>

                    <div className="text-right sm:text-right">
                      <p className="text-xs text-stone-400 font-semibold uppercase">Target Goal</p>
                      <p className="text-base font-black text-stone-900">{money(target)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-xs font-bold text-stone-600">
                      <span>Raised: <strong className="text-emerald-700">{money(raised)}</strong></span>
                      <span>Target: <strong className="text-stone-900">{money(target)}</strong></span>
                    </div>

                    <div className="w-full bg-stone-200 h-3.5 rounded-full overflow-hidden shadow-inner flex items-center">
                      <div
                        className="bg-gradient-to-r from-saffron-500 via-amber-500 to-saffron-600 h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2 text-[10px] font-black text-white shadow-xs"
                        style={{ width: `${Math.max(8, percent)}%` }}
                      >
                        {percent}%
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500 font-medium flex justify-between items-center">
                      <span>Remaining needed: <strong className="text-stone-800">{money(remaining)}</strong></span>
                      <Link to="/donate" className="text-saffron-700 hover:underline font-bold text-xs">
                        Contribute to this drive →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 5. Honorable Contributors (Leaderboard) */}
      <section className="panel rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 bg-white">
        <div>
          <div className="inline-flex items-center gap-2 text-saffron-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Trophy className="h-4 w-4 text-amber-500" />
            Leading Benefactors
          </div>
          <h2 className="text-2xl font-black text-stone-900">Honorable Contributors</h2>
          <p className="text-xs text-stone-500 mt-1">
            Recognizing devout donors leading the way in temple development and charitable seva.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-sm text-stone-400 col-span-full py-8 text-center">
              Fetching verified contributors...
            </p>
          ) : topDonors.length === 0 ? (
            <div className="col-span-full p-8 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-stone-200">
              No public donations recorded yet. Be the first to contribute!
            </div>
          ) : (
            topDonors.map((donor, idx) => (
              <div
                key={donor.name}
                className="group rounded-2xl border border-stone-200/90 p-5 bg-gradient-to-br from-amber-50/30 to-white flex items-center gap-4 hover:border-amber-400/80 hover:shadow-card transition-all"
              >
                <div
                  className={`flex items-center justify-center h-12 w-12 rounded-2xl font-black text-sm shadow-xs ${
                    idx === 0
                      ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 ring-4 ring-amber-100"
                      : idx === 1
                      ? "bg-gradient-to-tr from-slate-200 to-slate-100 text-slate-800 ring-4 ring-slate-100"
                      : idx === 2
                      ? "bg-gradient-to-tr from-amber-700 to-amber-600 text-white ring-4 ring-amber-100"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  #{idx + 1}
                </div>

                <div className="overflow-hidden">
                  <h3 className="font-black text-stone-900 text-sm truncate">
                    {donor.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Total:{" "}
                    <strong className="text-emerald-800 font-extrabold">
                      {donor.inrTotal > 0 && donor.ethTotal > 0
                        ? `${money(donor.inrTotal)} + ${donor.ethTotal.toFixed(3)} ETH`
                        : donor.ethTotal > 0
                        ? `${donor.ethTotal.toFixed(3)} ETH`
                        : money(donor.inrTotal)}
                    </strong>
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {donor.count} verified contribution{donor.count > 1 ? "s" : ""}
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
