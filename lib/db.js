import crypto from "node:crypto";
import pg from "pg";

const { Pool } = pg;
const MIN_VALUE = 3.09;
const MAX_VALUE = 3.19;

let pool;
let databaseReady;

export function getPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  if (!pool) {
    const ssl = connectionString.includes("sslmode=require")
      ? undefined
      : { rejectUnauthorized: false };

    pool = new Pool({
      connectionString,
      ssl,
      max: 1
    });
  }

  return pool;
}

export async function ensureDatabase() {
  if (!databaseReady) {
    databaseReady = initDatabase().catch((error) => {
      databaseReady = undefined;
      throw error;
    });
  }

  return databaseReady;
}

export async function getSettings() {
  await ensureDatabase();

  const result = await getPool().query(
    "select value from app_settings where key = $1",
    ["attempt_count"]
  );

  return {
    attemptCount: normalizeAttemptCount(result.rows[0]?.value?.attemptCount || 1)
  };
}

export async function updateSettings(attemptCountValue) {
  await ensureDatabase();

  const attemptCount = normalizeAttemptCount(attemptCountValue);

  await getPool().query(
    `
      insert into app_settings (key, value)
      values ($1, $2::jsonb)
      on conflict (key)
      do update set value = excluded.value, updated_at = now()
    `,
    ["attempt_count", JSON.stringify({ attemptCount })]
  );

  return { attemptCount };
}

export async function getRecords() {
  await ensureDatabase();

  const result = await getPool().query(
    `
      select id, name, values, result, created_at
      from event_records
      order by created_at desc
    `
  );

  return result.rows.map(toClientRecord);
}

export async function createRecord(payload) {
  await ensureDatabase();

  const name = String(payload?.name || "").trim();
  const values = Array.isArray(payload?.values)
    ? payload.values.map(Number)
    : [];

  if (!name || values.length === 0 || values.some((value) => Number.isNaN(value))) {
    const error = new Error("이름과 숫자를 올바르게 입력해주세요.");
    error.statusCode = 400;
    throw error;
  }

  const resultValue = values.some(isOk) ? "O" : "X";
  const result = await getPool().query(
    `
      insert into event_records (id, name, values, result)
      values ($1, $2, $3::jsonb, $4)
      returning id, name, values, result, created_at
    `,
    [crypto.randomUUID(), name, JSON.stringify(values), resultValue]
  );

  return toClientRecord(result.rows[0]);
}

export async function deleteRecord(id) {
  await ensureDatabase();
  await getPool().query("delete from event_records where id = $1", [id]);
}

export async function deleteRecords() {
  await ensureDatabase();
  await getPool().query("delete from event_records");
}

export function normalizeAttemptCount(value) {
  const parsedValue = Number.parseInt(value, 10);
  if (Number.isNaN(parsedValue)) {
    return 1;
  }

  return Math.min(20, Math.max(1, parsedValue));
}

async function initDatabase() {
  await getPool().query(`
    create table if not exists event_records (
      id uuid primary key,
      name text not null,
      values jsonb not null,
      result char(1) not null check (result in ('O', 'X')),
      created_at timestamptz not null default now()
    )
  `);

  await getPool().query(`
    create table if not exists app_settings (
      key text primary key,
      value jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
}

function isOk(value) {
  return value >= MIN_VALUE && value <= MAX_VALUE;
}

function toClientRecord(record) {
  return {
    id: record.id,
    name: record.name,
    values: record.values,
    result: record.result,
    createdAt: record.created_at
  };
}
