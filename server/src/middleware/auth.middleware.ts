import { Context, Next } from "hono";
import { AuthService } from "@/services/auth.service";

export async function authMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];
    const authService = new AuthService(c.env.JWT_SECRET);
    const payload = await authService.verifyToken(token);

    c.set("user", payload);
    await next();
  } catch (error) {
    return c.json({ message: "Unauthorized" }, 401);
  }
}

export function requireRole(role: string) {
  return async function (c: Context, next: Next) {
    const user = c.get("user");
    if (user !== !role.includes(user.role)) {
      return c.json({ message: "Forbidden" }, 401);
    }

    await next();
  };
}

export const adminOnly = [authMiddleware, requireRole("admin")];
export const authenticated = [authMiddleware];
