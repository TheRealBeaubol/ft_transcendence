import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

export async function openDb() {
	const db = await open({
		filename: path.join(process.cwd(), "data", "mydb.sqlite"),
		driver: sqlite3.Database
	});
	await db.run('PRAGMA foreign_keys = ON;');
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
		CREATE TABLE IF NOT EXISTS friends (
			user_id INTEGER NOT NULL,
			friend_id INTEGER NOT NULL,
			PRIMARY KEY (user_id, friend_id),
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
		);
		CREATE TABLE IF NOT EXISTS friend_requests (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			requester_id INTEGER NOT NULL,
			receiver_id INTEGER NOT NULL,
			status TEXT CHECK(status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
		);
		CREATE TABLE IF NOT EXISTS tournaments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			is_started BOOLEAN DEFAULT 0,
			creator_id INTEGER NOT NULL,
			created_at TEXT NOT NULL
		);	
		CREATE TABLE IF NOT EXISTS tournament_players (
			tournament_id INTEGER,
			user_id INTEGER,
			PRIMARY KEY (tournament_id, user_id),
			FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		);
		CREATE TABLE IF NOT EXISTS tournament_matches (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			tournament_id INTEGER,
			player1_id INTEGER,
			player2_id INTEGER,
			winner_id INTEGER,
			round INTEGER,
			is_finished BOOLEAN DEFAULT 0,
			FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
			FOREIGN KEY (player1_id) REFERENCES users(id),
			FOREIGN KEY (player2_id) REFERENCES users(id),
			FOREIGN KEY (winner_id) REFERENCES users(id)
		);


	`);
	return db;
}
