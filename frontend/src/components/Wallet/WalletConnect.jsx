import { Wallet, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";

export default function WalletConnect() {
  const { account, network, chainId, balance, loadingBalance, error, connect, switchNetwork, fetchBalance } = useWallet();
  const isSepolia = chainId === "11155111";

  return (
    <div className="panel rounded-3xl p-5 border border-stone-200/90 bg-white shadow-card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-stone-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Wallet className="h-4 w-4 text-saffron-600" />
            MetaMask Web3 Wallet
          </div>
          <p className="break-all font-mono text-[11px] font-bold text-stone-800 bg-stone-50 p-2 rounded-xl border border-stone-200/80">
            {account || "Wallet Disconnected"}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 items-end">
          <button
            className="btn btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 font-bold shadow-xs"
            onClick={connect}
            title="Connect or switch wallet"
          >
            <Wallet className="h-3.5 w-3.5" />
            {account ? "Change" : "Connect"}
          </button>
        </div>
      </div>

      {account && (
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-stone-500 font-medium">Sepolia ETH Balance:</span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                {balance} ETH
              </span>
              <button
                className="text-stone-400 hover:text-saffron-700 p-1"
                onClick={() => fetchBalance(account)}
                disabled={loadingBalance}
                title="Refresh ETH balance"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingBalance ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {network && (
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Network:</span>
              <span className="font-bold text-stone-800 flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${isSepolia ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                {network}
              </span>
            </div>
          )}
        </div>
      )}

      {account && !isSepolia && (
        <div className="rounded-2xl bg-amber-50 p-3 text-xs font-semibold text-amber-800 flex flex-col gap-2 border border-amber-200">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Wrong Blockchain Network</span>
          </div>
          <span className="text-[11px] text-amber-700">
            Please switch MetaMask to Sepolia Testnet to record on-chain donations.
          </span>
          <button
            className="btn btn-primary text-xs py-1.5 w-full font-bold shadow-xs"
            onClick={switchNetwork}
          >
            Switch to Sepolia Network
          </button>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-700 border border-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
