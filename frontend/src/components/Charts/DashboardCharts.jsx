import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend);

export default function DashboardCharts({ analytics }) {
  const expenses = analytics?.expenseCategories || [];
  const donations = analytics?.monthlyDonations || [];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="panel rounded-lg p-4 flex flex-col justify-between">
        <h2 className="mb-4 text-base font-black">Monthly Donations</h2>
        {donations.length > 0 ? (
          <div className="h-64 flex items-center justify-center">
            <Bar
              data={{
                labels: donations.map((d) => (d._id?.month && d._id?.year ? `${d._id.month}/${d._id.year}` : "General")),
                datasets: [{ label: "Donations", data: donations.map((d) => d.total), backgroundColor: "#0f766e" }]
              }}
              options={{ maintainAspectRatio: false, responsive: true }}
            />
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-stone-50 rounded-lg border border-dashed border-stone-200 text-stone-500 text-sm">
            <p className="font-semibold text-stone-700">No Donations Recorded Yet</p>
            <p className="text-xs text-stone-400 mt-1">Donation amounts will appear here once submitted.</p>
          </div>
        )}
      </div>

      <div className="panel rounded-lg p-4 flex flex-col justify-between">
        <h2 className="mb-4 text-base font-black">Expense Categories</h2>
        {expenses.length > 0 ? (
          <div className="h-64 flex items-center justify-center">
            <Pie
              data={{
                labels: expenses.map((e) => e._id || "Uncategorized"),
                datasets: [{ data: expenses.map((e) => e.total), backgroundColor: ["#d97706", "#0f766e", "#2563eb", "#a16207", "#be123c", "#8b5cf6"] }]
              }}
              options={{ maintainAspectRatio: false, responsive: true }}
            />
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-stone-50 rounded-lg border border-dashed border-stone-200 text-stone-500 text-sm">
            <p className="font-semibold text-stone-700">No Expense Records in Firebase</p>
            <p className="text-xs text-stone-400 mt-1">When trust expenses are added to the database, their category breakdown will show here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
