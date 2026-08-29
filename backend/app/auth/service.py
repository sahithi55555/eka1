import uuid
from datetime import datetime, timezone
from typing import Optional

from app.auth.schemas import UserCreate, UserLogin
from app.auth.security import create_access_token, get_password_hash, verify_password
from fastapi import HTTPException, status

ALLOWED_ROLES = {"employee", "manager", "admin"}


async def create_user(user_in: UserCreate, db):
    existing_user = await db.users.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    raw_role = user_in.requested_role or user_in.role or "employee"
    req_role = raw_role.strip().lower()
    if req_role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{raw_role}'. Allowed roles are: {', '.join(sorted(ALLOWED_ROLES))}",
        )

    # Security requirement:
    # Public registration MUST NEVER directly activate any privileged role.
    # Active role is ALWAYS assigned the safe non-privileged default: 'employee'.
    active_role = "employee"

    if req_role == "employee":
        role_status = "approved"
    else:
        # Privileged role requested (e.g., admin, manager) -> Requires Administrator approval
        role_status = "pending"

    user_dict = {
        "_id": str(uuid.uuid4()),
        "full_name": user_in.full_name,
        "email": user_in.email,
        "password_hash": get_password_hash(user_in.password),
        "designation": user_in.designation,
        "department": user_in.department,
        "role": active_role,
        "requested_role": req_role,
        "role_status": role_status,
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
            "requested_role": "admin",
            "role_status": "approved",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        await db.users.insert_one(user_dict)


async def promote_user(email: str, new_role: str, db):
    new_role = new_role.strip().lower()
    if new_role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{new_role}'. Allowed roles are: {', '.join(sorted(ALLOWED_ROLES))}",
        )
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "role": new_role,
                "requested_role": new_role,
                "role_status": "approved",
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    return True


async def approve_role_request(email: str, db):
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    target_role = user.get("requested_role") or "employee"
    if target_role not in ALLOWED_ROLES:
        target_role = "employee"

    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "role": target_role,
                "role_status": "approved",
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    return True


async def reject_role_request(email: str, reason: Optional[str], db):
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    update_data = {
        "role_status": "rejected",
        "updated_at": datetime.now(timezone.utc),
    }
    if reason:
        update_data["rejection_reason"] = reason

    await db.users.update_one(
        {"email": email},
        {"$set": update_data},
    )
    return True


async def get_role_requests(status_filter: Optional[str], db):
    query = {}
    if status_filter:
        query["role_status"] = status_filter

    cursor = db.users.find(query).sort("created_at", -1)
    results = []
    async for u in cursor:
        results.append(
            {
                "id": str(u.get("_id")),
                "email": u.get("email"),
                "full_name": u.get("full_name", ""),
                "designation": u.get("designation"),
                "department": u.get("department"),
                "role": u.get("role", "employee"),
                "requested_role": u.get("requested_role", u.get("role", "employee")),
                "role_status": u.get("role_status", "approved"),
                "created_at": u.get("created_at"),
            }
        )
    return results

