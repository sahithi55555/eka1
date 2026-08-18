import re
import time
from typing import Any, Dict, List

from app.ai.prompt_builder import PromptBuilder
from app.ai.provider import LLMProvider
from app.ai.schemas import AskRequest, AskResponse, Citation
from app.retrieval.schemas import SearchRequest
from app.retrieval.search_service import search_chunks

prompt_builder = PromptBuilder()
llm_provider = LLMProvider()


async def process_ask(request: AskRequest) -> AskResponse:
    if not request.question or not request.question.strip():
        raise ValueError("Question cannot be empty.")

    start_time = time.perf_counter()
    search_req = SearchRequest(query=request.question, top_k=request.top_k)
    search_response = await search_chunks(search_req)
    retrieval_ms = (time.perf_counter() - start_time) * 1000.0

    if not search_response.success:
        raise ValueError(search_response.message or "Retrieval failed.")

    if search_response.data is None:
        raise ValueError("Retrieval returned no data.")

    retrieved_chunks = search_response.data.results
    if not retrieved_chunks:
        return AskResponse(
            answer="I'm sorry, but the available documents do not contain enough information to answer that question.",
            citations=[],
            retrieved_chunks=[],
            retrieval_time_ms=retrieval_ms,
            llm_response_time_ms=0.0,
            total_response_time_ms=retrieval_ms,
        )

    messages, source_map = prompt_builder.build_prompt(request.question, retrieved_chunks)

    llm_start_time = time.perf_counter()
    raw_answer = await llm_provider.generate_response(messages)
    llm_ms = (time.perf_counter() - llm_start_time) * 1000.0

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

    return AskResponse(
        answer=raw_answer,
        citations=citations,
        retrieved_chunks=plain_retrieved_chunks,
        retrieval_time_ms=retrieval_ms,
        llm_response_time_ms=llm_ms,
        total_response_time_ms=total_ms,
    )
