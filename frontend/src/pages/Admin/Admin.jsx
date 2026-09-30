import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ShieldAlert, Users, PlusCircle, CheckCircle, Flame, Trash2, Receipt } from "lucide-react";
import { api } from "../../services/api";
import { money } from "../../utils/format";

export default function Admin() {
  // Form 1: Admin Expense Entry
  const {
    register: registerExpense,
    handleSubmit: handleSubmitExpense,
    reset: resetExpense
  } = useForm({
    defaultValues: {
      category: "Construction",
      status: "pending"
    }
  });

  // Form 2: Create Donation Drive (Campaign)
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
      setMessage("Expenditure record logged successfully!");
      resetExpense();
      loadExpenses();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to log expense.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteExpense(id) {
    if (!window.confirm("Are you sure you want to delete this expense record?")) return;
    try {
      setDeletingExpId(id);
      setError("");
      setMessage("");
      await api.delete(`/expense/${id}`);
      setMessage("Expense record deleted successfully!");
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
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Column: Admin Entry Forms */}
      <div className="space-y-6">
        {/* 1. Log Temple Expenditures */}
        <div className="panel rounded-xl p-6 border border-stone-200 shadow-sm bg-white">
          <h2 className="text-xl font-black text-ink flex items-center gap-2 border-b pb-3 mb-4">
            <PlusCircle className="h-5 w-5 text-saffron" />
            Admin Expense Entry
          </h2>
          
          <form className="space-y-4" onSubmit={handleSubmitExpense(handleExpenseSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Title / Item *</label>
                <input className="input w-full text-sm" placeholder="e.g. Marble Tiles Purchase" {...registerExpense("title", { required: true })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Vendor / Contractor</label>
                <input className="input w-full text-sm" placeholder="e.g. Sompura Stone Works" {...registerExpense("vendor")} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Amount (INR) *</label>
                <input className="input w-full text-sm" type="number" placeholder="Amount" {...registerExpense("amount", { required: true, valueAsNumber: true })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Category *</label>
                <select className="input w-full bg-white text-sm" {...registerExpense("category")}>
                  {["Construction", "Annadanam", "Maintenance", "Festival", "Education", "Medical", "Salary", "Others"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Description / Project Scope</label>
                <textarea className="input w-full h-20 text-sm" placeholder="Describe how these funds will be utilized..." {...registerExpense("description")} />
              </div>
            </div>

            <button className="btn bg-saffron text-white hover:bg-clay shadow w-full py-2.5 font-bold" type="submit" disabled={loading}>
              {loading ? "Saving Record..." : "Log & Authorize Expense"}
            </button>
          </form>
        </div>

        {/* 2. Create Donation Drive (Campaign) */}
        <div className="panel rounded-xl p-6 border border-stone-200 shadow-sm bg-white">
          <h2 className="text-xl font-black text-ink flex items-center gap-2 border-b pb-3 mb-4">
            <Flame className="h-5 w-5 text-emerald-600" />
            Launch Donation Drive (Target Campaign)
          </h2>
          
          <form className="space-y-4" onSubmit={handleSubmitCampaign(handleCampaignSubmit)}>
            <div className="grid gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Purpose Name / Title *</label>
                <input className="input w-full text-sm" placeholder="e.g. Annakshetra & Daily Prasadam" {...registerCampaign("title", { required: true })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Target Goal Amount (INR) *</label>
                <input className="input w-full text-sm" type="number" placeholder="e.g. 500000" {...registerCampaign("targetAmount", { required: true, valueAsNumber: true })} />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Campaign Description</label>
                <textarea className="input w-full h-20 text-sm" placeholder="Describe this donation drive goal to your donors..." {...registerCampaign("description")} />
              </div>
            </div>

            <button className="btn bg-emerald-600 hover:bg-emerald-700 text-white shadow w-full py-2.5 font-bold" type="submit" disabled={loading}>
              {loading ? "Launching Campaign..." : "Launch Donation Drive"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: User Accounts & Expense Management */}
      <div className="space-y-6">
        {/* Logged Expenses Management */}
        <div className="panel rounded-xl p-6 border border-stone-200 shadow-sm bg-white">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h2 className="text-xl font-black text-ink flex items-center gap-2">
              <Receipt className="h-5 w-5 text-saffron" />
              Logged Expenditures ({expenses.length})
            </h2>
            <span className="text-xs text-stone-500">Live Firebase Records</span>
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-lg max-h-72 overflow-y-auto">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="bg-stone-100 text-xs font-bold text-stone-700 uppercase border-b border-stone-200 sticky top-0">
                <tr>
                  <th className="px-3 py-2">Item / Title</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-xs text-stone-500">
                      No expense records logged in database.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => {
                    const expId = exp._id || exp.id;
                    return (
                      <tr key={expId} className="hover:bg-stone-50 transition">
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-stone-900 text-xs">{exp.title}</p>
                          {exp.vendor && <p className="text-[10px] text-stone-500">{exp.vendor}</p>}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-bold text-xs text-stone-900">
                          {money(exp.amount)}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => handleDeleteExpense(expId)}
                            disabled={deletingExpId === expId}
                            className="p-1.5 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete this expense"
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

        {/* User Accounts & Role Settings */}
        <div className="panel rounded-xl p-6 border border-stone-200 shadow-sm bg-white">
          <h2 className="text-xl font-black text-ink flex items-center gap-2 border-b pb-3 mb-4">
            <Users className="h-5 w-5 text-saffron" />
            User Account & Role Settings
          </h2>

          <div className="overflow-x-auto border border-stone-200 rounded-lg">
            <table className="w-full text-left text-sm text-stone-700">
              <thead className="bg-stone-100 text-xs font-bold text-stone-700 uppercase border-b border-stone-200">
                <tr>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5 text-right">Update Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-xs text-stone-500">No user accounts found.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-stone-50/50 transition">
                      <td className="px-4 py-3 font-semibold text-stone-900 text-xs">{u.name}</td>
                      <td className="px-4 py-3 font-mono text-stone-600 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 text-right">
                        <select
                          className="input text-xs py-1 px-2 border-stone-300 bg-white"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
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

      {/* Message Notifications */}
      {(message || error) && (
        <div className="col-span-full">
          {message && (
            <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-red-800 text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
