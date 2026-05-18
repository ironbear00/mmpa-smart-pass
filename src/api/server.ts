import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import "./db";
import verifyRoutes from "./routes/verify";
import applicationRoutes from "./routes/applications";
import rulesRoutes from "./routes/rules";

const app = new Hono();

app.use("*", cors({ origin: "http://localhost:5173" }));

app.route("/api/verify", verifyRoutes);
app.route("/api/applications", applicationRoutes);
app.route("/api/rules", rulesRoutes);

app.get("/api/health", (c) =>
  c.json({ status: "ok", ts: new Date().toISOString() })
);

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(`\n🚀 MMPA Smart-Pass API → http://localhost:${info.port}`);
  console.log(`   POST /api/verify/domestic`);
  console.log(`   POST /api/verify/coa`);
  console.log(`   GET  /api/health\n`);
});
