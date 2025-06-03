import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

export async function openDb() {
  const db = await open({
    filename: path.join(process.cwd(), "data", "mydb.sqlite"),
    driver: sqlite3.Database
  });
  return db;
}

export async function initDb() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      email TEXT,
      avatar TEXT
    );
  `);
  return db;
}
