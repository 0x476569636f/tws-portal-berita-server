import { Env } from "@/env.type";
import { DatabaseService } from "@/services/db.service";
import { Hono } from "hono";
import { hashPassword, verifyPassword } from "@/utils/crypto";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { AuthService } from "@/services/auth.service";

const app = new Hono<{ Bindings: Env }>();

//Register

const RegisterSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

app.post("/register", zValidator("json", RegisterSchema), async (c) => {
  try {
    const { name, email, password } = c.req.valid("json");

    const dbService = new DatabaseService(c.env.DATABASE_URL);

    const existingUser = await dbService.findUserByEmail(email);
    if (existingUser) {
      return c.json({ message: "Email sudah terdaftar" }, 400);
    }

    const hashedPassword = await hashPassword(password);

    await dbService.createUser({
      name,
      email,
      password: hashedPassword,
    });

    return c.json({ message: "Berhasil mendaftar" }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ message: "Terjadi kesalahan" }, 500);
  }
});

//Login

const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string(),
});

app.post("/login", zValidator("json", LoginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid("json");

    const dbService = new DatabaseService(c.env.DATABASE_URL);
    const authService = new AuthService(c.env.JWT_SECRET);

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return c.json({ message: "Email atau password salah" }, 400);
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return c.json({ message: "Email atau password salah" }, 400);
    }

    const token = await authService.createToken({
      userId: user.id.toString(),
      role: user.role,
    });

    return c.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Terjadi kesalahan" }, 500);
  }
});

export default app;
