import { Hono } from "hono";
import { DatabaseService } from "@/services/db.service";
import { Env } from "@/env.type";

import { adminOnly, authenticated } from "@/middleware/auth.middleware";

const app = new Hono<{ Bindings: Env }>();

app.get("/", ...authenticated, async (c) => {
  try {
    const dbService = new DatabaseService(c.env.DATABASE_URL);
    const categories = await dbService.getAllCategories();

    return c.json({ success: true, categories });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Terjadi kesalahan" }, 500);
  }
});

app.delete("/:id{[0-9]+}", ...adminOnly, async (c) => {
  try {
    const categoryId = Number(c.req.param("id"));
    const dbService = new DatabaseService(c.env.DATABASE_URL);
    const category = await dbService.deleteCategory(categoryId);

    if (!category) {
      return c.json({ message: "category tidak ditemukan" }, 404);
    }
    return c.json({ success: true, category });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Terjadi kesalahan" }, 500);
  }
});

export default app;
