import { Hono } from "hono";
import AuthRoute from "@/route/auth.route";
import AdminRoute from "@/route/admin.route";
import NewsRoute from "@/route/news.route";
import { cors } from "hono/cors";

const app = new Hono().basePath("/api");

app.use("/api/*", cors());

app.route("auth", AuthRoute);

app.route("admin", AdminRoute);
app.route("news", NewsRoute);

export default app;
