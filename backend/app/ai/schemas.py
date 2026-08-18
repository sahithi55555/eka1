from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1)
    top_k: Optional[int] = Field(default=5, ge=1, le=20)


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
