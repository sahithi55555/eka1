from typing import Any, Optional

from app.auth import schemas
from app.auth.dependencies import get_current_admin_user, get_current_user
from app.auth.service import (
    authenticate_user,
    approve_role_request,
    create_user,
    get_role_requests,
    promote_user,
    reject_role_request,
)
from app.db.mongodb import get_database
from app.models.user import UserInDB
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_in: schemas.UserCreate, db=Depends(get_database)) -> Any:
    """
    Register a new user. Public endpoint.
    Privileged roles will remain pending until approved by an administrator.
    """
    await create_user(user_in, db)
    return {"message": "User registered successfully"}


@router.post("/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_database)
) -> Any:
    """
    Authenticate user and return a token.
    """
    token = await authenticate_user(form_data.username, form_data.password, db)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)) -> Any:
    """
    Get current user details.
    """
    try:
        return {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role,
            "requested_role": getattr(current_user, "requested_role", None) or current_user.role,
            "role_status": getattr(current_user, "role_status", "approved"),
            "designation": getattr(current_user, "designation", None),
            "department": getattr(current_user, "department", None),
        }
    except Exception as e:
        print(f"Error in read_users_me: {e}")
        from fastapi import HTTPException

        raise HTTPException(status_code=500, detail=str(e))


@router.post("/promote", status_code=status.HTTP_200_OK)
async def promote(
    user_promote: schemas.UserPromote,
    current_user: UserInDB = Depends(get_current_admin_user),
    db=Depends(get_database),
) -> Any:
    """
    Promote a user to a specific role. Allowed only for admins.
    """
    await promote_user(user_promote.email, user_promote.role, db)
    return {"message": f"User {user_promote.email} promoted to {user_promote.role}."}


@router.post("/approve-role", status_code=status.HTTP_200_OK)
async def approve_role(
    payload: schemas.RoleApprovalRequest,
    current_user: UserInDB = Depends(get_current_admin_user),
    db=Depends(get_database),
) -> Any:
    """
    Approve a user's pending role request. Allowed only for admins.
    """
    await approve_role_request(payload.email, db)
    return {"message": f"Role request for {payload.email} approved successfully."}


@router.post("/reject-role", status_code=status.HTTP_200_OK)
async def reject_role(
    payload: schemas.RoleRejectionRequest,
    current_user: UserInDB = Depends(get_current_admin_user),
    db=Depends(get_database),
) -> Any:
    """
    Reject a user's pending role request. Allowed only for admins.
    """
    await reject_role_request(payload.email, payload.reason, db)
    return {"message": f"Role request for {payload.email} rejected."}


@router.get("/role-requests", response_model=list[schemas.RoleRequestItem])
async def list_role_requests(
    status_filter: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_admin_user),
    db=Depends(get_database),
) -> Any:
    """
    List role requests. Allowed only for admins.
    """
    return await get_role_requests(status_filter, db)
