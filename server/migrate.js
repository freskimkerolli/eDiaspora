import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

const sql = readFileSync(path.join(__dirname, "schema.sql"), "utf8");

try {
  await pool.query(sql);
  console.log("Migrimi u aplikua me sukses.");
} catch (err) {
  console.error("Migrimi dështoi:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
