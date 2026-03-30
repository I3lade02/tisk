interface MetricCardProps {
  label: string;
  value: string | number;
  tone?: "default" | "accent" | "warn" | "danger";
}

const toneClassMap = {
  default: "from-white to-white",
  accent: "from-accent/5 to-white",
  warn: "from-amber-50 to-white",
  danger: "from-rose-50 to-white"
} as const;

export function MetricCard({ label, value, tone = "default" }: MetricCardProps) {
  return (
    <div className={`panel bg-gradient-to-br ${toneClassMap[tone]} p-5`}>
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold text-ink">{value}</div>
    </div>
  );
}
