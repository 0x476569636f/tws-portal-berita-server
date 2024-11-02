import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "./schema";
import { hashPassword } from "@/utils/crypto";

config({
  path: ".dev.vars",
});

(async () => {
  try {
    const db = drizzle(process.env.DATABASE_URL!);
    const hashedPassword = await hashPassword("password");
    const res = await db.insert(users).values({
      name: "admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
    });
    if (res) {
      console.log("Seed data created");
    }
  } catch (error) {
    console.error(error);
  }
})();
