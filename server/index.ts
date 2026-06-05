import "./types";

import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { config } from "./config";
import { prisma } from "./db";
import { requireAuth } from "./middleware/auth";
import { authRouter } from "./routes/auth";
import { submissionsRouter } from "./routes/submissions";

const app = express();

app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "startsmart-api" });
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: req.auth });
});

app.use("/api/auth", authRouter);
app.use("/api/submissions", submissionsRouter);

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      issues: error.flatten(),
    });
  }

  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
};

app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`API server listening on http://localhost:${config.port}`);
});

const shutdown = async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
