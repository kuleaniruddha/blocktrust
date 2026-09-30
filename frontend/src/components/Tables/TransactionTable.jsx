import { shortHash, money } from "../../utils/format";
import { Download, ExternalLink, ShieldCheck, Wallet, QrCode } from "lucide-react";

export default function TransactionTable({ rows = [] }) {
  const downloadReceipt = (donationId) => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.open(`${apiUrl}/donation/${donationId}/receipt`, "_blank");
  };

  if (!rows || rows.length === 0) {
    return (
      <div className="panel rounded-2xl p-10 text-center bg-white border border-stone-200/80 space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <p className="text-sm font-bold text-stone-700">No Transactions Found</p>
        <p className="text-xs text-stone-500">
          Verified on-chain contributions will appear here in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-stone-50 text-[11px] font-black uppercase tracking-wider text-stone-600 border-b border-stone-200">
            <tr>
              <th className="py-3 px-4">Donor Name</th>
              <th className="py-3 px-4">Contribution</th>
              <th className="py-3 px-4">Payment Mode</th>
              <th className="py-3 px-4">Purpose / Drive</th>
              <th className="py-3 px-4">On-Chain Tx Hash</th>
              <th className="py-3 px-4 text-center">Audit Status</th>
              <th className="py-3 px-4 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((row) => {
              const rowId = row._id || row.id;
              const isEth = row.currency === "ETH" || row.paymentMode === "metamask";

              return (
                <tr key={rowId} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-stone-900 text-xs sm:text-sm">
                      {row.donorName || "Anonymous Devotee"}
                    </p>
                    {row.email && (
                      <p className="text-[11px] text-stone-400 font-mono">{row.email}</p>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-black text-xs sm:text-sm text-stone-900">
                    <span className={isEth ? "text-amber-800 font-extrabold" : "text-emerald-800"}>
                      {money(row.amount, row.currency)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-100 text-stone-700">
                      {isEth ? (
                        <>
                          <Wallet className="h-3.5 w-3.5 text-amber-600" />
                          <span>Ethereum</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                          <span>UPI QR</span>
                        </>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-xs font-semibold text-stone-700 max-w-[200px] truncate">
                    {row.purpose || "Mandir General Fund"}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-xs">
                    {row.transactionHash ? (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${row.transactionHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-saffron-700 hover:text-saffron-900 hover:underline font-bold"
                        title="Verify on Sepolia Etherscan"
                      >
                        {shortHash(row.transactionHash)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-stone-400 italic">Off-Chain UPI</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        row.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {row.status || "confirmed"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => downloadReceipt(rowId)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-800 hover:text-amber-950 hover:bg-amber-100/60 border border-amber-200 transition"
                      title="Download Cryptographic PDF Receipt"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
