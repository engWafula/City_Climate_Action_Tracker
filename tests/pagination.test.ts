import { describe, expect, it } from "vitest";
import { clampPage, filterItems, getPageCount, getPageRange, paginateItems } from "@/lib/pagination";

describe("pagination helpers", () => {
  it("always exposes at least one page", () => {
    expect(getPageCount(0, 5)).toBe(1);
    expect(getPageCount(11, 5)).toBe(3);
  });

  it("clamps requested pages into the valid range", () => {
    expect(clampPage(-4, 11, 5)).toBe(1);
    expect(clampPage(99, 11, 5)).toBe(3);
  });

  it("returns display ranges and slices for the requested page", () => {
    const items = [1, 2, 3, 4, 5, 6, 7];

    expect(getPageRange({ page: 2, pageSize: 3, totalItems: items.length })).toEqual({ start: 3, end: 6 });
    expect(paginateItems(items, 2, 3)).toEqual([4, 5, 6]);
  });

  it("filters items with case-insensitive search text", () => {
    const items = [
      { title: "Solar panel incentives", sector: "energy" },
      { title: "Bike lane expansion", sector: "transport" }
    ];

    expect(filterItems(items, "SOLAR", (item) => `${item.title} ${item.sector}`)).toEqual([items[0]]);
    expect(filterItems(items, "transport", (item) => `${item.title} ${item.sector}`)).toEqual([items[1]]);
    expect(filterItems(items, "", (item) => item.title)).toEqual(items);
  });
});
