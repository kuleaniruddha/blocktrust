import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ShieldCheck, Lock, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="py-6 sm:py-12">
      <form
        className="panel mx-auto max-w-md rounded-3xl p-8 sm:p-10 border border-stone-200/90 shadow-2xl bg-white space-y-6 relative overflow-hidden"
        onSubmit={handleSubmit(submit)}
      >
        <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-2 text-saffron-700 font-extrabold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="h-4 w-4" />
            Ram Mandir Trust Portal
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-stone-900">
            Sign In
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Access your tracked donations, retrieve cryptographic receipts, and view live ledger metrics.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Email Address
            </label>
            <input
              className="input"
              type="email"
              placeholder="name@domain.com"
              {...register("email", { required: true })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                className="input pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", { required: true })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary w-full py-3 text-sm font-bold shadow-glow flex items-center justify-center gap-2"
          disabled={loading}
        >
          <Lock className="h-4 w-4" />
          {loading ? "Authenticating..." : "Login to Dashboard"}
        </button>

        <div className="pt-2 text-center text-xs text-stone-600 border-t border-stone-100 space-y-2">
          <p>
            Don't have a donor account?{" "}
            <Link className="font-bold text-saffron-700 hover:underline" to="/register">
              Create an account here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
