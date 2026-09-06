from datetime import datetime
from typing import Optional

from fastapi import BackgroundTasks, UploadFile

from . import processor, storage
from .constants import ProcessingStatus
from .schemas import (
    DocumentChunkResponse,
    DocumentCreate,
    DocumentResponse,
    DocumentStatusResponse,
    EmbeddingStatusResponse,
)


async def _is_admin(user_email: str, db) -> bool:
    user = await db.users.find_one({"email": user_email})
    return bool(user and user.get("role") == "admin")


async def process_and_store_document(
    file: UploadFile,
    user_email: str,
    db,
    background_tasks: BackgroundTasks,
    auto_process: bool = False,
) -> DocumentResponse:
    unique_id, file_path, file_size = await storage.save_upload_file(file)

    ext = (
        ("." + file.filename.split(".")[-1])
        if file.filename and "." in file.filename
        else ""
    )

    doc_create = DocumentCreate(
        id=unique_id,
        filename=unique_id + ext,
        original_filename=file.filename or "unknown",
        file_type=file.content_type or "application/octet-stream",
        file_size=file_size,
        uploaded_by=user_email,
        status=ProcessingStatus.UPLOADED,
        storage_path=file_path,
        uploaded_at=datetime.utcnow(),
    )

    doc_dict = doc_create.model_dump()
    await db.documents.insert_one(doc_dict)

    if auto_process:
        background_tasks.add_task(processor.process_document_pipeline, unique_id)

    return DocumentResponse(**doc_dict)


async def get_document_by_id(
    doc_id: str, user_email: str, db
) -> Optional[DocumentResponse]:
    is_admin = await _is_admin(user_email, db)
    query = {"id": doc_id} if is_admin else {"id": doc_id, "uploaded_by": user_email}
    doc = await db.documents.find_one(query)
    if not doc:
        return None
    return DocumentResponse(**doc)


async def get_document_status(
    doc_id: str, user_email: str, db
) -> Optional[DocumentStatusResponse]:
    is_admin = await _is_admin(user_email, db)
    query = {"id": doc_id} if is_admin else {"id": doc_id, "uploaded_by": user_email}
    doc = await db.documents.find_one(query)
    if not doc:
        return None

    status = doc.get("status", ProcessingStatus.UPLOADED)
    progress_map = {
        ProcessingStatus.UPLOADED: 0,
        ProcessingStatus.PARSING: 15,
        ProcessingStatus.CLEANING: 30,
        ProcessingStatus.CHUNKING: 40,
        ProcessingStatus.CHUNKED: 50,
        ProcessingStatus.EMBEDDING: 70,
        ProcessingStatus.INDEXING: 90,
        ProcessingStatus.COMPLETED: 100,
        ProcessingStatus.FAILED: 0,
    }
    return DocumentStatusResponse(
        status=status,
        progress=progress_map.get(status, 0),
        current_stage=doc.get("current_stage"),
    )


async def trigger_embedding(
    doc_id: str, user_email: str, db, background_tasks: BackgroundTasks
) -> bool:
    is_admin = await _is_admin(user_email, db)
    query = {"id": doc_id} if is_admin else {"id": doc_id, "uploaded_by": user_email}
    doc = await db.documents.find_one(query)
    if not doc:
        return False
    background_tasks.add_task(processor.process_document_pipeline, doc_id)
    return True


async def get_embedding_status(
    doc_id: str, user_email: str, db
) -> Optional[EmbeddingStatusResponse]:
    is_admin = await _is_admin(user_email, db)
    query = {"id": doc_id} if is_admin else {"id": doc_id, "uploaded_by": user_email}
    doc = await db.documents.find_one(query)
    if not doc:
        return None

    status = doc.get("status", ProcessingStatus.UPLOADED)
    progress_map = {
        ProcessingStatus.UPLOADED: 0,
        ProcessingStatus.PARSING: 15,
        ProcessingStatus.CLEANING: 30,
        ProcessingStatus.CHUNKING: 40,
        ProcessingStatus.CHUNKED: 50,
        ProcessingStatus.EMBEDDING: 70,
        ProcessingStatus.INDEXING: 90,
        ProcessingStatus.COMPLETED: 100,
        ProcessingStatus.FAILED: 0,
    }

    return EmbeddingStatusResponse(
        status=status,
        current_stage=doc.get("current_stage"),
        progress=progress_map.get(status, 0),
        embedding_model=doc.get("embedding_model"),
        embedding_dimension=doc.get("embedding_dimension"),
        embedding_count=doc.get("embedding_count", 0),
        indexed_at=doc.get("indexed_at"),
    )


async def get_document_chunks(
    doc_id: str, user_email: str, db
) -> list[DocumentChunkResponse]:
    is_admin = await _is_admin(user_email, db)
    query = {"id": doc_id} if is_admin else {"id": doc_id, "uploaded_by": user_email}
    doc = await db.documents.find_one(query)
    if not doc:
        return []

    cursor = db.document_chunks.find({"document_id": doc_id}).sort("chunk_index", 1)
    chunks = await cursor.to_list(length=5000)

    res = []
    for c in chunks:
        c["id"] = str(c["_id"])
        res.append(DocumentChunkResponse(**c))
    return res


async def get_user_documents(user_email: str, db) -> list[DocumentResponse]:
    is_admin = await _is_admin(user_email, db)
    query = {} if is_admin else {"uploaded_by": user_email}
    cursor = db.documents.find(query).sort("uploaded_at", -1)
    docs = await cursor.to_list(length=200)
    return [DocumentResponse(**doc) for doc in docs]


async def delete_document_by_id(doc_id: str, user_email: str, db) -> bool:
    is_admin = await _is_admin(user_email, db)
    query = {"id": doc_id} if is_admin else {"id": doc_id, "uploaded_by": user_email}
    doc = await db.documents.find_one(query)
    if not doc:
        return False

    if doc.get("storage_path"):
        storage.delete_file(doc["storage_path"])

    await db.documents.delete_one({"id": doc_id})
    await db.document_chunks.delete_many({"document_id": doc_id})

    try:
        from app.retrieval.repository import ChromaDBRepository
        repo = ChromaDBRepository()
        repo.delete_by_document(doc_id)
    except Exception as e:
        print(f"Error removing vectors from ChromaDB: {e}")

    return True

