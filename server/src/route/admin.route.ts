import { Hono } from "hono";
import { DatabaseService } from "@/services/db.service";
import { Env } from "@/env.type";
import { hashPassword } from "@/utils/crypto";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono<{ Bindings: Env }>();

app.get("/users", async (c) => {
  try {
    const dbService = new DatabaseService(c.env.DATABASE_URL);
    const users = await dbService.getAllUsers();

    return c.json({ success: true, users });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Terjadi kesalahan" }, 500);
  }
});

app.get("/users/:id{[0-9]+}", async (c) => {
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

app.delete("/users/:id{[0-9]+}", async (c) => {
  try {
    const userId = Number(c.req.param("id"));
    const dbService = new DatabaseService(c.env.DATABASE_URL);
    const deletedUser = await dbService.deleteUser(userId);

    if (!deletedUser) {
      return c.json({ message: "User tidak ditemukan" }, 404);
    }
    return c.json({
      success: true,
      message: `User dengan id ${userId} berhasil dihapus`,
      deletedUser,
    });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Terjadi kesalahan" }, 500);
  }
});

const CreateAdminSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

app.post("/create-admin", zValidator("json", CreateAdminSchema), async (c) => {
  try {
    const { name, email, password } = c.req.valid("json");

    const dbService = new DatabaseService(c.env.DATABASE_URL);

    const existingUser = await dbService.findUserByEmail(email);
    if (existingUser) {
      return c.json({ error: "Email already exists" }, 400);
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await dbService.createUser({
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
    });

    return c.json({
      success: true,
      message: "Admin berhasil dibuat",
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Terjadi kesalahan" }, 500);
  }
});

export default app;
