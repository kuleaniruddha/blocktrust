export default function MetricCard({ label, value, tone = "text-ink" }) {
  return (
    <div className="panel rounded-lg p-4">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
    </div>
  );
}
