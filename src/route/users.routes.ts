import { Hono } from "hono";
import { DatabaseService } from "@/services/db.service";
import { Env } from "@/env.type";

import { authenticated } from "@/middleware/auth.middleware";

const app = new Hono<{ Bindings: Env }>();

app.get("/", ...authenticated, async (c) => {
  try {
    const dbService = new DatabaseService(c.env.DATABASE_URL);
    const users = await dbService.getAllUsers();

    return c.json({ success: true, users });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Terjadi kesalahan" }, 500);
  }
});

app.get("/:id{[0-9]+}", ...authenticated, async (c) => {
  try {
    const userId = Number(c.req.param("id"));
    const dbService = new DatabaseService(c.env.DATABASE_URL);
    const user = await dbService.findUserById(userId);

    if (!user) {
      return c.json({ message: "User tidak ditemukan" }, 404);
    }
    return c.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Terjadi kesalahan" }, 500);
  }
});

export default app;
