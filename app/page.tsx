import { AppShell } from "@/components/app-shell";
import { ActionTable } from "@/components/action-table";
import { Badge } from "@/components/ui/badge";
import { MetricCard } from "@/components/metric-card";
import { ProjectionChart } from "@/components/projection-chart";
import { SectorBreakdown } from "@/components/sector-breakdown";
import {
  getCreditedAnnualReduction,
  getCreditedReductionPercent,
  getProjectedEmissions,
  getReductionPercent,
  getRequiredAnnualPace,
  getSectorBreakdown,
  getTotalAnnualReduction,
  isCityOnTrack
} from "@/lib/calculations";
import { getPrimaryCity } from "@/lib/city-repository";
import { formatPercent, formatTons } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PublicPage() {
  const city = await getPrimaryCity();
  const totalReduction = getTotalAnnualReduction(city);
  const creditedReduction = getCreditedAnnualReduction(city);
  const reductionPercent = getReductionPercent(city);
  const creditedReductionPercent = getCreditedReductionPercent(city);
  const sectorBreakdown = getSectorBreakdown(city);
  const projection = getProjectedEmissions(city);
  const onTrack = isCityOnTrack(city);
  const requiredPace = getRequiredAnnualPace(city);

  return (
    <AppShell>
      <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Public dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">{city.name} climate progress</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Actions are measured against a {formatTons(city.baselineEmissions)} ton annual CO2 baseline and a {city.targetYear} net-zero target.
          </p>
        </div>
        <Badge tone={onTrack ? "green" : "red"}>{onTrack ? "On track" : "Not on track"}</Badge>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Estimated commitments" value={`${formatTons(totalReduction)} tons/year`} detail={`${formatPercent(reductionPercent)} of baseline`} />
        <MetricCard title="Credited reductions" value={`${formatTons(creditedReduction)} tons/year`} detail={`${formatPercent(creditedReductionPercent)} active or completed`} />
        <MetricCard title="Required pace" value={`${formatTons(Math.round(requiredPace))} tons/year`} detail={`To reach net zero by ${city.targetYear}`} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <ProjectionChart data={projection} />
        <SectorBreakdown breakdown={sectorBreakdown} />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-normal">Climate actions</h2>
            <p className="text-sm text-slate-500">Public list of planned, active, and completed initiatives.</p>
          </div>
        </div>
        <ActionTable actions={city.actions} />
      </section>
    </AppShell>
  );
}
