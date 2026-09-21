"""Frontier Knitters ERP — FastAPI backend (Python + SQL Server stored procedures).

Run:  uvicorn main:app --host 0.0.0.0 --port 8000   (from the backend folder)
Docs: http://localhost:8000/docs  (auto API docs)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import config, database
from app.routers import auth, customers, despatch, masters

app = FastAPI(title="Frontier Knitters ERP API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(despatch.router)
app.include_router(masters.router)


@app.on_event("startup")
def startup():
    # Ensures DB reachable + default Super Admin exists (hashed, never plain text)
    from passlib.context import CryptContext

    ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
    try:
        admin = database.call_proc_one("sp_User_GetByUsername", ("superadmin",))
        if not admin:
            database.call_proc(
                "sp_User_Save",
                ("superadmin", ctx.hash("admin123"), "Super Admin"),
            )
        print("✅ Database connected — default Super Admin ready (superadmin/admin123)")
    except Exception as e:
        print(f"⚠️  Database not reachable yet: {e}")
        print("   → Run backend/sql/init_database.sql in SSMS and check .env settings.")


@app.get("/api/health")
def health():
    try:
        database.call_proc("sp_Ping")
        return {"ok": True, "db": "up"}
    except Exception as e:
        return {"ok": False, "db": "down", "error": str(e)}
