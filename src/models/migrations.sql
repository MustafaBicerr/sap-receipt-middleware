PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS inbound_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id TEXT NOT NULL,
  source TEXT,
  payload TEXT,
  received_at TEXT
);

CREATE TABLE IF NOT EXISTS result_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id TEXT NOT NULL,
  result_json TEXT,
  created_at TEXT
);
