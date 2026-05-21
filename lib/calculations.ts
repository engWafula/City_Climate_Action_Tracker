import { sectors, type CityWithActions, type ProjectionPoint, type SectorBreakdown } from "@/lib/types";

export function getCurrentYear() {
  return new Date().getFullYear();
}

export function isActionCredited(action: CityWithActions["actions"][number], year = getCurrentYear()) {
  return action.startYear <= year && action.status !== "planned";
}

export function getTotalAnnualReduction(city: CityWithActions) {
  return city.actions.reduce((total, action) => total + action.annualReduction, 0);
}

export function getCreditedAnnualReduction(city: CityWithActions, year = getCurrentYear()) {
  return city.actions
    .filter((action) => isActionCredited(action, year))
    .reduce((total, action) => total + action.annualReduction, 0);
}

export function getReductionPercent(city: CityWithActions) {
  if (city.baselineEmissions <= 0) {
    return 0;
  }

  return (getTotalAnnualReduction(city) / city.baselineEmissions) * 100;
}

export function getCreditedReductionPercent(city: CityWithActions, year = getCurrentYear()) {
  if (city.baselineEmissions <= 0) {
    return 0;
  }

  return (getCreditedAnnualReduction(city, year) / city.baselineEmissions) * 100;
}

export function getSectorBreakdown(city: CityWithActions, creditedOnly = false): SectorBreakdown[] {
  const actionsToCount = creditedOnly ? city.actions.filter((action) => isActionCredited(action)) : city.actions;
  const total = actionsToCount.reduce((sum, action) => sum + action.annualReduction, 0);

  return sectors.map((sector) => {
    const actions = actionsToCount.filter((action) => action.sector === sector);
    const sectorTotal = actions.reduce((sum, action) => sum + action.annualReduction, 0);

    return {
      sector,
      total: sectorTotal,
      count: actions.length,
      percentOfReductions: total > 0 ? (sectorTotal / total) * 100 : 0
    };
  });
}

export function getProjectedEmissions(city: CityWithActions): ProjectionPoint[] {
  const currentYear = getCurrentYear();
  const startYear = Math.min(currentYear, ...city.actions.map((action) => action.startYear));
  const endYear = Math.max(city.targetYear, currentYear);

  return Array.from({ length: endYear - startYear + 1 }, (_, index) => {
    const year = startYear + index;
    const activeReduction = city.actions
      .filter((action) => isActionCredited(action, year))
      .reduce((sum, action) => sum + action.annualReduction, 0);

    return {
      year,
      emissions: Math.max(city.baselineEmissions - activeReduction, 0)
    };
  });
}

export function isCityOnTrack(city: CityWithActions) {
  const targetYearEmissions = getProjectedEmissions(city).find((point) => point.year === city.targetYear)?.emissions;
  return targetYearEmissions === 0;
}

export function getRequiredAnnualPace(city: CityWithActions) {
  const yearsRemaining = Math.max(city.targetYear - getCurrentYear(), 1);
  return city.baselineEmissions / yearsRemaining;
}
