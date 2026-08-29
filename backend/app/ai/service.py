import re
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.ai.prompt_builder import PromptBuilder
from app.ai.provider import LLMProvider
from app.ai.schemas import AskRequest, AskResponse, Citation
from app.core.config import settings
from app.retrieval.schemas import SearchRequest
from app.retrieval.search_service import search_chunks
from fastapi import HTTPException, status

prompt_builder = PromptBuilder()
llm_provider = LLMProvider()


async def process_ask(
    request: AskRequest, db: Any = None, current_user: Any = None
) -> AskResponse:
    if not request.question or not request.question.strip():
        raise ValueError("Question cannot be empty.")

    session_id = request.session_id
    conversation_history: Optional[List[Dict[str, str]]] = None

    user_id = None
    user_email = None
    if current_user is not None:
        user_id = str(getattr(current_user, "id", current_user.email))
        user_email = getattr(current_user, "email", None)

    # 1. Handle session and conversation history if DB & user are available
    if db is not None and current_user is not None:
        if session_id:
            session = await db.chat_sessions.find_one({"_id": session_id})
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Chat session not found.",
                )
            if session.get("user_id") != user_id and session.get("user_email") != user_email:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this chat session.",
                )

            # Load recent conversation history
            history_limit = getattr(settings, "CHAT_HISTORY_LIMIT", 10)
            cursor = (
                db.chat_messages.find({"session_id": session_id})
                .sort("created_at", -1)
                .limit(history_limit)
            )
            raw_history = []
            async for msg in cursor:
                raw_history.append(msg)
            raw_history.reverse()

            conversation_history = [
                {"role": m["role"], "content": m["content"]}
                for m in raw_history
                if m.get("role") in ("user", "assistant") and m.get("content")
            ]
        else:
            # Auto-create new session
            session_id = str(uuid.uuid4())
            title = request.question.strip()
            if len(title) > 40:
                title = title[:37] + "..."
            now = datetime.now(timezone.utc)
            session_doc = {
                "_id": session_id,
                "user_id": user_id,
                "user_email": user_email,
                "title": title or "New Chat",
                "created_at": now,
                "updated_at": now,
            }
            await db.chat_sessions.insert_one(session_doc)

    # 2. Fresh Document Retrieval
    start_time = time.perf_counter()
    search_query = request.question
    if conversation_history:
        recent_user_queries = [
            m["content"] for m in conversation_history if m.get("role") == "user"
        ]
        if recent_user_queries:
            search_query = f"{recent_user_queries[-1]} {request.question}"

    search_req = SearchRequest(query=search_query, top_k=request.top_k)
    search_response = await search_chunks(search_req)
    retrieval_ms = (time.perf_counter() - start_time) * 1000.0


    if not search_response.success:
        raise ValueError(search_response.message or "Retrieval failed.")

    if search_response.data is None:
        raise ValueError("Retrieval returned no data.")

    retrieved_chunks = search_response.data.results
    if not retrieved_chunks:
        no_context_answer = (
            "I'm sorry, but the available documents do not contain enough information to answer that question."
        )
        # Record user message and assistant answer if in session
        if db is not None and current_user is not None and session_id:
            now = datetime.now(timezone.utc)
            await db.chat_messages.insert_many([
                {
                    "_id": str(uuid.uuid4()),
                    "session_id": session_id,
                    "user_id": user_id,
                    "user_email": user_email,
                    "role": "user",
                    "content": request.question,
                    "created_at": now,
                },
                {
                    "_id": str(uuid.uuid4()),
                    "session_id": session_id,
                    "user_id": user_id,
                    "user_email": user_email,
                    "role": "assistant",
                    "content": no_context_answer,
                    "citations": [],
                    "created_at": datetime.now(timezone.utc),
                },
            ])
            await db.chat_sessions.update_one(
                {"_id": session_id}, {"$set": {"updated_at": datetime.now(timezone.utc)}}
            )

        return AskResponse(
            answer=no_context_answer,
            citations=[],
            retrieved_chunks=[],
            retrieval_time_ms=retrieval_ms,
            llm_response_time_ms=0.0,
            total_response_time_ms=retrieval_ms,
            session_id=session_id,
        )

    # 3. Grounded Prompt Building with History
    messages, source_map = prompt_builder.build_prompt(
        request.question, retrieved_chunks, conversation_history
    )

    # 4. LLM Generation
    llm_start_time = time.perf_counter()
    raw_answer = await llm_provider.generate_response(messages)
    llm_ms = (time.perf_counter() - llm_start_time) * 1000.0

    # 5. Citation Extraction
    used_sources = set(re.findall(r"\[Source \d+\]", raw_answer))
    citations: List[Citation] = []
    for source_tag in sorted(used_sources, key=lambda tag: int(tag.strip("[]").split()[-1])):
        source_key = source_tag.strip("[]")
        metadata = source_map.get(source_key)
        if not metadata:
            continue
        citations.append(
            Citation(
                source_id=source_key,
                document_name=metadata.get("document_name", "Unknown Document"),
                page_start=int(metadata.get("page_start", 1)),
                page_end=int(metadata.get("page_end", 1)),
                chunk_index=int(metadata.get("chunk_index", -1)),
                text_preview=metadata.get("text_preview"),
            )
        )

    total_ms = (time.perf_counter() - start_time) * 1000.0

    plain_retrieved_chunks: List[Dict[str, Any]] = []
    for chunk in retrieved_chunks:
        if hasattr(chunk, "model_dump"):
            plain_retrieved_chunks.append(chunk.model_dump())
        elif hasattr(chunk, "dict"):
            plain_retrieved_chunks.append(chunk.dict())
        elif hasattr(chunk, "__dict__"):
            plain_retrieved_chunks.append(vars(chunk))
        else:
            plain_retrieved_chunks.append(chunk)

    # 6. Persist Messages to Database
    if db is not None and current_user is not None and session_id:
        now = datetime.now(timezone.utc)
        await db.chat_messages.insert_many([
            {
                "_id": str(uuid.uuid4()),
                "session_id": session_id,
                "user_id": user_id,
                "user_email": user_email,
                "role": "user",
                "content": request.question,
                "created_at": now,
            },
            {
                "_id": str(uuid.uuid4()),
                "session_id": session_id,
                "user_id": user_id,
                "user_email": user_email,
                "role": "assistant",
                "content": raw_answer,
                "citations": [c.model_dump() for c in citations],
                "created_at": datetime.now(timezone.utc),
            },
        ])
        await db.chat_sessions.update_one(
            {"_id": session_id}, {"$set": {"updated_at": datetime.now(timezone.utc)}}
        )

    return AskResponse(
        answer=raw_answer,
        citations=citations,
        retrieved_chunks=plain_retrieved_chunks,
        retrieval_time_ms=retrieval_ms,
        llm_response_time_ms=llm_ms,
        total_response_time_ms=total_ms,
        session_id=session_id,
    )


# --- Session Management Functions ---


async def create_chat_session(title: Optional[str], current_user: Any, db: Any) -> Dict[str, Any]:
    user_id = str(getattr(current_user, "id", current_user.email))
    user_email = getattr(current_user, "email", None)
    session_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    doc = {
        "_id": session_id,
        "user_id": user_id,
        "user_email": user_email,
        "title": title.strip() if title and title.strip() else "New Chat",
        "created_at": now,
        "updated_at": now,
    }
    await db.chat_sessions.insert_one(doc)
    return {
        "session_id": session_id,
        "title": doc["title"],
        "created_at": now,
        "updated_at": now,
    }


async def get_user_chat_sessions(current_user: Any, db: Any) -> List[Dict[str, Any]]:
    user_id = str(getattr(current_user, "id", current_user.email))
    user_email = getattr(current_user, "email", None)
    cursor = db.chat_sessions.find({
        "$or": [{"user_id": user_id}, {"user_email": user_email}]
    }).sort("updated_at", -1)

    sessions = []
    async for s in cursor:
        sessions.append({
            "session_id": str(s["_id"]),
            "title": s.get("title", "New Chat"),
            "created_at": s.get("created_at"),
            "updated_at": s.get("updated_at"),
        })
    return sessions


async def get_chat_session_details(
    session_id: str, current_user: Any, db: Any
) -> Dict[str, Any]:
    user_id = str(getattr(current_user, "id", current_user.email))
    user_email = getattr(current_user, "email", None)
    session = await db.chat_sessions.find_one({"_id": session_id})
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found."
        )
    if session.get("user_id") != user_id and session.get("user_email") != user_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this chat session.",
        )

    cursor = db.chat_messages.find({"session_id": session_id}).sort("created_at", 1)
    messages = []
    async for m in cursor:
        citations = None
        if m.get("citations"):
            citations = [Citation(**c) if isinstance(c, dict) else c for c in m["citations"]]
        messages.append({
            "id": str(m["_id"]),
            "role": m.get("role"),
            "content": m.get("content"),
            "citations": citations,
            "created_at": m.get("created_at"),
        })

    return {
        "session_id": str(session["_id"]),
        "title": session.get("title", "New Chat"),
        "created_at": session.get("created_at"),
        "updated_at": session.get("updated_at"),
        "messages": messages,
    }


async def delete_chat_session(session_id: str, current_user: Any, db: Any) -> bool:
    user_id = str(getattr(current_user, "id", current_user.email))
    user_email = getattr(current_user, "email", None)
    session = await db.chat_sessions.find_one({"_id": session_id})
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found."
        )
    if session.get("user_id") != user_id and session.get("user_email") != user_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this chat session.",
        )

    await db.chat_messages.delete_many({"session_id": session_id})
    await db.chat_sessions.delete_one({"_id": session_id})
    return True

