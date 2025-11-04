import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'logs.sqlite');

export const db = new sqlite3.Database(dbPath);

function runMigrations() {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations.sql'), 'utf8');
  db.exec(sql);
}
runMigrations();

// CLI: node src/models/db.js migrate
if (process.argv[2] === 'migrate') {
  runMigrations();
  console.log('Migrations done');
  process.exit(0);
}
