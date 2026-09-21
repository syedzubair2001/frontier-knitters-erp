"""App configuration loaded from backend/.env"""
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))


def connection_string() -> str:
    server = os.getenv("DB_SERVER", r"localhost\SQLEXPRESS")
    db = os.getenv("DB_NAME", "FrontierERP")
    driver = os.getenv("ODBC_DRIVER", "ODBC Driver 17 for SQL Server")
    trusted = os.getenv("DB_TRUSTED", "yes").lower() == "yes"
    if trusted:
        return (
            f"DRIVER={{{driver}}};SERVER={server};DATABASE={db};"
            "Trusted_Connection=yes;TrustServerCertificate=yes;"
        )
    user = os.getenv("DB_USER", "sa")
    pwd = os.getenv("DB_PASSWORD", "")
    return (
        f"DRIVER={{{driver}}};SERVER={server};DATABASE={db};"
        f"UID={user};PWD={pwd};TrustServerCertificate=yes;"
    )


JWT_SECRET = os.getenv("JWT_SECRET", "change-this-to-a-long-random-secret-string-2026")
JWT_HOURS = int(os.getenv("JWT_HOURS", "12"))
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",")]
