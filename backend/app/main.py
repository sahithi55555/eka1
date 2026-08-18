from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1.router import api_router
from .auth.service import init_admin_user
from .core.config import settings
from .db.mongodb import close_mongo_connection, connect_to_mongo, get_database
from .embeddings.model_loader import ModelLoader


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting lifespan")
    await connect_to_mongo()
    print("Connected to mongo")
    ModelLoader.initialize()
    print("Model initialized")
    await init_admin_user(get_database())
    print("Admin user init done")
    yield
    await close_mongo_connection()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Knowledge Assistant - Core API",
    version="0.1.0",
    docs_url=f"{settings.API_V1_STR}/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set up CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).strip() for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get(f"{settings.API_V1_STR}/health", tags=["health"])
async def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}
