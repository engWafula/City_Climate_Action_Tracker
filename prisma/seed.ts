import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: `${process.env.DATABASE_URL}` })
});

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin";

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      passwordHash: hashPassword(adminPassword),
      role: "admin"
    },
    create: {
      username: adminUsername,
      passwordHash: hashPassword(adminPassword),
      role: "admin"
    }
  });

  const city = await prisma.city.upsert({
    where: { id: "greenville" },
    update: {},
    create: {
      id: "greenville",
      name: "Greenville",
      baselineEmissions: 500000,
      targetYear: 2035
    }
  });

  const sampleActions: Prisma.ClimateActionUncheckedCreateInput[] = [
      {
        id: "greenville-bike-lanes",
        cityId: city.id,
        title: "Expand bike lane network",
        sector: "transport",
        annualReduction: 12000,
        status: "in_progress",
        startYear: 2024
      },
      {
        id: "greenville-solar-incentives",
        cityId: city.id,
        title: "Solar panel incentive program",
        sector: "energy",
        annualReduction: 45000,
        status: "in_progress",
        startYear: 2023
      },
      {
        id: "greenville-building-retrofits",
        cityId: city.id,
        title: "Municipal building retrofits",
        sector: "buildings",
        annualReduction: 18000,
        status: "planned",
        startYear: 2026
      },
      {
        id: "greenville-composting",
        cityId: city.id,
        title: "Organic waste composting program",
        sector: "waste",
        annualReduction: 8000,
        status: "completed",
        startYear: 2022
      },
      {
        id: "greenville-reforestation",
        cityId: city.id,
        title: "Urban reforestation initiative",
        sector: "land_use",
        annualReduction: 15000,
        status: "planned",
        startYear: 2025
      },
      {
        id: "greenville-ev-fleet",
        cityId: city.id,
        title: "EV fleet transition for public transit",
        sector: "transport",
        annualReduction: 30000,
        status: "planned",
        startYear: 2026
      }
    ];

  for (const action of sampleActions) {
    await prisma.climateAction.upsert({
      where: { id: action.id },
      update: {},
      create: action
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
