import { z } from "zod";
import { actionStatuses, sectors } from "@/lib/types";

export const citySettingsSchema = z.object({
  name: z.string().min(2, "City name is required").max(80),
  baselineEmissions: z.coerce.number().int().positive("Baseline emissions must be positive"),
  targetYear: z.coerce.number().int().min(new Date().getFullYear(), "Target year cannot be in the past").max(2100)
});

export const actionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Title is required").max(120),
  sector: z.enum(sectors),
  annualReduction: z.coerce.number().int().nonnegative("Reduction cannot be negative"),
  status: z.enum(actionStatuses),
  startYear: z.coerce.number().int().min(1990).max(2100)
});

export const importActionSchema = z.object({
  text: z.string().min(30, "Paste at least a sentence or two about the action").max(4000)
});

export type CitySettingsInput = z.infer<typeof citySettingsSchema>;
export type ActionInput = z.infer<typeof actionSchema>;
