import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ShieldCheck, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  async function submit(values) {
    try {
      setError("");
      setLoading(true);
      await auth.login(values);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="panel mx-auto max-w-md rounded-xl p-8 border border-stone-200 shadow-md bg-white" onSubmit={handleSubmit(submit)}>
      <div className="flex items-center gap-2 text-saffron font-bold text-xs uppercase tracking-wider mb-1">
        <ShieldCheck className="h-4 w-4" />
        Ram Mandir Trust Portal
      </div>
      <h1 className="text-2xl font-black text-ink">Donor Login</h1>
      <p className="text-xs text-stone-500 mt-1 mb-6">Log in to track your donations, download receipts, and manage your account.</p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
          <input className="input w-full" type="email" placeholder="name@domain.com" {...register("email", { required: true })} />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
          <input className="input w-full" type="password" placeholder="••••••••" {...register("password", { required: true })} />
        </div>
      </div>

      <button className="btn bg-saffron text-white hover:bg-clay font-bold mt-6 w-full py-2.5 flex items-center justify-center gap-2" disabled={loading}>
        <Lock className="h-4 w-4" />
        {loading ? "Authenticating..." : "Login to Dashboard"}
      </button>

      <div className="mt-4 text-center text-xs text-stone-600">
        Don't have a donor account?{" "}
        <Link className="font-bold text-saffron hover:underline" to="/register">
          Create one now
        </Link>
      </div>
    </form>
  );
}
