from typing import List

from app.api.v1.documents import service
from app.api.v1.documents.constants import SUPPORTED_FILE_TYPES
from app.api.v1.documents.schemas import (
    DocumentChunkResponse,
    DocumentResponse,
    DocumentStatusResponse,
    EmbeddingStatusResponse,
)
from app.auth.dependencies import get_current_user
from app.db.mongodb import get_database
from app.models.user import UserInDB
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

router = APIRouter()


@router.post(
    "/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED
)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user),
    db=Depends(get_database),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")

    if not any(file.filename.lower().endswith(ext) for ext in SUPPORTED_FILE_TYPES):
        raise HTTPException(status_code=400, detail="Unsupported file format")

    doc = await service.process_and_store_document(
        file, current_user.email, db, background_tasks
    )
    return doc


@router.get("/{doc_id}/status", response_model=DocumentStatusResponse)
async def get_document_status(
    doc_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db=Depends(get_database),
):
    stat = await service.get_document_status(doc_id, current_user.email, db)
    if not stat:
        raise HTTPException(status_code=404, detail="Document not found")
    return stat


@router.post("/{doc_id}/embed", status_code=status.HTTP_202_ACCEPTED)
async def trigger_embedding(
    doc_id: str,
    background_tasks: BackgroundTasks,
    current_user: UserInDB = Depends(get_current_user),
    db=Depends(get_database),
):
    success = await service.trigger_embedding(
        doc_id, current_user.email, db, background_tasks
    )
    if not success:
        raise HTTPException(
            status_code=404, detail="Document not found or access denied"
        )
    return {"message": "Embedding process started"}


@router.get("/{doc_id}/embedding-status", response_model=EmbeddingStatusResponse)
async def get_embedding_status(
    doc_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db=Depends(get_database),
):
    stat = await service.get_embedding_status(doc_id, current_user.email, db)
    if not stat:
        raise HTTPException(status_code=404, detail="Document not found")
    return stat


@router.get("/{doc_id}/chunks", response_model=List[DocumentChunkResponse])
async def get_document_chunks(
    doc_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db=Depends(get_database),
):
    chunks = await service.get_document_chunks(doc_id, current_user.email, db)
    return chunks


@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    current_user: UserInDB = Depends(get_current_user), db=Depends(get_database)
):
    docs = await service.get_user_documents(current_user.email, db)
    return docs


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db=Depends(get_database),
):
    success = await service.delete_document_by_id(doc_id, current_user.email, db)
    if not success:
        raise HTTPException(
            status_code=404, detail="Document not found or access denied"
        )
