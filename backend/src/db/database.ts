import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dbDirectory = path.resolve(process.cwd(), "data");

if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const databasePath = path.join(dbDirectory, "drone-missions.db");

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

export default db;