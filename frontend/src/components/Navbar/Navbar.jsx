import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, ShieldCheck, UserCheck, WalletCards } from "lucide-react";
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

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      logout();
      navigate("/");
    }
  };

  // Filter links dynamically based on user login state and role
  const visibleLinks = links.filter(([to, label]) => {
    if (to === "/") return true; // Home is always visible to everyone
    if (!user) return false; // Guests can only see Home (must login first)

    if (user.role === "admin") {
      // Admin: track metrics, complete donation list, expenditures, admin settings
      return ["Dashboard / Track", "Transactions", "Fund Usage", "Admin"].includes(label);
    } else {
      // Normal User: donate, track personal funds, personal transactions, expenditures
      return ["Donate", "Dashboard / Track", "Transactions", "Fund Usage"].includes(label);
    }
  });

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-black text-ink">
          <ShieldCheck className="h-6 w-6 text-saffron" />
          Ram Mandir Trust
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {visibleLinks.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-amber-100 text-saffron font-bold" : "text-stone-600 hover:text-ink hover:bg-stone-100"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg">
                <UserCheck className="h-3.5 w-3.5 text-saffron" />
                {user.email || user.name}
              </span>
              <button
                className="btn border border-stone-300 hover:border-red-500 hover:text-red-600 text-stone-600 p-2 rounded-lg"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link className="btn bg-saffron text-white hover:bg-clay text-sm font-bold px-4 py-2 flex items-center gap-1.5" to="/login">
              <WalletCards className="h-4 w-4" />
              Login / Register
            </Link>
          )}
          <Link className="btn btn-secondary md:hidden" to="/dashboard" title="Dashboard">
            <LayoutDashboard className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
