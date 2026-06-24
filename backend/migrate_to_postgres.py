#!/usr/bin/env python3
"""
Migrate SQLite data → Neon PostgreSQL

Run from the backend/ directory:
    python migrate_to_postgres.py

Requirements: pip install psycopg2-binary sqlalchemy
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.types import Boolean

SQLITE_URL = "sqlite:///./devkalp_dev.db"
POSTGRES_URL = (
    "postgresql+psycopg2://neondb_owner:npg_yAo69HQwtIEj"
    "@ep-lively-morning-aowr0jbg-pooler.c-2.ap-southeast-1.aws.neon.tech"
    "/neondb?sslmode=require"
)

# Insert order matters — parent tables must come before child tables
TABLE_ORDER = [
    "users",
    "counselor_profiles",
    "matrimony_profiles",
    "matrimony_matches",
    "counseling_sessions",
    "family_members",
    "family_participation",
    "donation_campaigns",
    "donations",
    "campaigns",
    "campaign_sessions",
    "campaign_registrations",
    "campaign_attendees",
    "jobs",
    "job_applications",
    "volunteer_profiles",
    "volunteer_tasks",
    "emotional_questions",
    "emotional_readiness_responses",
    "emotional_answers",
    "activity_logs",
    "notifications",
    "general_applications",
]


def get_bool_columns(engine, table_name: str) -> set:
    """Return set of column names that are boolean type in the given engine."""
    inspector = inspect(engine)
    bool_cols = set()
    for col in inspector.get_columns(table_name):
        if isinstance(col["type"], Boolean):
            bool_cols.add(col["name"])
    return bool_cols


def cast_row(row: dict, bool_cols: set) -> dict:
    """Convert SQLite integer booleans (0/1) to Python bool for PostgreSQL."""
    result = {}
    for k, v in row.items():
        if k in bool_cols and isinstance(v, int):
            result[k] = bool(v)
        else:
            result[k] = v
    return result


def migrate():
    print("Connecting to SQLite (source)...")
    src_engine = create_engine(SQLITE_URL)

    print("Connecting to Neon PostgreSQL (destination)...")
    dst_engine = create_engine(POSTGRES_URL, connect_args={"connect_timeout": 30})

    print("\nCreating schema in PostgreSQL...")
    import app.models  # noqa: registers all SQLAlchemy models
    from app.database import Base
    Base.metadata.create_all(dst_engine)
    print("Schema ready.\n")

    src_tables = inspect(src_engine).get_table_names()

    with src_engine.connect() as src, dst_engine.connect() as dst:
        for table in TABLE_ORDER:
            if table not in src_tables:
                print(f"  SKIP  {table!r} — not found in SQLite")
                continue

            total = src.execute(text(f'SELECT COUNT(*) FROM "{table}"')).scalar()
            if total == 0:
                print(f"  SKIP  {table!r} — empty")
                continue

            already = dst.execute(text(f'SELECT COUNT(*) FROM "{table}"')).scalar()
            if already > 0:
                print(f"  SKIP  {table!r} — already has {already} rows in Postgres")
                continue

            print(f"  Copying {table!r} ({total} rows)...", end="", flush=True)

            rows = src.execute(text(f'SELECT * FROM "{table}"')).mappings().fetchall()
            if not rows:
                print(" (no data)")
                continue

            # Detect boolean columns from the PostgreSQL schema
            bool_cols = get_bool_columns(dst_engine, table)

            cols = list(rows[0].keys())
            col_sql = ", ".join(f'"{c}"' for c in cols)
            placeholders = ", ".join(f":{c}" for c in cols)
            stmt = text(f'INSERT INTO "{table}" ({col_sql}) VALUES ({placeholders})')

            for row in rows:
                dst.execute(stmt, cast_row(dict(row), bool_cols))

            dst.commit()
            print(" done")

    print("\nMigration complete! All data is now in Neon PostgreSQL.")


if __name__ == "__main__":
    if not os.path.exists("devkalp_dev.db"):
        print("ERROR: devkalp_dev.db not found. Run this script from the backend/ directory.")
        sys.exit(1)
    migrate()
