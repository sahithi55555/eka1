from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class UserInDB(BaseModel):
    id: str = Field(..., alias="_id")
    full_name: str
    email: str
    password_hash: str
    role: str = "employee"
    requested_role: Optional[str] = "employee"
    role_status: str = "approved"
    designation: Optional[str] = None
    department: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(populate_by_name=True)

