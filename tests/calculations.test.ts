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
        annualReduction: 500,
        status: "planned",
        startYear: currentYear
      }
    ],
    ...overrides
  };
}

describe("climate calculations", () => {
  it("tracks total commitments separately from credited reductions", () => {
    const result = city();

    expect(getTotalAnnualReduction(result)).toBe(1050);
    expect(getReductionPercent(result)).toBe(105);
    expect(getCreditedAnnualReduction(result)).toBe(550);
  });

  it("excludes planned actions from credited sector breakdowns", () => {
    const breakdown = getSectorBreakdown(city(), true);

    expect(breakdown.find((item) => item.sector === "energy")?.total).toBe(300);
    expect(breakdown.find((item) => item.sector === "transport")?.total).toBe(250);
    expect(breakdown.find((item) => item.sector === "buildings")?.total).toBe(0);
  });

  it("uses credited actions for projected emissions", () => {
    const projection = getProjectedEmissions(city());
    const current = projection.find((point) => point.year === currentYear);

    expect(current?.emissions).toBe(450);
  });

  it("only reports on track when credited target-year projection reaches zero", () => {
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
              status: "in_progress",
              startYear: currentYear
            }
          ]
        })
      )
    ).toBe(true);
  });
});
