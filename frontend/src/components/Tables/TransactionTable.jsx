import { shortHash, money } from "../../utils/format";

export default function TransactionTable({ rows = [] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-stone-100 text-stone-600">
          <tr>
            <th className="p-3">Donor</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Purpose</th>
            <th className="p-3">Hash</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id} className="border-t border-stone-100">
              <td className="p-3 font-semibold">{row.donorName}</td>
              <td className="p-3">{money(row.amount, row.currency)}</td>
              <td className="p-3">{row.purpose}</td>
              <td className="p-3 font-mono">{shortHash(row.transactionHash)}</td>
              <td className="p-3 capitalize">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
