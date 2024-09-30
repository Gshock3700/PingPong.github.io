CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO leaderboard (name, score) VALUES
    ('Player1', 100),
    ('Player2', 90),
    ('Player3', 80),
    ('Player4', 70),
    ('Player5', 60);
