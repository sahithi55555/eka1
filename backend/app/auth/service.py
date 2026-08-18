import uuid
from datetime import datetime, timezone

from app.auth.schemas import UserCreate, UserLogin
from app.auth.security import create_access_token, get_password_hash, verify_password
from fastapi import HTTPException, status


async def create_user(user_in: UserCreate, db):
    existing_user = await db.users.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    user_dict = {
        "_id": str(uuid.uuid4()),
        "full_name": user_in.full_name,
        "email": user_in.email,
        "password_hash": get_password_hash(user_in.password),
        "designation": user_in.designation,
        "department": user_in.department,
        "role": "employee",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    await db.users.insert_one(user_dict)
    return True


async def authenticate_user(email: str, password: str, db) -> str:
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user["email"]})
    return access_token


async def init_admin_user(db):
    from app.core.config import settings

    admin_email = settings.INITIAL_ADMIN_EMAIL
    admin_pass = settings.INITIAL_ADMIN_PASSWORD
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        user_dict = {
            "_id": str(uuid.uuid4()),
            "full_name": "System Administrator",
            "email": admin_email,
            "password_hash": get_password_hash(admin_pass),
            "designation": "Administrator",
            "department": "IT",
            "role": "admin",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        await db.users.insert_one(user_dict)


async def promote_user(email: str, new_role: str, db):
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    await db.users.update_one(
        {"email": email},
        {"$set": {"role": new_role, "updated_at": datetime.now(timezone.utc)}},
    )
    return True
