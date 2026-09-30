import { Wallet, RefreshCw } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";

export default function WalletConnect() {
  const { account, network, chainId, balance, loadingBalance, error, connect, switchNetwork, fetchBalance } = useWallet();
  const isSepolia = chainId === "11155111";

  return (
    <div className="panel rounded-lg p-4 border border-stone-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-stone-500 font-semibold text-xs uppercase tracking-wider mb-1">
            <Wallet className="h-4 w-4 text-saffron" />
            MetaMask Account
          </div>
          <p className="break-all font-mono text-xs font-bold text-ink bg-stone-100 p-1.5 rounded border border-stone-200">
            {account || "Not connected"}
          </p>
          
          {account && (
            <div className="mt-2.5 space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-stone-500 font-medium">Sepolia ETH Balance:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {balance} SepoliaETH
                </span>
              </div>
              {network && (
                <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500">
                  <span>Network:</span>
                  <span className="font-semibold text-stone-700">{network}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 items-end">
          <button className="btn bg-saffron text-white hover:bg-clay text-xs py-1.5 px-3 flex items-center gap-1.5 font-bold shadow-sm" onClick={connect} title="Connect or switch wallet">
            <Wallet className="h-3.5 w-3.5" />
            {account ? "Reconnect" : "Connect"}
          </button>

          {account && (
            <button
              className="text-[11px] text-stone-600 hover:text-saffron flex items-center gap-1 mt-1 font-semibold underline"
              onClick={() => fetchBalance(account)}
              disabled={loadingBalance}
              title="Refresh Sepolia ETH balance"
            >
              <RefreshCw className={`h-3 w-3 ${loadingBalance ? "animate-spin" : ""}`} />
              {loadingBalance ? "Syncing..." : "Refresh ETH"}
            </button>
          )}
        </div>
      </div>

      {account && !isSepolia && (
        <div className="mt-3 rounded-md bg-amber-50 p-3 text-xs font-semibold text-amber-800 flex flex-col gap-2 border border-amber-200">
          <span>You are not on the Sepolia Test Network. Please switch to proceed safely.</span>
          <button className="btn bg-saffron hover:bg-clay text-xs py-1.5 w-full text-white font-bold" onClick={switchNetwork}>
            Switch to Sepolia Network
          </button>
        </div>
      )}
      {error && <p className="mt-3 rounded-md bg-red-50 p-2 text-xs font-semibold text-red-700 border border-red-200">{error}</p>}
    </div>
  );
}

