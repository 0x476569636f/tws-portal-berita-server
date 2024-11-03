import { Env } from "@/env.type";
import { adminOnly, authenticated } from "@/middleware/auth.middleware";
import { DatabaseService } from "@/services/db.service";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono<{ Bindings: Env }>();

const CreateNewsSchema = z.object({
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  isi: z.string().min(10, "Isi minimal 10 karakter"),
  kategoriId: z.number().int(),
  userId: z.number().int(),
});

app.get("/", ...authenticated, async (c) => {
  try {
    const { limit } = c.req.query();
    if (limit) {
      try {
        const dbService = new DatabaseService(c.env.DATABASE_URL);
        const news = await dbService.getNewsByLimit(Number(limit));
        return c.json({ success: true, news });
      } catch (error) {
        console.error(error);
        return c.json({ success: false, message: "Terjadi kesalahan" }, 500);
      }
    }
    const dbService = new DatabaseService(c.env.DATABASE_URL);
    const news = await dbService.getAllNews();
    return c.json({ success: true, news });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Terjadi kesalahan" }, 500);
  }
});

app.get("/limit", ...authenticated, async (c) => {
  try {
    const { limit } = c.req.query();
    return c.json({ limit });
  } catch (error) {}
});

app.post(
  "/create",
  ...adminOnly,
  zValidator("json", CreateNewsSchema),
  async (c) => {
    try {
      const { judul, isi, kategoriId, userId } = c.req.valid("json");
      const dbService = new DatabaseService(c.env.DATABASE_URL);
      const newNews = await dbService.createNews({
        judul,
        isi,
        kategoriId,
        userId,
      });

      return c.json({
        success: true,
        message: "Berita berhasil dibuat",
        newNews,
      });
    } catch (error) {
      console.error(error);
      return c.json({ success: false, message: "Terjadi kesalahan" }, 500);
    }
  }
);

app.delete("/:id{[0-9]+}", ...adminOnly, async (c) => {
  try {
    const newsId = Number(c.req.param("id"));
    const dbService = new DatabaseService(c.env.DATABASE_URL);
    const deletedNews = await dbService.deleteNews(newsId);

    if (!deletedNews) {
      return c.json({ message: "Berita tidak ditemukan" }, 404);
    }
    return c.json({
      success: true,
      message: `Berita dengan id ${newsId} berhasil dihapus`,
      deletedNews,
    });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Terjadi kesalahan" }, 500);
  }
});

export default app;
