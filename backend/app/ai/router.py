from app.ai.schemas import AskRequest, AskResponse
from app.ai.service import process_ask
from app.auth.dependencies import get_current_user
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter(prefix="/chat", tags=["AI Chat"])


@router.post("/ask", response_model=AskResponse)
async def ask_question(
    request: AskRequest,
    current_user=Depends(get_current_user),
):
    """Ask a grounded question using the existing retrieval pipeline."""
    try:
        return await process_ask(request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="AI processing failed. Please try again later.",
        ) from exc
