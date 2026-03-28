"""
database.py — SQLite database setup and helper functions
ElecPro: Electrician Contractor Management System
"""

import sqlite3
from werkzeug.security import generate_password_hash

# Path to the SQLite database file
DATABASE = 'electrician.db'


def get_db():
    """Open a new database connection."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row   # lets us access columns by name
    return conn


def init_db():
    """Create all tables and insert a default admin user if not present."""
    conn = get_db()
    cursor = conn.cursor()

    # ── Users table ─────────────────────────────────────────────────────────
    # role: 'admin', 'electrician', or 'user'
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT    NOT NULL,
            email    TEXT    NOT NULL UNIQUE,
            password TEXT    NOT NULL,
            role     TEXT    NOT NULL DEFAULT 'user'
        )
    ''')

    # ── Electricians table ───────────────────────────────────────────────────
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS electricians (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            name  TEXT NOT NULL,
            phone TEXT,
            skill TEXT,
            email TEXT
        )
    ''')

    # ── Jobs table ───────────────────────────────────────────────────────────
    # status: 'pending', 'in_progress', 'completed'
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT    NOT NULL,
            description TEXT,
            status      TEXT    NOT NULL DEFAULT 'pending',
            created_at  TEXT    DEFAULT (date('now'))
        )
    ''')

    # ── Tasks table ──────────────────────────────────────────────────────────
    # assigned_to: name of electrician (simple text for beginner-friendly code)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id      INTEGER REFERENCES jobs(id),
            assigned_to TEXT,
            description TEXT,
            status      TEXT    NOT NULL DEFAULT 'pending'
        )
    ''')

    # ── Materials table ──────────────────────────────────────────────────────
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS materials (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT    NOT NULL,
            quantity INTEGER DEFAULT 0,
            unit     TEXT    DEFAULT 'pcs',
            job_id   INTEGER REFERENCES jobs(id)
        )
    ''')

    # ── Seed default admin account ───────────────────────────────────────────
    existing = cursor.execute(
        "SELECT id FROM users WHERE email = 'admin@elecpro.com'"
    ).fetchone()

    if not existing:
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ('Admin', 'admin@elecpro.com',
             generate_password_hash('admin123'), 'admin')
        )

    conn.commit()
    conn.close()
    print("✅ Database initialised successfully.")
