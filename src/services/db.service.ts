import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { berita, users } from "@/db/schema";
import type { UsersTable, NewUser, NewBerita, NewsWithUser } from "@/db/schema";
import * as schema from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";

type PublicUser = Omit<UsersTable, "password">;

export class DatabaseService {
  private db: ReturnType<typeof drizzle<typeof schema>>;

  constructor(databaseUrl: string) {
    const pool = new Pool({ connectionString: databaseUrl });
    this.db = drizzle(pool, { schema });
  }

  async createUser(user: NewUser): Promise<UsersTable> {
    const [NewUser] = await this.db.insert(users).values(user).returning();

    return NewUser;
  }

  async getAllUsers(): Promise<PublicUser[]> {
    const allUsers = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      })
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

  async findUserById(id: number): Promise<PublicUser | null> {
    const result = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      })
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

  async createNews(news: NewBerita): Promise<NewBerita> {
    const [NewBerita] = await this.db.insert(berita).values(news).returning();

    return NewBerita;
  }

  async getAllNews(): Promise<NewsWithUser[]> {
    const allNews = await this.db.query.berita.findMany({
      with: {
        user: { columns: { password: false } },
      },
      orderBy: desc(berita.createdAt),
    });
    return allNews as NewsWithUser[];
  }

  async getNewsByLimit(limit: number): Promise<NewsWithUser[]> {
    const allNews = await this.db.query.berita.findMany({
      with: {
        user: { columns: { password: false } },
      },
      orderBy: desc(berita.updatedAt),
      limit: limit,
    });
    return allNews as NewsWithUser[];
  }

  async findNewsById(id: number): Promise<NewsWithUser | null> {
    const result = await this.db.query.berita.findFirst({
      where: (berita) => eq(berita.id, id),
      with: {
        user: true,
      },
    });

    return result || null;
  }

  async deleteNews(id: number): Promise<NewBerita | null> {
    const [deletedNews] = await this.db
      .delete(berita)
      .where(eq(berita.id, id))
      .returning();

    return deletedNews || null;
  }

  async getAllCategories() {
    const categories = await this.db.query.kategori.findMany();
    return categories;
  }

  async deleteCategory(id: number) {
    const [deletedCategory] = await this.db
      .delete(schema.kategori)
      .where(eq(schema.kategori.id, id))
      .returning();

    return deletedCategory || null;
  }
}
