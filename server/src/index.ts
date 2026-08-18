import "./env.ts";
import cors from "cors";
import express from "express";
import { sql } from "drizzle-orm";
import { db } from "./db/client.ts";

const app = express();
const port = process.env.PORT ?? 4000;

// Permissive in dev since Vite auto-shifts ports when the default is taken;
// tighten to a fixed CLIENT_ORIGIN before this ever leaves localhost.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", async (_req, res) => {
  await db.execute(sql`select 1`);
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
