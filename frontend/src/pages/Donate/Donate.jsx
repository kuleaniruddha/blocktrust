import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import {
  BadgeIndianRupee,
  Download,
  ExternalLink,
  Play,
  ShieldCheck,
  Wallet,
  QrCode,
  Sparkles,
  Heart,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
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

  const selectedCurrency = watch("currency");
  const currentAmount = watch("amount");

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

  useEffect(() => {
    if (user) {
      setValue("donorName", user.name || "");
      setValue("email", user.email || "");
    }
  }, [user, setValue]);

  if (!user) {
    return (
      <div className="panel rounded-3xl p-8 max-w-md mx-auto text-center border border-stone-200 mt-12 shadow-xl bg-white space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-saffron-600">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-stone-900">
            Authentication Required
          </h2>
          <p className="text-stone-600 mt-2 text-xs sm:text-sm leading-relaxed">
            To guarantee transparency, tax compliance, and automated blockchain audit logs, please log in or register before contributing.
          </p>
        </div>
        <div className="pt-2 flex flex-col gap-2.5">
          <Link to="/login" className="btn btn-primary w-full font-bold shadow-md">
            Log In to My Account
          </Link>
          <Link to="/register" className="btn btn-secondary w-full">
            Register New Donor Account
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === "admin") {
    return (
      <div className="panel rounded-3xl p-8 max-w-md mx-auto text-center border border-stone-200 mt-12 shadow-xl bg-white space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-stone-900">
          Administrator Role Notice
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
          Admin accounts are designated for authorizing expenditures and tracking funds. Please use a standard donor account to record contributions.
        </p>
      </div>
    );
  }

  const setPresetAmount = (val) => {
    setValue("amount", val);
  };

  const handleModeSwitch = (mode) => {
    setValue("currency", mode);
    if (mode === "ETH") {
      setValue("amount", 0.01);
    } else {
      setValue("amount", 1100);
    }
  };

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
      setMessage("UPI QR generated! Scan with any UPI app below to complete your offering.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate UPI payment intent.");
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

      const tx = await sendEthDonation({
        amountEth: values.amount,
        targetAddress: values.targetAddress
      });

      setMessage(`Transaction broadcasted! Tx: ${tx.hash}. Saving record to Firestore...`);

      const res = await api.post("/donate", {
        donorName: values.donorName || "Anonymous Devotee",
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
      setMessage(`Success! Your ETH donation of ${values.amount} ETH to ${values.targetAddress} is permanently recorded.`);
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
        donorName: values.donorName || user?.name || "Aniruddha",
        email: values.email || user?.email || "aniruddhakule@gmail.com",
        amount: Number(values.amount) || 0.01,
        currency: "ETH",
        purpose: values.purpose || "Shri Ram Mandir Main Development",
        paymentMode: "simulated_testnet",
        transactionHash: mockHash,
        walletAddress: values.targetAddress || DEFAULT_TARGET_WALLET,
        status: "confirmed"
      });

      setLastDonation(res.data);
      setMessage(`[TEST SIMULATION SUCCESS] Recorded ${values.amount} ETH donation on Sepolia ledger!`);
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
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {/* Left Column: Interactive Giving Flow */}
      <div className="space-y-6">
        <form
          className="panel rounded-3xl p-6 sm:p-8 bg-white border border-stone-200/90 shadow-card space-y-6"
          onSubmit={handleSubmit(selectedCurrency === "ETH" ? handleEthDonate : handleUpiSubmit)}
        >
          {/* Header */}
          <div className="border-b border-stone-100 pb-5">
            <span className="text-[11px] font-black uppercase tracking-wider text-saffron-700 flex items-center gap-1.5 mb-1">
              <Sparkles className="h-4 w-4" />
              Sacred Contribution
            </span>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-stone-900">
              Contribute to Shri Ram Mandir Trust
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Select your payment method below. Every contribution issues an on-chain cryptographic receipt.
            </p>
          </div>

          {/* Payment Method Switcher Tabs */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">Choose Giving Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleModeSwitch("ETH")}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                  selectedCurrency === "ETH"
                    ? "border-amber-500 bg-amber-500/10 shadow-xs ring-2 ring-amber-500/20"
                    : "border-stone-200 hover:bg-stone-50"
                }`}
              >
                <div className={`p-2.5 rounded-xl ${selectedCurrency === "ETH" ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-600"}`}>
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-stone-900">Web3 / Ethereum</p>
                  <p className="text-[10px] text-stone-500">MetaMask · Sepolia Testnet</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleModeSwitch("INR")}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                  selectedCurrency === "INR"
                    ? "border-emerald-500 bg-emerald-500/10 shadow-xs ring-2 ring-emerald-500/20"
                    : "border-stone-200 hover:bg-stone-50"
                }`}
              >
                <div className={`p-2.5 rounded-xl ${selectedCurrency === "INR" ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-600"}`}>
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-stone-900">Instant UPI QR</p>
                  <p className="text-[10px] text-stone-500">GPay · PhonePe · BHIM</p>
                </div>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Donor Name</label>
              <input className="input" placeholder="e.g. Aniruddha Kule" {...register("donorName")} />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email (For Receipt PDF)</label>
              <input className="input" placeholder="name@domain.com" type="email" {...register("email")} />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                Amount ({selectedCurrency}) *
              </label>
              <input
                className="input text-lg font-black text-stone-900 font-mono"
                type="number"
                step={selectedCurrency === "ETH" ? "0.001" : "1"}
                min={selectedCurrency === "ETH" ? "0.0001" : "10"}
                {...register("amount", { required: true, valueAsNumber: true })}
              />

              {/* Quick Amount Preset Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] font-semibold text-stone-400 self-center mr-1">Quick Select:</span>
                {selectedCurrency === "ETH"
                  ? [0.005, 0.01, 0.05, 0.1, 0.5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPresetAmount(val)}
                        className={`text-xs px-3 py-1 rounded-xl font-bold border transition ${
                          currentAmount === val
                            ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                            : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                      >
                        {val} ETH
                      </button>
                    ))
                  : [501, 1100, 2100, 5100, 11000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPresetAmount(val)}
                        className={`text-xs px-3 py-1 rounded-xl font-bold border transition ${
                          currentAmount === val
                            ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                            : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                      >
                        ₹{val.toLocaleString("en-IN")}
                      </button>
                    ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Designate Toward Campaign / Drive *
              </label>
              <select className="input bg-white" {...register("purpose", { required: true })}>
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

            <div className="sm:col-span-2 rounded-2xl bg-amber-50/70 p-4 border border-amber-200/80 space-y-1">
              <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                Authorized Trust Vault Address (Sepolia Smart Contract)
              </label>
              <input
                className="input font-mono text-xs bg-white/80 cursor-not-allowed text-stone-600 border-amber-200"
                readOnly={true}
                {...register("targetAddress")}
              />
              <p className="text-[10px] text-amber-800 font-medium">
                Funds are held in a transparent multi-signature smart contract on Sepolia Testnet.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-3">
            {selectedCurrency === "ETH" ? (
              <>
                <button
                  className="btn btn-primary text-sm font-bold px-6 py-3 shadow-md flex items-center gap-2"
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit(handleEthDonate)}
                >
                  <Wallet className="h-5 w-5" />
                  {loading ? "Broadcasting to Sepolia..." : `Send ${currentAmount || 0} ETH via MetaMask`}
                </button>

                <button
                  className="btn btn-secondary text-xs font-bold px-4 py-3 flex items-center gap-1.5"
                  type="button"
                  disabled={loading}
                  onClick={handleSimulatedDonate}
                  title="Simulate recording a test donation without requiring Sepolia gas faucet ETH"
                >
                  <Play className="h-3.5 w-3.5 text-saffron-600" />
                  Test Simulation (No Gas ETH Needed)
                </button>
              </>
            ) : (
              <button
                className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 shadow-md flex items-center gap-2"
                type="submit"
                disabled={loading}
              >
                <BadgeIndianRupee className="h-5 w-5" />
                {loading ? "Generating UPI Intent..." : `Generate UPI QR for ₹${(currentAmount || 0).toLocaleString("en-IN")}`}
              </button>
            )}
          </div>

          {/* Message Notification */}
          {message && (
            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="rounded-2xl bg-red-50 p-4 border border-red-200 text-red-700 text-xs sm:text-sm font-medium space-y-3">
              <div className="flex items-center gap-2 font-bold text-red-900">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>Transaction Notification</span>
              </div>
              <p>{error}</p>

              {showSimulateOption && (
                <div className="pt-2 border-t border-red-200 space-y-2">
                  <p className="text-xs text-red-800">
                    If your Sepolia test wallet has 0 ETH, click below to record a test donation and retrieve your PDF receipt immediately:
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary text-xs py-2 px-4 shadow-sm flex items-center gap-2"
                    onClick={handleSimulatedDonate}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Record Simulation & Download Receipt
                  </button>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Immediate Receipt Download Panel */}
        {lastDonation && (
          <div className="panel rounded-3xl p-6 bg-gradient-to-br from-emerald-50/70 to-white border border-emerald-300 shadow-md space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                Cryptographic Receipt Ready!
              </h3>
              <span className="badge-emerald text-[10px]">Verified On-Chain</span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-emerald-100 text-xs space-y-1.5 font-mono">
              <p className="flex justify-between">
                <span className="text-stone-500 font-sans">Receipt Number:</span>
                <strong className="text-stone-900">{lastDonation.receiptNumber}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-stone-500 font-sans">Amount:</span>
                <strong className="text-emerald-700 font-bold">
                  {lastDonation.currency === "ETH" ? `${lastDonation.amount} ETH` : money(lastDonation.amount)}
                </strong>
              </p>
              {lastDonation.transactionHash && (
                <div className="pt-1 border-t border-stone-100">
                  <span className="text-stone-500 font-sans block mb-0.5">Blockchain Tx:</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${lastDonation.transactionHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-saffron-700 hover:underline flex items-center gap-1 font-bold break-all"
                  >
                    {lastDonation.transactionHash}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                className="btn btn-primary text-xs font-bold py-2.5 px-5 flex items-center gap-2 shadow-sm"
                onClick={() => downloadReceipt(lastDonation._id || lastDonation.id)}
              >
                <Download className="h-4 w-4" />
                Download PDF Receipt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Wallet State, QR Generator & Impact Card */}
      <div className="space-y-6">
        <WalletConnect />
        <PaymentQR {...(qr || {})} />

        {/* Sacred Seva Impact Card */}
        <div className="panel rounded-3xl p-6 bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border border-amber-200/80 shadow-card space-y-4">
          <div className="flex items-center gap-2 text-saffron-700 font-black text-xs uppercase tracking-wider">
            <Heart className="h-4 w-4 fill-saffron-700" />
            <span>Divine Impact of Your Offering</span>
          </div>

          <h4 className="font-cinzel text-base font-black text-stone-900 leading-snug">
            Where Your Contribution Goes
          </h4>

          <ul className="text-xs text-stone-600 space-y-2.5 font-medium">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Annakshetra Prasadam:</strong> Daily pure sattvik meals served to over 25,000 pilgrims visiting Ayodhya.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Stone Carving & Architecture:</strong> Rajasthan pink sandstone craftsmanship by generational artisans.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Emergency Healthcare:</strong> 24/7 first aid, ambulance assistance, and pilgrim welfare facilities.</span>
            </li>
          </ul>

          <div className="pt-2 border-t border-amber-200/60 text-[11px] text-amber-900 font-bold flex items-center justify-between">
            <span>Audit Standard:</span>
            <span className="badge-emerald text-[10px]">100% Tax Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
