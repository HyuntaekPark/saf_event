import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import express from "express";
import {
  createRecord,
  deleteRecord,
  deleteRecords,
  getRecords,
  getSettings,
  updateSettings
} from "../lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT || 5173);
const app = express();

app.use(express.json());
app.use(express.static(rootDir));

app.get("/api/settings", async (_request, response, next) => {
  try {
    response.json(await getSettings());
  } catch (error) {
    next(error);
  }
});

app.put("/api/settings", async (request, response, next) => {
  try {
    response.json(await updateSettings(request.body?.attemptCount));
  } catch (error) {
    next(error);
  }
});

app.get("/api/records", async (_request, response, next) => {
  try {
    response.json({ records: await getRecords() });
  } catch (error) {
    next(error);
  }
});

app.post("/api/records", async (request, response, next) => {
  try {
    response.status(201).json({ record: await createRecord(request.body) });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/records/:id", async (request, response, next) => {
  try {
    await deleteRecord(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.delete("/api/records", async (_request, response, next) => {
  try {
    await deleteRecords();
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(error.statusCode || 500).json({
    error: error.statusCode ? error.message : "서버에서 문제가 발생했습니다."
  });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`SAF 파이 이벤트 서버 실행 중: http://127.0.0.1:${PORT}/`);
});
