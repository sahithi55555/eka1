from app.ai.router import router as ai_router
from app.api.v1.demo import router as demo_router
from app.api.v1.documents.router import router as documents_router
from app.auth.router import router as auth_router
from app.retrieval.router import router as retrieval_router
from fastapi import APIRouter

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(demo_router, prefix="/demo", tags=["demo"])
api_router.include_router(documents_router, prefix="/documents", tags=["documents"])
api_router.include_router(retrieval_router, prefix="/retrieval", tags=["retrieval"])
api_router.include_router(ai_router, tags=["ai"])
