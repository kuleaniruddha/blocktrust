import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ShieldCheck, UserPlus, CheckCircle2, ArrowRight, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register, handleSubmit } = useForm({ defaultValues: { role: "donor" } });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  async function submit(values) {
    try {
      setError("");
      setLoading(true);
      const res = await auth.register(values);
      setRegisteredData(res?.user || values);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  const handleProceedToDashboard = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
  };

  const handleGoToLogin = () => {
    auth.logout();
    setShowSuccessModal(false);
    navigate("/login");
  };

  return (
    <>
      <form className="panel mx-auto max-w-md rounded-xl p-8 border border-stone-200 shadow-md bg-white" onSubmit={handleSubmit(submit)}>
        <div className="flex items-center gap-2 text-saffron font-bold text-xs uppercase tracking-wider mb-1">
          <ShieldCheck className="h-4 w-4" />
          Ram Mandir Trust Portal
        </div>
        <h1 className="text-2xl font-black text-ink">Create Donor Account</h1>
        <p className="text-xs text-stone-500 mt-1 mb-6">Register to track your contributions and automatically bind your blockchain donations.</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Full Name *</label>
            <input className="input w-full" placeholder="e.g. Rahul Sharma" {...register("name", { required: true })} />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Email Address *</label>
            <input className="input w-full" type="email" placeholder="name@domain.com" {...register("email", { required: true })} />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Password *</label>
            <input className="input w-full" type="password" placeholder="••••••••" {...register("password", { required: true })} />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Wallet Address (Optional)</label>
            <input className="input w-full font-mono text-xs" placeholder="0x..." {...register("walletAddress")} />
          </div>
        </div>

        <button className="btn bg-saffron text-white hover:bg-clay font-bold mt-6 w-full py-2.5 flex items-center justify-center gap-2" disabled={loading}>
          <UserPlus className="h-4 w-4" />
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <div className="mt-4 text-center text-xs text-stone-600">
          Already have an account?{" "}
          <Link className="font-bold text-saffron hover:underline" to="/login">
            Log in here
          </Link>
        </div>
      </form>

      {/* Confirmation Success Modal Popup */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-center space-y-5">
            {/* Animated Badge / Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>

            <div>
              <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-amber-100 text-amber-800 border border-amber-200 mb-2">
                Registration Successful
              </span>
              <h2 className="text-2xl font-black text-stone-900">Account Created!</h2>
              <p className="text-xs text-stone-600 mt-1">
                Welcome, <span className="font-bold text-stone-900">{registeredData?.name || "Donor"}</span>! Your account is now active in the Shri Ram Mandir Trust database.
              </p>
            </div>

            {/* Account Details Box */}
            <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-500">Email:</span>
                <span className="font-semibold text-stone-800">{registeredData?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Account Role:</span>
                <span className="font-semibold text-emerald-700 capitalize">{registeredData?.role || "donor"}</span>
              </div>
              {registeredData?.walletAddress && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Wallet:</span>
                  <span className="font-semibold text-stone-800 truncate max-w-[200px]">{registeredData.walletAddress}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleProceedToDashboard}
                className="btn bg-saffron text-white hover:bg-clay font-bold flex-1 py-2.5 text-sm flex items-center justify-center gap-2 shadow-md"
              >
                Proceed to Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={handleGoToLogin}
                className="btn bg-stone-100 text-stone-700 hover:bg-stone-200 font-semibold py-2.5 text-sm flex items-center justify-center gap-1.5 border border-stone-300"
              >
                <LogIn className="h-4 w-4 text-stone-500" />
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
