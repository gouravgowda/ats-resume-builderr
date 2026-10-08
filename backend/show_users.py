"""Temporary script to display the users table from the database."""
import sqlite3
from app.config import settings

DATABASE_URL = settings.DATABASE_URL
print("Database URL:", DATABASE_URL)

if "sqlite" in DATABASE_URL:
    # Local SQLite database
    db_path = DATABASE_URL.split("///")[-1]
    conn = sqlite3.connect(db_path)
else:
    # PostgreSQL
    import psycopg2
    from urllib.parse import urlparse
    parsed = urlparse(DATABASE_URL.replace("postgresql+asyncpg", "postgresql"))
    conn = psycopg2.connect(
        host=parsed.hostname,
        port=parsed.port,
        database=parsed.path.lstrip("/"),
        user=parsed.username,
        password=parsed.password,
    )

cursor = conn.cursor()

# Show all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("\nTables in database:")
for t in tables:
    print(f"  - {t[0]}")

# Show users table schema
print("\n" + "=" * 60)
print("USERS TABLE SCHEMA")
print("=" * 60)
cursor.execute("PRAGMA table_info(users)")
columns = cursor.fetchall()
print(f"{'ID':<5} {'Name':<20} {'Type':<15} {'NotNull':<10} {'Default':<20}")
print("-" * 70)
for col in columns:
    print(f"{col[0]:<5} {col[1]:<20} {col[2]:<15} {col[3]:<10} {str(col[4]):<20}")

# Show all rows in users table
print("\n" + "=" * 60)
print("USERS TABLE DATA")
print("=" * 60)
cursor.execute("SELECT id, email, hashed_password, created_at, is_active FROM users")
rows = cursor.fetchall()
if rows:
    print(f"{'ID':<40} {'Email':<30} {'Password Hash':<30} {'Created At':<25} {'Active'}")
    print("-" * 155)
    for row in rows:
        id_val = str(row[0])[:38]
        email = str(row[1])[:28]
        pw_hash = str(row[2])[:28] + "..."
        created = str(row[3])[:23]
        active = row[4]
        print(f"{id_val:<40} {email:<30} {pw_hash:<30} {created:<25} {active}")
else:
    print("No users registered yet.")

print(f"\nTotal users: {len(rows)}")

conn.close()
