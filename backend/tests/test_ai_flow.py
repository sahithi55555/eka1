from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

from app.ai.schemas import AskRequest
from app.ai.service import process_ask
from app.core.config import settings


@pytest.mark.asyncio
async def test_process_ask_uses_retrieval_and_maps_sources():
    chunk = SimpleNamespace(
        document_id="doc-123",
        chunk_id="doc-123_0",
        chunk_index=0,
        chunk_text="Acme permits 20 days of annual leave.",
        page_start=2,
        page_end=2,
        metadata=SimpleNamespace(
            document_name="leave-policy.pdf",
            chunk_index=0,
        ),
    )

    with patch(
        "app.ai.service.search_chunks",
        AsyncMock(
            return_value=SimpleNamespace(
                success=True,
                message="ok",
                data=SimpleNamespace(results=[chunk]),
            )
        ),
    ), patch(
        "app.ai.service.llm_provider.generate_response",
        AsyncMock(return_value="The leave policy allows 20 days [Source 1]."),
    ):
        response = await process_ask(AskRequest(question="How much leave?", top_k=3))

    assert response.answer == "The leave policy allows 20 days [Source 1]."
    assert response.citations[0].document_name == "leave-policy.pdf"
    assert response.citations[0].page_start == 2
    assert response.citations[0].page_end == 2
    assert response.citations[0].chunk_index == 0
    assert response.retrieval_time_ms >= 0
    assert response.llm_response_time_ms >= 0
    assert response.total_response_time_ms >= 0


def test_llm_settings_are_configured():
    assert hasattr(settings, "OPENAI_API_KEY")
    assert hasattr(settings, "LLM_MODEL")
