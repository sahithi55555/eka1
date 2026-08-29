from typing import List

from app.ai.schemas import (
    AskRequest,
    AskResponse,
    ChatSessionCreate,
    ChatSessionDetailResponse,
    ChatSessionResponse,
)
from app.ai.service import (
    create_chat_session,
    delete_chat_session,
    get_chat_session_details,
    get_user_chat_sessions,
    process_ask,
)
from app.auth.dependencies import get_current_user
from app.db.mongodb import get_database
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter(prefix="/chat", tags=["AI Chat"])


@router.post("/ask", response_model=AskResponse)
async def ask_question(
    request: AskRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_database),
):
    """Ask a grounded question using the retrieval pipeline and optional chat session."""
    try:
        return await process_ask(request, db=db, current_user=current_user)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="AI processing failed. Please try again later.",
        ) from exc


@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session_in: ChatSessionCreate = ChatSessionCreate(),
    current_user=Depends(get_current_user),
    db=Depends(get_database),
):
    """Create a new chat session for the authenticated user."""
    return await create_chat_session(session_in.title, current_user, db)


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_sessions(
    current_user=Depends(get_current_user),
    db=Depends(get_database),
):
    """List all chat sessions for the authenticated user."""
    return await get_user_chat_sessions(current_user, db)


@router.get("/sessions/{session_id}", response_model=ChatSessionDetailResponse)
async def get_session(
    session_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database),
):
    """Get chat session details and message history."""
    return await get_chat_session_details(session_id, current_user, db)


@router.delete("/sessions/{session_id}", status_code=status.HTTP_200_OK)
async def remove_session(
    session_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_database),
):
    """Delete a chat session and its messages."""
    await delete_chat_session(session_id, current_user, db)
    return {"message": "Chat session deleted successfully."}

