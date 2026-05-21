"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  createCity as createCityRecord,
  deleteCity as deleteCityRecord,
  removeClimateAction,
  saveClimateAction,
  updateCitySettings as updateCitySettingsRecord
} from "@/lib/climate-action-service";
import { actionSchema, citySettingsSchema } from "@/lib/validation";

export async function createCity(formData: FormData) {
  await requireAdmin();

  const input = citySettingsSchema.parse({
    name: formData.get("name"),
    baselineEmissions: formData.get("baselineEmissions"),
    targetYear: formData.get("targetYear")
  });

  const city = await createCityRecord(input);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/admin?cityId=${city.id}`);
}

export async function updateCitySettings(cityId: string, formData: FormData) {
  await requireAdmin();

  const input = citySettingsSchema.parse({
    name: formData.get("name"),
    baselineEmissions: formData.get("baselineEmissions"),
    targetYear: formData.get("targetYear")
  });

  await updateCitySettingsRecord(cityId, input);

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteCity(cityId: string) {
  await requireAdmin();

  await deleteCityRecord(cityId);

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function upsertClimateAction(cityId: string, formData: FormData) {
  await requireAdmin();

  const input = actionSchema.parse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    sector: formData.get("sector"),
    annualReduction: formData.get("annualReduction"),
    status: formData.get("status"),
    startYear: formData.get("startYear")
  });

  await saveClimateAction(cityId, input);

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteClimateAction(cityId: string, actionId: string) {
  await requireAdmin();

  await removeClimateAction(cityId, actionId);

  revalidatePath("/");
  revalidatePath("/admin");
}
