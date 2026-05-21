import { describe, expect, it } from "vitest";
import {
  getCreditedAnnualReduction,
  getProjectedEmissions,
  getReductionPercent,
  getSectorBreakdown,
  getTotalAnnualReduction,
  isCityOnTrack
} from "@/lib/calculations";
import type { CityWithActions } from "@/lib/types";

const currentYear = new Date().getFullYear();

function city(overrides: Partial<CityWithActions> = {}): CityWithActions {
  return {
    id: "test-city",
    name: "Test City",
    baselineEmissions: 1000,
    targetYear: currentYear + 5,
    actions: [
      {
        id: "completed",
        title: "Completed action",
        sector: "energy",
        annualReduction: 300,
        status: "completed",
        startYear: currentYear - 1
      },
      {
        id: "active",
        title: "Active action",
        sector: "transport",
        annualReduction: 250,
        status: "in_progress",
        startYear: currentYear
      },
      {
        id: "planned",
        title: "Planned action",
        sector: "buildings",
        annualReduction: 400,
        status: "planned",
        startYear: currentYear + 2
      }
    ],
    ...overrides
  };
}

describe("climate calculations", () => {
  it("tracks total commitments separately from credited reductions", () => {
    const result = city();

    expect(getTotalAnnualReduction(result)).toBe(950);
    expect(getReductionPercent(result)).toBe(95);
    expect(getCreditedAnnualReduction(result)).toBe(550);
  });

  it("excludes planned actions from credited sector breakdowns", () => {
    const breakdown = getSectorBreakdown(city(), true);

    expect(breakdown.find((item) => item.sector === "energy")?.total).toBe(300);
    expect(breakdown.find((item) => item.sector === "transport")?.total).toBe(250);
    expect(breakdown.find((item) => item.sector === "buildings")?.total).toBe(0);
  });

  it("uses all entered actions by start year for projected emissions", () => {
    const projection = getProjectedEmissions(city());
    const current = projection.find((point) => point.year === currentYear);
    const plannedStart = projection.find((point) => point.year === currentYear + 2);

    expect(current?.emissions).toBe(450);
    expect(plannedStart?.emissions).toBe(50);
  });

  it("reports on track when entered action projections reach zero by the target year", () => {
    expect(isCityOnTrack(city())).toBe(false);

    expect(
      isCityOnTrack(
        city({
          actions: [
            {
              id: "net-zero",
              title: "Net zero action",
              sector: "energy",
              annualReduction: 1000,
              status: "planned",
              startYear: currentYear + 2
            }
          ]
        })
      )
    ).toBe(true);
  });
});
