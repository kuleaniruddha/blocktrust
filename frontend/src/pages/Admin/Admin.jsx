import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ShieldAlert,
  Users,
  PlusCircle,
  CheckCircle,
  Flame,
  Trash2,
  Receipt,
  ShieldCheck,
  UserCheck,
  Building,
  Sparkles
} from "lucide-react";
import { api } from "../../services/api";
import { money } from "../../utils/format";

export default function Admin() {
  const {
    register: registerExpense,
    handleSubmit: handleSubmitExpense,
    reset: resetExpense
  } = useForm({
    defaultValues: {
      category: "Construction",
      status: "approved"
    }
  });

  const {
    register: registerCampaign,
    handleSubmit: handleSubmitCampaign,
    reset: resetCampaign
  } = useForm({
    defaultValues: {
      targetAmount: 500000
    }
  });

  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingExpId, setDeletingExpId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = () => {
    api.get("/auth/users")
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to load users", err));
  };

  const loadExpenses = () => {
    api.get("/expenses")
      .then((res) => setExpenses(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to load expenses", err));
  };

  useEffect(() => {
    loadUsers();
    loadExpenses();
  }, []);

  async function handleExpenseSubmit(values) {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await api.post("/expense", values);
      setMessage("Expenditure record logged & authorized successfully!");
      resetExpense();
      loadExpenses();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to log expense.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteExpense(id) {
    if (!window.confirm("Are you sure you want to delete this expenditure record?")) return;
    try {
      setDeletingExpId(id);
      setError("");
      setMessage("");
      await api.delete(`/expense/${id}`);
      setMessage("Expense record removed from Firestore successfully!");
      setExpenses((prev) => prev.filter((item) => (item._id || item.id) !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete expense.");
    } finally {
      setDeletingExpId(null);
    }
  }

  async function handleCampaignSubmit(values) {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      await api.post("/campaigns", values);
      setMessage(`Donation drive for "${values.title}" launched successfully!`);
      resetCampaign();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create campaign.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      setError("");
      setMessage("");
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      setMessage(`User role updated to ${newRole} successfully!`);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update user role.");
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-saffron-700 flex items-center gap-1.5 mb-1">
            <ShieldCheck className="h-4 w-4" />
            Trustee Operations & Governance
          </span>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-stone-900">
            Administrative Control Center
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Log temple expenditures, create target donation campaigns, and manage trustee authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="badge-saffron text-xs">
            Admin Privileges Active
          </span>
        </div>
      </div>

      {/* Notifications */}
      {(message || error) && (
        <div>
          {message && (
            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="rounded-2xl bg-red-50 p-4 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs mt-2">
              <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Input Forms */}
        <div className="space-y-6">
          {/* Form 1: Log Temple Expenditure */}
          <div className="panel rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-card bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-saffron-700">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-stone-900">
                  Log Temple Expenditure
                </h2>
                <p className="text-[11px] text-stone-500">Record verified contractor invoices and vendor disbursements.</p>
              </div>
            </div>

            <form className="space-y-4 pt-1" onSubmit={handleSubmitExpense(handleExpenseSubmit)}>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Title / Expense Item *</label>
                  <input className="input" placeholder="e.g. Pink Sandstone Pillars" {...registerExpense("title", { required: true })} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Vendor / Contractor</label>
                  <input className="input" placeholder="e.g. Ayodhya Stone Works" {...registerExpense("vendor")} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Amount (INR) *</label>
                  <input className="input font-mono font-bold" type="number" placeholder="250000" {...registerExpense("amount", { required: true, valueAsNumber: true })} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Category *</label>
                  <select className="input bg-white" {...registerExpense("category")}>
                    {["Construction", "Annadanam", "Maintenance", "Festival", "Education", "Medical", "Salary", "Others"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">Description / Project Scope</label>
                  <textarea className="input h-20 text-xs" placeholder="Detail how these funds will be deployed..." {...registerExpense("description")} />
                </div>
              </div>

              <button className="btn btn-primary w-full py-3 font-bold shadow-sm" type="submit" disabled={loading}>
                {loading ? "Recording in Firestore..." : "Log & Authorize Expense"}
              </button>
            </form>
          </div>

          {/* Form 2: Launch Donation Campaign */}
          <div className="panel rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-card bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-stone-900">
                  Launch Donation Campaign
                </h2>
                <p className="text-[11px] text-stone-500">Initiate a targeted fundraising drive for devotees.</p>
              </div>
            </div>

            <form className="space-y-4 pt-1" onSubmit={handleSubmitCampaign(handleCampaignSubmit)}>
              <div className="grid gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Drive Name / Title *</label>
                  <input className="input" placeholder="e.g. Annakshetra & 50,000 Pilgrim Meals" {...registerCampaign("title", { required: true })} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Target Goal Amount (INR) *</label>
                  <input className="input font-mono font-bold" type="number" placeholder="500000" {...registerCampaign("targetAmount", { required: true, valueAsNumber: true })} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Campaign Purpose & Scope</label>
                  <textarea className="input h-20 text-xs" placeholder="Describe the sacred significance of this campaign..." {...registerCampaign("description")} />
                </div>
              </div>

              <button className="btn bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm w-full py-3 font-bold" type="submit" disabled={loading}>
                {loading ? "Publishing Drive..." : "Launch Donation Drive"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Expenditures Management & User Role Settings */}
        <div className="space-y-6">
          {/* Expenditures Management List */}
          <div className="panel rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-card bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-saffron-700">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-stone-900">
                    Logged Expenditures ({expenses.length})
                  </h2>
                  <p className="text-[11px] text-stone-500">Live records with instant delete capability.</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-stone-200/90 rounded-2xl max-h-72 overflow-y-auto">
              <table className="w-full text-left text-sm text-stone-700">
                <thead className="bg-stone-50 text-[11px] font-black uppercase tracking-wider text-stone-600 border-b border-stone-200 sticky top-0">
                  <tr>
                    <th className="px-3 py-2.5">Item / Title</th>
                    <th className="px-3 py-2.5">Category</th>
                    <th className="px-3 py-2.5">Amount</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {expenses.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-xs text-stone-400">
                        No expense records in database.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => {
                      const expId = exp._id || exp.id;
                      return (
                        <tr key={expId} className="hover:bg-amber-50/20 transition">
                          <td className="px-3 py-3">
                            <p className="font-bold text-stone-900 text-xs">{exp.title}</p>
                            {exp.vendor && <p className="text-[10px] text-stone-500">{exp.vendor}</p>}
                          </td>
                          <td className="px-3 py-3">
                            <span className="badge-saffron text-[10px]">
                              {exp.category}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-bold text-xs text-stone-900">
                            {money(exp.amount)}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              onClick={() => handleDeleteExpense(expId)}
                              disabled={deletingExpId === expId}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                              title="Delete this expense record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Account Role Settings */}
          <div className="panel rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-card bg-white space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-stone-900">
                  Account Roles & Privileges
                </h2>
                <p className="text-[11px] text-stone-500">Configure Donor, Auditor, or Admin permissions.</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-stone-200/90 rounded-2xl">
              <table className="w-full text-left text-sm text-stone-700">
                <thead className="bg-stone-50 text-[11px] font-black uppercase tracking-wider text-stone-600 border-b border-stone-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Name</th>
                    <th className="px-3.5 py-2.5">Email</th>
                    <th className="px-3.5 py-2.5">Role</th>
                    <th className="px-3.5 py-2.5 text-right">Privilege</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-xs text-stone-400">No user accounts found.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id || u.id} className="hover:bg-amber-50/20 transition">
                        <td className="px-3.5 py-3 font-bold text-stone-900 text-xs">{u.name}</td>
                        <td className="px-3.5 py-3 font-mono text-stone-500 text-xs truncate max-w-[140px]">{u.email}</td>
                        <td className="px-3.5 py-3">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            u.role === "admin"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : u.role === "auditor"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-stone-100 text-stone-700 border border-stone-200"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-right">
                          <select
                            className="input text-xs py-1 px-2 border-stone-200 bg-white rounded-lg w-auto"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id || u.id, e.target.value)}
                          >
                            <option value="donor">Donor (Normal)</option>
                            <option value="auditor">Auditor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
