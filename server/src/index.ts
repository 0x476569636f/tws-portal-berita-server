import { Hono } from "hono";
import AuthRoute from "@/route/auth.route";
import AdminRoute from "@/route/admin.route";
import { cors } from "hono/cors";
import { adminOnly } from "./middleware/auth.middleware";

const app = new Hono().basePath("/api");

app.use("/api/*", cors());

app.route("auth", AuthRoute);

app.use("admin/*", ...adminOnly); // Middleware
app.route("admin", AdminRoute);

export default app;
