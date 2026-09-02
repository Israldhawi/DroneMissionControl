PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS pilots (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    license_number TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (
        role IN ('admin', 'pilot')
    ),
    is_active INTEGER NOT NULL CHECK (
        is_active IN (0, 1)
    ),
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    pilot_id TEXT NOT NULL,
    location TEXT NOT NULL,
    scheduled_at TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (
        duration_minutes BETWEEN 1 AND 120
    ),
    battery_start REAL NOT NULL CHECK (
        battery_start BETWEEN 0 AND 100
    ),
    battery_end REAL,
    weather TEXT NOT NULL CHECK (
        weather IN ('clear', 'cloudy', 'windy', 'rain')
    ),
    status TEXT NOT NULL CHECK (
        status IN (
            'planned',
            'in_progress',
            'completed',
            'aborted'
        )
    ),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pilot_id)
        REFERENCES pilots(id)
);