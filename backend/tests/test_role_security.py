from datetime import datetime, timezone
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException

from app.auth.schemas import UserCreate, UserPromote, RoleApprovalRequest, RoleRejectionRequest
from app.auth import service
from app.models.user import UserInDB


class FakeUsersCollection:
    def __init__(self):
        self.users = {}

    async def find_one(self, query):
        email = query.get("email")
        return self.users.get(email)

    async def insert_one(self, doc):
        self.users[doc["email"]] = doc
        return doc

    async def update_one(self, query, update):
        email = query.get("email")
        if email in self.users:
            if "$set" in update:
                self.users[email].update(update["$set"])
        return True

    def find(self, query=None):
        query = query or {}
        status = query.get("role_status")
        matched = []
        for u in self.users.values():
            if status and u.get("role_status") != status:
                continue
            matched.append(u)

        class AsyncIter:
            def __init__(self, items):
                self.items = items
                self.idx = 0

            def sort(self, *args, **kwargs):
                return self

            def __aiter__(self):
                return self

            async def __anext__(self):
                if self.idx >= len(self.items):
                    raise StopAsyncIteration
                item = self.items[self.idx]
                self.idx += 1
                return item

        return AsyncIter(matched)


class FakeDB:
    def __init__(self):
        self.users = FakeUsersCollection()


@pytest.mark.asyncio
async def test_1_normal_registration():
    """
    TEST 1: Normal registration
    Register: role/requested_role = employee
    Expected: User created successfully. Active role is employee. No admin privileges.
    """
    db = FakeDB()
    user_in = UserCreate(
        full_name="Alice Employee",
        email="alice@example.com",
        password="Password123!",
        designation="Software Engineer",
        department="Engineering",
        role="employee",
    )
    result = await service.create_user(user_in, db)
    assert result is True

    user = await db.users.find_one({"email": "alice@example.com"})
    assert user is not None
    assert user["role"] == "employee"
    assert user["requested_role"] == "employee"
    assert user["role_status"] == "approved"


@pytest.mark.asyncio
async def test_2_and_test_8_user_requests_admin_and_malicious_payload():
    """
    TEST 2 & TEST 8: User requests admin or sends malicious payload directly to public register.
    Register: role/requested_role = admin
    Expected: Active role MUST NOT be admin. Status MUST be pending.
    """
    db = FakeDB()
    malicious_in = UserCreate(
        full_name="Malicious User",
        email="malicious@example.com",
        password="Password123!",
        designation="Software Engineer",
        department="Engineering",
        role="admin",  # Direct attempt to become admin via public registration
    )
    result = await service.create_user(malicious_in, db)
    assert result is True

    user = await db.users.find_one({"email": "malicious@example.com"})
    assert user is not None
    # CRITICAL: Active role must remain safe default "employee"
    assert user["role"] == "employee"
    # Requested role recorded as pending
    assert user["requested_role"] == "admin"
    assert user["role_status"] == "pending"


@pytest.mark.asyncio
async def test_3_and_4_login_and_privilege_check_before_approval():
    """
    TEST 3 & 4: Pending user login and access control.
    Expected: Active role is employee; cannot pass get_current_admin_user.
    """
    from app.auth.dependencies import get_current_admin_user

    pending_user = UserInDB(
        _id="test-id",
        full_name="Pending Admin Candidate",
        email="candidate@example.com",
        password_hash="dummy_hash",
        role="employee",  # Active role remains employee
        requested_role="admin",
        role_status="pending",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    # Attempting to call an admin-dependent function must raise 403 Forbidden
    with pytest.raises(HTTPException) as exc_info:
        await get_current_admin_user(current_user=pending_user)
    assert exc_info.value.status_code == 403


@pytest.mark.asyncio
async def test_5_6_7_admin_approval_workflow():
    """
    TEST 5, 6, 7: Admin approval, /me verification, and elevated privileges.
    """
    from app.auth.dependencies import get_current_admin_user

    db = FakeDB()
    user_in = UserCreate(
        full_name="Bob FutureAdmin",
        email="bob@example.com",
        password="Password123!",
        designation="Lead Engineer",
        department="Engineering",
        requested_role="admin",
    )
    await service.create_user(user_in, db)

    # User state before approval
    user = await db.users.find_one({"email": "bob@example.com"})
    assert user["role"] == "employee"
    assert user["role_status"] == "pending"

    # Admin approves
    await service.approve_role_request("bob@example.com", db)

    # User state after approval
    approved_user_doc = await db.users.find_one({"email": "bob@example.com"})
    assert approved_user_doc["role"] == "admin"
    assert approved_user_doc["role_status"] == "approved"

    approved_user = UserInDB(
        _id=approved_user_doc["_id"],
        full_name=approved_user_doc["full_name"],
        email=approved_user_doc["email"],
        password_hash=approved_user_doc["password_hash"],
        role=approved_user_doc["role"],
        requested_role=approved_user_doc["requested_role"],
        role_status=approved_user_doc["role_status"],
        created_at=approved_user_doc["created_at"],
        updated_at=approved_user_doc["updated_at"],
    )

    # Now passes get_current_admin_user
    admin_check = await get_current_admin_user(current_user=approved_user)
    assert admin_check.role == "admin"


@pytest.mark.asyncio
async def test_role_rejection_workflow():
    """
    Test role rejection workflow: role_status becomes 'rejected', active role remains 'employee'.
    """
    db = FakeDB()
    user_in = UserCreate(
        full_name="Carol Rejected",
        email="carol@example.com",
        password="Password123!",
        designation="Intern",
        department="Engineering",
        requested_role="admin",
    )
    await service.create_user(user_in, db)

    await service.reject_role_request("carol@example.com", "Not eligible for admin", db)

    user = await db.users.find_one({"email": "carol@example.com"})
    assert user["role"] == "employee"
    assert user["role_status"] == "rejected"
    assert user.get("rejection_reason") == "Not eligible for admin"


@pytest.mark.asyncio
async def test_invalid_role_rejected():
    """
    Test invalid arbitrary role names are rejected at registration.
    """
    db = FakeDB()
    user_in = UserCreate(
        full_name="Hacker",
        email="hacker@example.com",
        password="Password123!",
        designation="Unknown",
        department="Unknown",
        role="super_god_mode",
    )
    with pytest.raises(HTTPException) as exc_info:
        await service.create_user(user_in, db)
    assert exc_info.value.status_code == 400
