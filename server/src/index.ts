import { Hono } from "hono";
import AuthRoute from "@/route/auth.route";
import { cors } from "hono/cors";

const app = new Hono().basePath("/api");

app.use("/api/*", cors());

app.route("auth", AuthRoute);

export default app;
