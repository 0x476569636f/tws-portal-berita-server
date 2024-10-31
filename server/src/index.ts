import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hallo dunia");
});

export default app;
