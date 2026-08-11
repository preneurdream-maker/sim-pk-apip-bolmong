// prisma/reset.js
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

async function main() {
  console.log("Resetting tables...");
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "users", "audit_engagements", "audit_kka", "evidens", "kka_reviews", "tlhp_items" CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "UserRole", "EngagementType", "RiskLevel", "EngagementStatus", "KKAStatus", "TLHPStatus" CASCADE;`);
  console.log("Tables reset.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
