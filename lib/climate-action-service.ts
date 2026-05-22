import { prisma } from "@/lib/prisma";
import type { ActionInput, CitySettingsInput } from "@/lib/validation";

export async function createCity(input: CitySettingsInput) {
  return prisma.city.create({
    data: input
  });
}

export async function updateCitySettings(cityId: string, input: CitySettingsInput) {
  return prisma.city.update({
    where: { id: cityId },
    data: input
  });
}

export async function saveClimateAction(cityId: string, input: ActionInput) {
  if (!input.id) {
    return prisma.climateAction.create({
      data: {
        cityId,
        title: input.title,
        sector: input.sector,
        annualReduction: input.annualReduction,
        status: input.status,
        startYear: input.startYear
      }
    });
  }

  const result = await prisma.climateAction.updateMany({
    where: {
      id: input.id,
      cityId
    },
    data: {
      title: input.title,
      sector: input.sector,
      annualReduction: input.annualReduction,
      status: input.status,
      startYear: input.startYear
    }
  });

  if (result.count !== 1) {
    throw new Error("Climate action not found for this city.");
  }
}

export async function removeClimateAction(cityId: string, actionId: string) {
  const result = await prisma.climateAction.deleteMany({
    where: {
      id: actionId,
      cityId
    }
  });

  if (result.count !== 1) {
    throw new Error("Climate action not found for this city.");
  }
}
