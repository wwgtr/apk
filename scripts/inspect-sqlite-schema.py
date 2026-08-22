import sqlite3
from pathlib import Path


database = Path("/home/ubuntu/nahj-source-review/nahj-sqlite.db")
with sqlite3.connect(database) as connection:
    tables = connection.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
    ).fetchall()
    for (table_name,) in tables:
        columns = connection.execute(f'PRAGMA table_info("{table_name}")').fetchall()
        print(table_name, [column[1] for column in columns])
    sample = connection.execute(
        "SELECT cat, num, title, cnt FROM nahj ORDER BY cat, num LIMIT 1"
    ).fetchone()
    print(sample)
