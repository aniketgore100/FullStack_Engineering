import "dotenv/config";
import express from "express";
import morgan from "morgan";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT) || 8000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
