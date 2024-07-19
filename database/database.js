const sqlite3 = require('sqlite3');
const path = require('path');

// Open a database connection
const dbPath = path.resolve(__dirname, 'notes-app.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    tags TEXT,
    color TEXT DEFAULT 'white',
    archived INTEGER DEFAULT 0,
    trashed INTEGER DEFAULT 0,
    createdAt INTEGER,
    updatedAt INTEGER,
    userId INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`);
});

module.exports = db;
