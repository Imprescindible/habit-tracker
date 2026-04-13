import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { habitsRouter } from "./routes/habits.ts";
import { completionsRouter } from "./routes/completions";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use("/api/habits", habitsRouter);
app.use("/api/habits", completionsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
});
