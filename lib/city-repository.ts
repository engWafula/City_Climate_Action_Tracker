import { prisma } from "@/lib/prisma";
import type { CityWithActions } from "@/lib/types";

export async function getCities() {
  return prisma.city.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      baselineEmissions: true,
      targetYear: true,
      _count: {
        select: { actions: true }
      }
    }
  });
}

export async function getCityById(cityId: string): Promise<CityWithActions | null> {
  return prisma.city.findUnique({
    where: { id: cityId },
    include: {
      actions: {
        orderBy: [{ status: "asc" }, { startYear: "asc" }, { title: "asc" }]
      }
    }
  });
}

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

export async function getCityByIdOrPrimary(cityId?: string): Promise<CityWithActions> {
  if (cityId) {
    const city = await getCityById(cityId);

    if (city) {
      return city;
    }
  }

  return getPrimaryCity();
}
