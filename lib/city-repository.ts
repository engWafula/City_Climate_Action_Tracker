import { prisma } from "@/lib/prisma";
import type { CityWithActions } from "@/lib/types";

export async function getPrimaryCity(): Promise<CityWithActions> {
  const city = await prisma.city.findFirst({
    orderBy: { createdAt: "asc" },
    include: {
      actions: {
        orderBy: [{ status: "asc" }, { startYear: "asc" }, { title: "asc" }]
      }
    }
  });

  if (!city) {
    throw new Error("No city has been configured. Run `npm run db:seed` first.");
  }

  return city;
}
