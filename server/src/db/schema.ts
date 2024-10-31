import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 100 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type usersTable = typeof users.$inferSelect;
