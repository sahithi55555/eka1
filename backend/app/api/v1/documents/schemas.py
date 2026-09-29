from datetime import datetime
from typing import Dict, Optional

from pydantic import BaseModel, Field


class DocumentBase(BaseModel):
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    uploaded_by: str
    status: str


class DocumentCreate(DocumentBase):
    id: str
    storage_path: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)


class DocumentResponse(DocumentBase):
    id: str
    uploaded_at: datetime
    storage_path: Optional[str] = None
    chunk_count: Optional[int] = 0
    current_stage: Optional[str] = "Uploaded"
    word_count: Optional[int] = 0
    character_count: Optional[int] = 0
    embedding_model: Optional[str] = None
    embedding_dimension: Optional[int] = None
    embedding_count: Optional[int] = 0
    processed_at: Optional[datetime] = None
    indexed_at: Optional[datetime] = None
    chunking_strategy: Optional[str] = "structure_aware"


class ChunkMetadata(BaseModel):
    document_name: str
    file_type: str
    page_start: int
    page_end: int
    section_number: Optional[str] = None
    section_title: Optional[str] = None
    chunking_strategy: Optional[str] = "structure_aware"


class DocumentChunkResponse(BaseModel):
    id: str
    document_id: str
    chunk_index: int
    text: str
    word_count: int
    character_count: int
    section_number: Optional[str] = None
    section_title: Optional[str] = None
    chunking_strategy: Optional[str] = "structure_aware"
    metadata: ChunkMetadata


class DocumentStatusResponse(BaseModel):
    status: str
    progress: int
    current_stage: Optional[str] = None


class EmbeddingStatusResponse(BaseModel):
    status: str
    current_stage: Optional[str] = None
    progress: int
    embedding_model: Optional[str] = None
    embedding_dimension: Optional[int] = None
    embedding_count: Optional[int] = 0
    indexed_at: Optional[datetime] = None
