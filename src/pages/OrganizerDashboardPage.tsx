import { useState } from "react";
import { useDashboardStatsQuery } from "@/hooks/useDashboard";
import { StatsBucket } from "@/api/dashboard";
import { formatIdr } from "@/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function BarChart({ buckets, valueKey }: { buckets: StatsBucket[]; valueKey: "revenueIdr" | "transactionCount" }) {
  if (buckets.length === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;
  const max = Math.max(...buckets.map((b) => b[valueKey]), 1);

  return (
    <div className="flex h-40 items-end gap-2 overflow-x-auto">
      {buckets.map((b) => (
        <div key={b.period} className="flex min-w-[2.5rem] flex-col items-center gap-1">
          <div
            className="w-8 rounded-t bg-gold"
            style={{ height: `${Math.max((b[valueKey] / max) * 100, 3)}%` }}
            title={valueKey === "revenueIdr" ? formatIdr(b.revenueIdr) : String(b.transactionCount)}
          />
          <span className="w-12 truncate text-center text-[10px] text-muted-foreground" title={b.period}>
            {b.period}
          </span>
        </div>
      ))}
    </div>
  );
}

export function OrganizerDashboardPage() {
  const { data: stats } = useDashboardStatsQuery();
  const [granularity, setGranularity] = useState<"byDay" | "byMonth" | "byYear">("byMonth");

  if (!stats) return <p className="p-6 text-muted-foreground">Loading dashboard&hellip;</p>;

  const buckets = stats[granularity];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Events</p>
            <p className="text-2xl font-bold">{stats.totals.events}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold">{stats.totals.transactions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Attendees</p>
            <p className="text-2xl font-bold">{stats.totals.attendees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Revenue</p>
            <p className="text-2xl font-bold">{formatIdr(stats.totals.revenueIdr)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Revenue &amp; orders over time</CardTitle>
          <div className="flex gap-1">
            {(["byDay", "byMonth", "byYear"] as const).map((g) => (
              <Button
                key={g}
                size="sm"
                variant={granularity === g ? "default" : "secondary"}
                className={cn(granularity !== g && "text-muted-foreground")}
                onClick={() => setGranularity(g)}
              >
                {g === "byDay" ? "Day" : g === "byMonth" ? "Month" : "Year"}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm font-semibold text-muted-foreground">Revenue (IDR)</p>
          <BarChart buckets={buckets} valueKey="revenueIdr" />
          <p className="mb-2 mt-6 text-sm font-semibold text-muted-foreground">Completed transactions</p>
          <BarChart buckets={buckets} valueKey="transactionCount" />
        </CardContent>
      </Card>
    </div>
  );
}
