import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sectorLabels } from "@/lib/labels";
import { formatPercent, formatTons } from "@/lib/utils";
import type { SectorBreakdown } from "@/lib/types";

export function SectorBreakdown({ breakdown }: { breakdown: SectorBreakdown[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakdown by sector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {breakdown.map((item) => (
          <div key={item.sector} className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-slate-700">{sectorLabels[item.sector]}</span>
              <span className="text-slate-500">
                {formatTons(item.total)} tons ({formatPercent(item.percentOfReductions)})
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-emerald-600"
                style={{ width: `${Math.min(item.percentOfReductions, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
