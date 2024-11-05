import { Hono } from "hono";
import AuthRoute from "@/route/auth.route";
import AdminRoute from "@/route/admin.route";
import NewsRoute from "@/route/news.route";
import UsersRoute from "@/route/users.routes";
import CategoryRoute from "@/route/category.route";
import { cors } from "hono/cors";

const app = new Hono().basePath("/api");

app.use("/api/*", cors());

app.route("auth", AuthRoute);

app.route("admin", AdminRoute);
app.route("news", NewsRoute);
app.route("users", UsersRoute);
app.route("category", CategoryRoute);

export default app;
