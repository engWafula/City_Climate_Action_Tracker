import type { ActionStatus, Sector } from "@/lib/types";

export type DraftAction = {
  id?: string;
  title: string;
  sector: Sector | "";
  annualReduction: number | "";
  status: ActionStatus | "";
  startYear: number | "";
};

export const emptyDraft: DraftAction = {
  title: "",
  sector: "",
  annualReduction: "",
  status: "",
  startYear: ""
};

export const startYearOptions = Array.from({ length: 2100 - 1990 + 1 }, (_, index) => 1990 + index);
