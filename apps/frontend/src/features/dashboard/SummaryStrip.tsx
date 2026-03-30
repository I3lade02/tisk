import type { DashboardSummary } from "@tisk/shared";

import { MetricCard } from "../../components/MetricCard";
import { formatDateTime } from "../../lib/format";

interface SummaryStripProps {
  summary: DashboardSummary | null;
}

export function SummaryStrip({ summary }: SummaryStripProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Celkem tiskáren" value={summary?.total ?? "0"} />
      <MetricCard label="Online" value={summary?.online ?? "0"} tone="accent" />
      <MetricCard label="Warning" value={summary?.warnings ?? "0"} tone="warn" />
      <MetricCard label="Poslední kontrola" value={formatDateTime(summary?.lastCheckAt ?? null)} />
    </div>
  );
}
