import type { ActionStatus, Sector } from "@/lib/types";

export const sectorLabels: Record<Sector, string> = {
  transport: "Transport",
  energy: "Energy",
  buildings: "Buildings",
  waste: "Waste",
  land_use: "Land use"
};

export const statusLabels: Record<ActionStatus, string> = {
  planned: "Planned",
  in_progress: "In progress",
  completed: "Completed"
};
