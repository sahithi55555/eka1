from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    designation: str
    department: str
    role: Optional[str] = None
    requested_role: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    requested_role: Optional[str] = None
    role_status: Optional[str] = "approved"
    designation: Optional[str] = None
    department: Optional[str] = None


class UserPromote(BaseModel):
    email: EmailStr
    role: str


class RoleApprovalRequest(BaseModel):
    email: EmailStr


class RoleRejectionRequest(BaseModel):
    email: EmailStr
    reason: Optional[str] = None


class RoleRequestItem(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    designation: Optional[str] = None
    department: Optional[str] = None
    role: str
    requested_role: str
    role_status: str
    created_at: Optional[datetime] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
