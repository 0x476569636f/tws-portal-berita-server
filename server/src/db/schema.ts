import {
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["ADMIN", "USER"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 100 }).notNull(),
  role: roleEnum("role").notNull().default("USER"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type UsersTable = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
