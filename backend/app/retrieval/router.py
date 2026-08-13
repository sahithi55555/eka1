from app.retrieval.schemas import (
    APIResponse,
    DocumentSearchRequest,
    SearchRequest,
    SearchResponse,
)
from app.retrieval.search_service import search_chunks
from fastapi import APIRouter

router = APIRouter()


@router.post("/search", response_model=APIResponse[SearchResponse])
async def search(request: SearchRequest):
    return await search_chunks(request)


@router.post("/search-by-document", response_model=APIResponse[SearchResponse])
async def search_by_document(request: DocumentSearchRequest):
    return await search_chunks(request)
