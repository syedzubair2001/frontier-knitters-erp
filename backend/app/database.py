"""SQL Server access. Every call goes through a stored procedure (EXEC ...)."""
import pyodbc
from . import config


def get_conn():
    return pyodbc.connect(config.connection_string(), timeout=15)


def _rows(cursor):
    cols = [c[0] for c in cursor.description or []]
    return [dict(zip(cols, row)) for row in cursor.fetchall()]


def call_proc(proc_name, params=(), fetch: bool = False):
    """EXEC a stored procedure. Returns list-of-dicts when fetch=True,
    else (return_rows_or_none, output-style dict is not needed -> returns list)."""
    conn = get_conn()
    try:
        cur = conn.cursor()
        if params:
            marks = ",".join("?" for _ in params)
            cur.execute(f"EXEC {proc_name} {marks}", list(params))
        else:
            cur.execute(f"EXEC {proc_name}")
        rows = _rows(cur) if fetch else []
        conn.commit()
        return rows
    finally:
        conn.close()


def call_proc_one(proc_name, params=()):
    rows = call_proc(proc_name, params, fetch=True)
    return rows[0] if rows else None
