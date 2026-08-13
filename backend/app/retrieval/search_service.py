import time
from typing import Any, Dict, List, Optional

from app.db.mongodb import get_database
from app.retrieval.constants import DEFAULT_TOP_K, MAX_TOP_K, SIMILARITY_THRESHOLD
from app.retrieval.query_embedder import generate_query_embedding, normalize_query
from app.retrieval.repository import ChromaDBRepository
from app.retrieval.schemas import (
    APIResponse,
    DocumentSearchRequest,
    SearchMetadata,
    SearchRequest,
    SearchResponse,
    SearchResultItem,
    SearchResultItemMetadata,
)

# Instantiate singleton repository
vector_repo = ChromaDBRepository()


async def search_chunks(request: SearchRequest) -> APIResponse[SearchResponse]:
    start_time = time.time()

    # 1. Top-K Validation
    top_k = request.top_k if request.top_k is not None else DEFAULT_TOP_K
    if top_k <= 0 or top_k > MAX_TOP_K:
        return APIResponse(
            success=False,
            message="Invalid Top-K value",
            error_code="INVALID_TOP_K",
            details=f"top_k must be between 1 and {MAX_TOP_K}",
        )

    # 2. Query Validation and Normalization
    if not request.query or not request.query.strip():
        return APIResponse(
            success=False, message="Query cannot be empty", error_code="EMPTY_QUERY"
        )

    normalized_query = normalize_query(request.query)

    # 3. Embedding Generation
    embed_start = time.time()
    try:
        query_embedding = generate_query_embedding(normalized_query)
    except RuntimeError as e:
        return APIResponse(
            success=False,
            message="Embedding model not loaded",
            error_code="MODEL_UNAVAILABLE",
            details=str(e),
        )
    embed_end = time.time()

    # 4. Search ChromaDB
    filters = {}
    if request.filters and request.filters.document_id:
        filters["document_id"] = request.filters.document_id

    # Add specific document_id if provided from DocumentSearchRequest
    if isinstance(request, DocumentSearchRequest):
        filters["document_id"] = request.document_id

    vector_search_start = time.time()

    try:
        raw_results = vector_repo.search(
            query_embedding=query_embedding, top_k=top_k, filters=filters
        )
    except Exception as e:
        return APIResponse(
            success=False,
            message="Failed to connect to Vector Database",
            error_code="VECTOR_DB_ERROR",
            details=str(e),
        )

    vector_search_end = time.time()

    total_chunks_searched = vector_repo.count()
    if total_chunks_searched == 0:
        return APIResponse(
            success=True,
            message="Vector index is empty. No documents have been indexed yet.",
            data=SearchResponse(
                query=normalized_query,
                retrieval_time_ms=int((time.time() - start_time) * 1000),
                total_results=0,
                results=[],
            ),
            metadata=SearchMetadata(
                total_chunks_searched=0,
                total_chunks_returned=0,
                embedding_time_ms=int((embed_end - embed_start) * 1000),
                vector_search_time_ms=int(
                    (vector_search_end - vector_search_start) * 1000
                ),
                retrieval_time_ms=int((time.time() - start_time) * 1000),
            ),
        )

    # 5. Threshold Filtering
    filtered_results = [
        r for r in raw_results if r["similarity"] >= SIMILARITY_THRESHOLD
    ]

    if not filtered_results:
        return APIResponse(
            success=True,
            message="No matching results found above the similarity threshold.",
            data=SearchResponse(
                query=normalized_query,
                retrieval_time_ms=int((time.time() - start_time) * 1000),
                total_results=0,
                results=[],
            ),
            metadata=SearchMetadata(
                total_chunks_searched=total_chunks_searched,
                total_chunks_returned=0,
                embedding_time_ms=int((embed_end - embed_start) * 1000),
                vector_search_time_ms=int(
                    (vector_search_end - vector_search_start) * 1000
                ),
                retrieval_time_ms=int((time.time() - start_time) * 1000),
            ),
        )

    # 6. Fetch Metadata from MongoDB & Combine
    db = get_database()
    final_results = []

    # Deterministic secondary sorting: Desc by similarity, then document_id ASC, chunk_index ASC.
    filtered_results.sort(
        key=lambda x: (
            -x["similarity"],
            x["metadata"].get("document_id", ""),
            x["metadata"].get("chunk_index", 0),
        )
    )

    for item in filtered_results:
        doc_id = item["metadata"].get("document_id")
        chunk_index = item["metadata"].get("chunk_index")

        # Get parent doc and chunk doc (handling None gracefully)
        mongo_doc = await db.documents.find_one({"id": doc_id}) or {}
        mongo_chunk = (
            await db.document_chunks.find_one(
                {"document_id": doc_id, "chunk_index": chunk_index}
            )
            or {}
        )

        doc_name = (
            mongo_doc.get("original_filename", "")
            if mongo_doc.get("original_filename")
            else item["metadata"].get("document_name", "")
        )
        filename = mongo_doc.get("filename", "")
        file_type = mongo_doc.get("file_type", "")
        uploaded_by = mongo_doc.get("uploaded_by", "")
        upload_date = (
            str(mongo_doc.get("uploaded_at", ""))
            if mongo_doc.get("uploaded_at")
            else ""
        )

        word_count = mongo_chunk.get("word_count", 0)
        char_count = mongo_chunk.get("character_count", 0)

        result_metadata = SearchResultItemMetadata(
            document_name=doc_name,
            filename=filename,
            file_type=file_type,
            uploaded_by=uploaded_by,
            upload_date=upload_date,
            word_count=word_count,
            character_count=char_count,
        )

        result_item = SearchResultItem(
            document_id=doc_id,
            chunk_id=item["chunk_id"],
            chunk_index=chunk_index,
            chunk_text=item["text"],
            page_start=item["metadata"].get("page_start", 1),
            page_end=item["metadata"].get("page_end", 1),
            similarity_score=round(item["similarity"], 4),
            metadata=result_metadata,
        )
        final_results.append(result_item)

    retrieval_ms = int((time.time() - start_time) * 1000)

    return APIResponse(
        success=True,
        message="Search completed successfully",
        data=SearchResponse(
            query=normalized_query,
            retrieval_time_ms=retrieval_ms,
            total_results=len(final_results),
            results=final_results,
        ),
        metadata=SearchMetadata(
            total_chunks_searched=total_chunks_searched,
            total_chunks_returned=len(final_results),
            embedding_time_ms=int((embed_end - embed_start) * 1000),
            vector_search_time_ms=int((vector_search_end - vector_search_start) * 1000),
            retrieval_time_ms=retrieval_ms,
        ),
    )
