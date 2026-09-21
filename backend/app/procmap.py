"""SINGLE PLACE where every stored-procedure name lives.

Until the existing ERP database (.bak) arrives, these point at the generic
procedures in backend/sql/init_database.sql (optional fallback).
When the real DB arrives: EDIT ONLY THIS FILE to call its real procedures.
"""
P = {
    # --- users / login ---
    "user_get_by_username": "sp_User_GetByUsername",
    "user_get_all": "sp_User_GetAll",
    "user_save": "sp_User_Save",          # (username, passwordhash, role)
    "user_delete": "sp_User_Delete",      # (username)

    # --- customers (+ addresses JSON) ---
    "customer_get_all": "sp_Customer_GetAll",
    "customer_get_by_id": "sp_Customer_GetById",
    "customer_save": "sp_Customer_Save",  # (id, name, phone, email, gstin, status, notes, addresses_json)
    "customer_delete": "sp_Customer_Delete",

    # --- despatch ---
    "despatch_get_all": "sp_Despatch_GetAll",
    "despatch_save": "sp_Despatch_Save",
    "despatch_delete": "sp_Despatch_Delete",

    # --- masters (generic, one table for all 14 master types) ---
    "master_get_by_type": "sp_Master_GetByType",
    "master_save": "sp_Master_Save",
    "master_delete": "sp_Master_Delete",
}
