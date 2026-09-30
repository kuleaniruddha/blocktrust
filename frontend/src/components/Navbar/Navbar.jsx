import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LogOut,
  ShieldCheck,
  UserCheck,
  WalletCards,
  Menu,
  X,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  ["/", "Home"],
  ["/donate", "Donate"],
  ["/dashboard", "Dashboard / Track"],
  ["/transactions", "Transactions"],
  ["/expenses", "Fund Usage"],
  ["/admin", "Admin"]
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      logout();
      setMobileMenuOpen(false);
      navigate("/");
    }
  };

  const visibleLinks = links.filter(([to, label]) => {
    if (to === "/") return true;
    if (!user) return false;

    if (user.role === "admin") {
      return ["Dashboard / Track", "Transactions", "Fund Usage", "Admin"].includes(label);
    } else {
      return ["Donate", "Dashboard / Track", "Transactions", "Fund Usage"].includes(label);
    }
  });

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/80 backdrop-blur-xl shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-saffron-700 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-lg font-black tracking-wide text-stone-900 group-hover:text-saffron-700 transition">
                RAM MANDIR TRUST
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-saffron-700">
              Blockchain Transparency Ledger
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-1 lg:flex">
          {visibleLinks.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? "bg-amber-500/10 text-saffron-700 font-extrabold shadow-xs border border-amber-500/20"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/70"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right Section Actions & User Badges */}
        <div className="flex items-center gap-2.5">
          {/* Live Sepolia Ledger status pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Sepolia Verified</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-black text-stone-900 leading-tight">
                  {user.name || "Verified Donor"}
                </span>
                <span className="text-[10px] font-bold capitalize text-amber-700">
                  {user.role} Account
                </span>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-100 to-amber-200 text-amber-900 font-black text-xs border border-amber-300/50 shadow-xs">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>

              <button
                className="btn border border-stone-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 text-stone-500 p-2 rounded-xl transition"
                onClick={handleLogout}
                title="Logout from Account"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              className="btn btn-primary text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-sm"
              to="/login"
            >
              <WalletCards className="h-4 w-4" />
              <span>Login / Register</span>
            </Link>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 border border-stone-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-500">Navigation Menu</span>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Sepolia Live
            </div>
          </div>

          {visibleLinks.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? "bg-amber-500/10 text-saffron-700 border border-amber-500/20"
                    : "text-stone-700 hover:bg-stone-100"
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          {user && (
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-900">{user.email}</p>
                <p className="text-[10px] text-amber-700 capitalize font-medium">{user.role} logged in</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-xs py-1.5 text-red-600 hover:bg-red-50 border-red-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
