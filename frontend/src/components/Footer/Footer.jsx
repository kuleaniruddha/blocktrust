import { ShieldCheck, Lock, Cpu, Globe, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200/80 bg-white/60 backdrop-blur-md mt-16 pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4 pb-10 border-b border-stone-200/80">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-saffron-700 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="font-cinzel text-base font-black tracking-wide text-stone-900">
                SHRI RAM MANDIR TRUST
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-md">
              A pioneering on-chain donation transparency platform. Every rupee and Wei contributed to the temple construction, pilgrim welfare, and Annakshetra is cryptographically immutable and verified.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="badge-emerald text-[11px]">
                <Lock className="h-3 w-3" />
                Sepolia Smart Contracts
              </span>
              <span className="badge-saffron text-[11px]">
                <Cpu className="h-3 w-3" />
                AI Anomaly Audited
              </span>
              <span className="badge-blue text-[11px]">
                <Globe className="h-3 w-3" />
                Public Ledger
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
              Transparency Portal
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-600 font-medium">
              <li>
                <Link to="/" className="hover:text-saffron-700 transition">
                  Overview & Vision
                </Link>
              </li>
              <li>
                <Link to="/transactions" className="hover:text-saffron-700 transition">
                  Public Transactions Ledger
                </Link>
              </li>
              <li>
                <Link to="/expenses" className="hover:text-saffron-700 transition">
                  Fund Usage & Vendor Audits
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-saffron-700 transition">
                  Real-time Analytics Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contributions */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
              Devotee Services
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-600 font-medium">
              <li>
                <Link to="/donate" className="hover:text-saffron-700 transition">
                  Ethereum (Web3) Donation
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-saffron-700 transition">
                  Instant UPI QR Payment
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-saffron-700 transition">
                  Donor Login & Track Receipts
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-saffron-700 transition">
                  Create Donor Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Shri Ram Mandir Trust. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with devotion & blockchain integrity <Heart className="h-3.5 w-3.5 text-amber-600 fill-amber-600" />
          </p>
        </div>
      </div>
    </footer>
  );
}
