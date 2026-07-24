from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class UserInDB(BaseModel):
    id: str = Field(..., alias="_id")
    full_name: str
    email: str
    password_hash: str
    role: str = "employee"
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
