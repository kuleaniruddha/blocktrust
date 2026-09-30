export default function MetricCard({
  label,
  value,
  tone = "text-stone-900",
  icon: Icon,
  subtitle,
  badge
}) {
  return (
    <div className="panel group rounded-2xl p-5 bg-white border border-stone-200/80 hover:border-amber-400/60 hover:shadow-glow transition-all duration-300 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {label}
          </p>
          <p className={`mt-2 text-2xl sm:text-3xl font-black tracking-tight ${tone}`}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-stone-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-saffron-600 border border-amber-200/50 shadow-xs group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-200">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] font-semibold text-stone-600">
          <span>{badge}</span>
        </div>
      )}
    </div>
  );
}
