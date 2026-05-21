export const sectors = ["transport", "energy", "buildings", "waste", "land_use"] as const;
export const actionStatuses = ["planned", "in_progress", "completed"] as const;

export type Sector = (typeof sectors)[number];
export type ActionStatus = (typeof actionStatuses)[number];

export type ClimateAction = {
  id: string;
  title: string;
  sector: Sector;
  annualReduction: number;
  status: ActionStatus;
  startYear: number;
};

export type CityWithActions = {
  id: string;
  name: string;
  baselineEmissions: number;
  targetYear: number;
  actions: ClimateAction[];
};

export type SectorBreakdown = {
  sector: Sector;
  total: number;
  count: number;
  percentOfReductions: number;
};

export type ProjectionPoint = {
  year: number;
  emissions: number;
};
