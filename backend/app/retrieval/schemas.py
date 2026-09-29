from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field


class RetrievalFilters(BaseModel):
    document_id: Optional[str] = None
    # For future expansion
    department: Optional[str] = None
    uploader: Optional[str] = None
    tags: Optional[List[str]] = None
    file_type: Optional[str] = None
    upload_date: Optional[str] = None


class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = Field(None, title="Top K", ge=1)
    filters: Optional[RetrievalFilters] = None


class DocumentSearchRequest(SearchRequest):
    document_id: str


class SearchResultItemMetadata(BaseModel):
    document_name: str
    filename: str
    file_type: str
    uploaded_by: str
    upload_date: str
    word_count: int
    character_count: int
    section_number: Optional[str] = None
    section_title: Optional[str] = None
    chunking_strategy: Optional[str] = None


class SearchResultItem(BaseModel):
    document_id: str
    chunk_id: str
    chunk_index: int
    chunk_text: str
    page_start: int
    page_end: int
    similarity_score: float
    section_number: Optional[str] = None
    section_title: Optional[str] = None
    chunking_strategy: Optional[str] = None
    metadata: SearchResultItemMetadata


class SearchResponse(BaseModel):
    query: str
    retrieval_time_ms: int
    total_results: int
    results: List[SearchResultItem]


class SearchMetadata(BaseModel):
    total_chunks_searched: int
    total_chunks_returned: int
    embedding_time_ms: int
    vector_search_time_ms: int
    retrieval_time_ms: int


T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None
    metadata: Optional[SearchMetadata] = None
    error_code: Optional[str] = None
    details: Optional[str] = None
