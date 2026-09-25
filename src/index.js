import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "./lib/config.js";
import authRouter from "./routes/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(morgan("dev"));
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);

app.listen(config.port, () =>
  console.log(`API listening on http://localhost:${config.port}`),
);
