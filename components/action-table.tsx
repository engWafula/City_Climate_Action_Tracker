"use client";

import { useMemo } from "react";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { sectorLabels, statusLabels } from "@/lib/labels";
import { formatTons } from "@/lib/utils";
import type { ClimateAction } from "@/lib/types";

const statusTone = {
  planned: "amber",
  in_progress: "blue",
  completed: "green"
} as const;

export function ActionTable({ actions }: { actions: ClimateAction[] }) {
  const columns = useMemo<DataTableColumn<ClimateAction>[]>(
    () => [
      {
        key: "title",
        header: "Action",
        className: "px-4 py-3 font-medium text-slate-950",
        cell: (action) => action.title
      },
      {
        key: "sector",
        header: "Sector",
        cell: (action) => sectorLabels[action.sector]
      },
      {
        key: "reduction",
        header: "Reduction",
        cell: (action) => `${formatTons(action.annualReduction)} tons/year`
      },
      {
        key: "status",
        header: "Status",
        cell: (action) => <Badge tone={statusTone[action.status]}>{statusLabels[action.status]}</Badge>
      },
      {
        key: "startYear",
        header: "Start year",
        cell: (action) => action.startYear
      }
    ],
    []
  );

  return (
    <DataTable
      rows={actions}
      columns={columns}
      getRowId={(action) => action.id}
      getSearchText={(action) =>
        [action.title, sectorLabels[action.sector], statusLabels[action.status], action.annualReduction, action.startYear].join(" ")
      }
      searchPlaceholder="Search actions by title, sector, status, reduction, or year..."
      emptyMessage="No climate actions match your search."
    />
  );
}
