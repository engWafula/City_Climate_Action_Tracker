"use client";

import dynamic from "next/dynamic";
import type { ProjectionPoint } from "@/lib/types";

const ProjectionChartClient = dynamic(() => import("@/components/projection-chart-client").then((mod) => mod.ProjectionChartClient), {
  ssr: false,
  loading: () => <div className="h-72 rounded-lg border border-slate-200 bg-white" />
});

export function ProjectionChart({ data }: { data: ProjectionPoint[] }) {
  return <ProjectionChartClient data={data} />;
}
