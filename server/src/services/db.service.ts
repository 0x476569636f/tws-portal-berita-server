import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { users } from "@/db/schema";
import type { UsersTable, NewUser } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export class DatabaseService {
  private db: ReturnType<typeof drizzle>;

  constructor(databaseUrl: string) {
    const pool = new Pool({ connectionString: databaseUrl });
    this.db = drizzle(pool);
  }

  async createUser(user: NewUser): Promise<UsersTable> {
    const [NewUser] = await this.db.insert(users).values(user).returning();

    return NewUser;
  }

  async getAllUsers(): Promise<UsersTable[]> {
    const allUsers = await this.db
      .select()
      .from(users)
      .orderBy(asc(users.created_at));
    return allUsers;
  }

  async findUserByEmail(email: string): Promise<UsersTable | null> {
    const res = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return res[0] || null;
  }

  async findUserById(id: number): Promise<UsersTable | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  async deleteUser(id: number): Promise<UsersTable | null> {
    const [deletedUser] = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    return deletedUser || null;
  }
}
