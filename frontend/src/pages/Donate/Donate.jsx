import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { BadgeIndianRupee, Download, ExternalLink, Play, ShieldCheck, Wallet } from "lucide-react";
import { api } from "../../services/api";
import { useWallet } from "../../hooks/useWallet";
import { useAuth } from "../../context/AuthContext";
import { money } from "../../utils/format";
import PaymentQR from "../../components/QRCode/PaymentQR";
import WalletConnect from "../../components/Wallet/WalletConnect";

const DEFAULT_TARGET_WALLET = import.meta.env.VITE_DONATION_WALLET_ADDRESS || "0xA1E50DaF64fb2B342A64d848E396700962acC2d0";

export default function Donate() {
  const { user } = useAuth();
  const { account, balance, sendEthDonation } = useWallet();

  const { register, handleSubmit, watch, setValue, getValues } = useForm({
    defaultValues: {
      donorName: user?.name || "",
      email: user?.email || "",
      amount: 0.01,
      currency: "ETH",
      purpose: "Shri Ram Mandir Main Development",
      targetAddress: DEFAULT_TARGET_WALLET
    }
  });

  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lastDonation, setLastDonation] = useState(null);
  const [showSimulateOption, setShowSimulateOption] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    api.get("/campaigns")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setCampaigns(list);
        if (list.length > 0) {
          setValue("purpose", list[0].title);
        }
      })
      .catch((err) => console.error("Failed to load campaigns in donation form", err));
  }, [setValue]);

  // Sync profile details if they change dynamically
  useEffect(() => {
    if (user) {
      setValue("donorName", user.name || "");
      setValue("email", user.email || "");
    }
  }, [user, setValue]);

  const selectedCurrency = watch("currency");

  if (!user) {
    return (
      <div className="panel rounded-xl p-8 max-w-md mx-auto text-center border border-stone-200 mt-10 shadow-md bg-stone-50">
        <h2 className="text-2xl font-black text-ink flex items-center justify-center gap-2">
          <ShieldCheck className="h-6 w-6 text-saffron" />
          Authentication Required
        </h2>
        <p className="text-stone-600 mt-3 text-sm leading-relaxed">
          To ensure transparency and compliance, you must register or log in to a verified account to make a donation to the Shri Ram Mandir Trust.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link to="/login" className="btn bg-saffron text-white hover:bg-clay shadow-md w-full">
            Log In to My Account
          </Link>
          <Link to="/register" className="btn btn-secondary w-full">
            Register New Account
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === "admin") {
    return (
      <div className="panel rounded-xl p-8 max-w-md mx-auto text-center border border-stone-200 mt-10 shadow-md bg-stone-50">
        <h2 className="text-2xl font-black text-ink flex items-center justify-center gap-2">
          <ShieldCheck className="h-6 w-6 text-red-600" />
          Access Denied
        </h2>
        <p className="text-stone-600 mt-3 text-sm leading-relaxed">
          Administrator accounts are not permitted to make donations. Please use or register a standard donor account to contribute.
        </p>
      </div>
    );
  }

  async function handleUpiSubmit(values) {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      setLastDonation(null);

      const intentRes = await api.post("/payment-intent", values);
      setQr(intentRes.data);

      const donateRes = await api.post("/donate", {
        ...values,
        paymentMode: "upi",
        status: "pending"
      });

      setLastDonation(donateRes.data);
      setMessage("UPI QR Code generated below! Scan & pay, then download your receipt.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate UPI payment.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEthDonate(values) {
    try {
      setLoading(true);
      setError("");
      setMessage("");
      setLastDonation(null);
      setShowSimulateOption(false);

      // 1. Send transaction on-chain via MetaMask
      const tx = await sendEthDonation({
        amountEth: values.amount,
        targetAddress: values.targetAddress
      });

      setMessage(`Blockchain transaction broadcasted! Hash: ${tx.hash}. Saving record...`);

      // 2. Log transaction in backend
      const res = await api.post("/donate", {
        donorName: values.donorName || "Anonymous Donor",
        email: values.email,
        amount: Number(values.amount),
        currency: "ETH",
        purpose: values.purpose || "Shri Ram Mandir Trust",
        paymentMode: "metamask",
        transactionHash: tx.hash,
        walletAddress: values.targetAddress,
        status: "confirmed"
      });

      setLastDonation(res.data);
      setMessage(`Success! Your ETH donation of ${values.amount} ETH to ${values.targetAddress} has been recorded.`);
    } catch (err) {
      const errMsg = err.message || "ETH donation failed.";
      setError(errMsg);
      if (errMsg.includes("Insufficient ETH") || errMsg.includes("0 ETH balance")) {
        setShowSimulateOption(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulatedDonate() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const values = getValues();
      const mockHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      const res = await api.post("/donate", {
        donorName: values.donorName || "Aniruddha",
        email: values.email || "aniruddhakule@gmail.com",
        amount: Number(values.amount) || 0.01,
        currency: "ETH",
        purpose: values.purpose || "Shri Ram Mandir Main Development",
        paymentMode: "simulated_testnet",
        transactionHash: mockHash,
        walletAddress: values.targetAddress || DEFAULT_TARGET_WALLET,
        status: "confirmed"
      });

      setLastDonation(res.data);
      setMessage(`[TEST SIMULATION SUCCESS] Recorded ${values.amount} ETH donation to wallet ${values.targetAddress || DEFAULT_TARGET_WALLET}!`);
      setShowSimulateOption(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Simulation failed.");
    } finally {
      setLoading(false);
    }
  }

  const downloadReceipt = (donationId) => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.open(`${apiUrl}/donation/${donationId}/receipt`, "_blank");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <form className="panel rounded-xl p-6 shadow-sm border border-stone-200" onSubmit={handleSubmit(selectedCurrency === "ETH" ? handleEthDonate : handleUpiSubmit)}>
          <div className="flex items-center justify-between border-b pb-4 border-stone-200">
            <div>
              <h1 className="text-2xl font-black text-ink flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-saffron" />
                Donate to Shri Ram Mandir Trust
              </h1>
              <p className="text-sm text-stone-500 mt-1">Verified on-chain crowd funding platform for temple development and community services.</p>
            </div>
          </div>

          {account && (
            <div className="mt-4 p-3 rounded-lg bg-stone-900 text-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs shadow-inner">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-saffron" />
                <span>Connected Account: <strong className="font-mono text-amber-300">{account}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-300">Live Sepolia Balance:</span>
                <span className="font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  {balance} SepoliaETH
                </span>
              </div>
            </div>
          )}

          {account && user?.walletAddress && account.toLowerCase() !== user.walletAddress.toLowerCase() && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col gap-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                Wallet Address Mismatch
              </p>
              <p className="text-stone-600">
                Your connected MetaMask wallet (<strong className="font-mono">{account}</strong>) does not match the registered wallet in your profile (<strong className="font-mono">{user.walletAddress}</strong>). Please switch your active account in the MetaMask extension to avoid tracking errors.
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Donor Full Name</label>
              <input className="input w-full" placeholder="e.g. Rahul Sharma" {...register("donorName")} />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
              <input className="input w-full" placeholder="name@domain.com" type="email" {...register("email")} />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Donation Amount *</label>
              <input className="input w-full" placeholder="Amount" type="number" step="0.0001" min="0.0001" {...register("amount", { required: true, valueAsNumber: true })} />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Currency Mode *</label>
              <select className="input w-full" {...register("currency")} onChange={(e) => setValue("currency", e.target.value)}>
                <option value="ETH">ETH (Blockchain Crypto)</option>
                <option value="INR">INR (Bank / UPI)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">Purpose / Active Donation Drive *</label>
              <select className="input w-full bg-white text-sm" {...register("purpose", { required: true })}>
                {campaigns.length === 0 ? (
                  <option value="Shri Ram Mandir Main Development">Shri Ram Mandir Main Development (General)</option>
                ) : (
                  campaigns.map((c) => (
                    <option key={c._id || c.title} value={c.title}>
                      {c.title} (Target: {money(c.targetAmount)})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="md:col-span-2 rounded-lg bg-amber-50 p-4 border border-amber-200">
              <label className="block text-xs font-bold text-amber-900 mb-1">
                Recipient Wallet / Target Account Address
              </label>
              <input className="input w-full font-mono text-xs bg-stone-100 cursor-not-allowed text-stone-600" placeholder="0x..." readOnly={true} {...register("targetAddress")} />
              <p className="text-[11px] text-amber-700 mt-1">
                Crypto contributions will be transferred directly to this target wallet account address.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {selectedCurrency === "ETH" ? (
              <>
                <button className="btn bg-saffron text-white hover:bg-clay shadow-md px-6 py-2.5 flex items-center gap-2" type="button" disabled={loading} onClick={handleSubmit(handleEthDonate)}>
                  <Wallet className="h-5 w-5" />
                  {loading ? "Processing..." : "Donate via MetaMask (ETH)"}
                </button>

                <button className="btn border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-4 py-2.5 flex items-center gap-1.5" type="button" disabled={loading} onClick={handleSimulatedDonate}>
                  <Play className="h-4 w-4 text-saffron" />
                  Test Simulation (No Gas ETH Needed)
                </button>
              </>
            ) : (
              <button className="btn bg-emerald-600 text-white hover:bg-emerald-700 shadow-md px-6 py-2.5 flex items-center gap-2" type="submit" disabled={loading}>
                <BadgeIndianRupee className="h-5 w-5" />
                {loading ? "Generating..." : "Generate UPI Payment QR"}
              </button>
            )}
          </div>

          {message && (
            <div className="mt-4 rounded-lg bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-sm font-medium">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 border border-red-200 text-red-700 text-sm font-medium space-y-3">
              <p>⚠️ <strong>Transaction Warning:</strong> {error}</p>
              {showSimulateOption && (
                <div className="pt-2 border-t border-red-200">
                  <p className="text-xs text-red-800 mb-2">
                    Since your MetaMask account balance is 0 ETH on Sepolia, click below to record a test donation to your account <strong>{watch("targetAddress")}</strong> and get your PDF receipt immediately:
                  </p>
                  <button
                    type="button"
                    className="btn bg-saffron text-white text-xs font-bold px-4 py-2 flex items-center gap-2 shadow"
                    onClick={handleSimulatedDonate}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Record Test Donation to My Account & Get Receipt
                  </button>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Confirmation & Immediate Receipt Download Section */}
        {lastDonation && (
          <div className="panel rounded-xl p-6 bg-emerald-50/60 border border-emerald-300">
            <h3 className="text-lg font-black text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Donation Receipt Ready!
            </h3>
            <p className="text-sm text-stone-600 mt-1">
              Receipt No: <strong className="text-stone-900 font-mono">{lastDonation.receiptNumber}</strong>
            </p>
            <p className="text-xs text-stone-600 mt-1">
              Target Wallet Account: <strong className="text-stone-900 font-mono">{lastDonation.walletAddress}</strong>
            </p>
            {lastDonation.transactionHash && (
              <p className="text-xs text-stone-500 mt-1 font-mono break-all flex items-center gap-1">
                Blockchain Hash: {lastDonation.transactionHash}
                <a
                  href={`https://sepolia.etherscan.io/tx/${lastDonation.transactionHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-saffron hover:underline inline-flex items-center gap-0.5 ml-1"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            )}
            <div className="mt-4">
              <button
                className="btn bg-saffron text-white hover:bg-clay flex items-center gap-2 shadow"
                onClick={() => downloadReceipt(lastDonation._id)}
              >
                <Download className="h-4 w-4" />
                Download PDF Receipt
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <WalletConnect />
        <PaymentQR {...(qr || {})} />
      </div>
    </div>
  );
}
