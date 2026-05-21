import { afterEach, describe, expect, it, vi } from "vitest";
import { heuristicParse, parseActionFromText } from "@/lib/llm-import";

vi.mock("openai", () => ({
  default: class MockOpenAI {
    responses = {
      create: async () => {
        throw new Error("OpenAI unavailable");
      }
    };
  }
}));

afterEach(() => {
  delete process.env.OPENAI_API_KEY;
});

describe("heuristic action import", () => {
  it("parses the exercise sample text into a reviewable action", () => {
    const result = heuristicParse(
      "The city council approved a $2M investment to convert all street lighting to LED by 2027. The energy department estimates this will cut approximately 9,500 tons of CO2 per year once fully deployed. The project is currently in the planning phase."
    );

    expect(result).toEqual({
      title: "LED street lighting conversion",
      sector: "energy",
      annualReduction: 9500,
      status: "planned",
      startYear: 2027
    });
  });

  it("infers transport sector and in-progress status from transit notes", () => {
    const result = heuristicParse("The transit team is underway on an EV fleet program starting in 2026 that will reduce 30,000 tons CO2 annually.");

    expect(result.sector).toBe("transport");
    expect(result.status).toBe("in_progress");
    expect(result.annualReduction).toBe(30000);
    expect(result.startYear).toBe(2026);
  });

  it("falls back to the local parser when the OpenAI import request fails", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    const result = await parseActionFromText(
      "The energy office approved a solar energy program in 2028 that should reduce 12,400 tons of carbon annually."
    );

    expect(result).toEqual({
      title: "Solar energy program",
      sector: "energy",
      annualReduction: 12400,
      status: "planned",
      startYear: 2028
    });
  });
});
