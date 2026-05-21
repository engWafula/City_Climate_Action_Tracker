import OpenAI from "openai";
import { z } from "zod";
import { actionSchema } from "@/lib/validation";

const parsedActionSchema = actionSchema.omit({ id: true });

export async function parseActionFromText(text: string) {
  if (!process.env.OPENAI_API_KEY) {
    return heuristicParse(text);
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Extract one city climate action from policy text. Return strict JSON with title, sector, annualReduction, status, and startYear. Valid sectors: transport, energy, buildings, waste, land_use. Valid statuses: planned, in_progress, completed."
        },
        { role: "user", content: text }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "climate_action",
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["title", "sector", "annualReduction", "status", "startYear"],
            properties: {
              title: { type: "string" },
              sector: { type: "string", enum: ["transport", "energy", "buildings", "waste", "land_use"] },
              annualReduction: { type: "integer", minimum: 0 },
              status: { type: "string", enum: ["planned", "in_progress", "completed"] },
              startYear: { type: "integer", minimum: 1990, maximum: 2100 }
            }
          }
        }
      }
    });

    return parsedActionSchema.parse(JSON.parse(response.output_text));
  } catch (error) {
    console.warn("OpenAI action import failed; using heuristic parser.", error);
    return heuristicParse(text);
  }
}

export function heuristicParse(text: string): z.infer<typeof parsedActionSchema> {
  const lower = text.toLowerCase();
  const yearMatch = text.match(/\b(20\d{2}|19\d{2})\b/g);
  const reductionMatch = text.match(/([\d,]+)\s*(?:tons?|tonnes?)\s*(?:of\s*)?(?:co2|carbon)/i);

  return parsedActionSchema.parse({
    title: inferTitle(lower),
    sector: inferSector(lower),
    annualReduction: reductionMatch ? Number(reductionMatch[1].replaceAll(",", "")) : 0,
    status: inferStatus(lower),
    startYear: yearMatch ? Number(yearMatch.at(-1)) : new Date().getFullYear()
  });
}

function inferTitle(text: string) {
  if (text.includes("street lighting") || text.includes("led")) {
    return "LED street lighting conversion";
  }
  if (text.includes("bike")) {
    return "Bike network expansion";
  }
  if (text.includes("solar")) {
    return "Solar energy program";
  }
  if (text.includes("compost")) {
    return "Organic waste composting program";
  }
  return "Imported climate action";
}

function inferSector(text: string) {
  if (text.includes("bike") || text.includes("transit") || text.includes("ev") || text.includes("fleet")) {
    return "transport";
  }
  if (text.includes("solar") || text.includes("energy") || text.includes("led") || text.includes("lighting")) {
    return "energy";
  }
  if (text.includes("building") || text.includes("retrofit")) {
    return "buildings";
  }
  if (text.includes("waste") || text.includes("compost")) {
    return "waste";
  }
  if (text.includes("tree") || text.includes("forest") || text.includes("land")) {
    return "land_use";
  }
  return "energy";
}

function inferStatus(text: string) {
  if (text.includes("planning") || text.includes("planned")) {
    return "planned";
  }
  if (text.includes("complete") || text.includes("deployed")) {
    return "completed";
  }
  if (text.includes("progress") || text.includes("underway")) {
    return "in_progress";
  }
  return "planned";
}
