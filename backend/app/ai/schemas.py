from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1)
    top_k: Optional[int] = Field(default=5, ge=1, le=20)
    session_id: Optional[str] = None


class Citation(BaseModel):
    source_id: Optional[str] = None
    document_name: str
    page_start: int = 1
    page_end: int = 1
    chunk_index: int
    text_preview: Optional[str] = None


class AskResponse(BaseModel):
    answer: str
    citations: List[Citation]
    retrieved_chunks: List[Dict[str, Any]]
    retrieval_time_ms: float
    llm_response_time_ms: float
    total_response_time_ms: float
    session_id: Optional[str] = None


class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"


class ChatSessionResponse(BaseModel):
    session_id: str
    title: str
    created_at: datetime
    updated_at: datetime


class ChatMessageItem(BaseModel):
    id: str
    role: str
    content: str
    citations: Optional[List[Citation]] = None
    created_at: datetime


class ChatSessionDetailResponse(BaseModel):
    session_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageItem]
