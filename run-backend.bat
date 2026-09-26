@echo off
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate
    pip install fastapi uvicorn sqlalchemy alembic pydantic-settings
    alembic init alembic
) else (
    call venv\Scripts\activate
)
uvicorn main:app --reload
