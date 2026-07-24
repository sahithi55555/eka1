from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class DocumentInDB(BaseModel):
    id: str
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    uploaded_by: str
    uploaded_at: datetime
    status: str
    storage_path: str

    model_config = ConfigDict(from_attributes=True)
