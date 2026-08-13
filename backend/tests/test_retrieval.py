from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.retrieval.schemas import DocumentSearchRequest, SearchRequest
from app.retrieval.search_service import search_chunks


@pytest.fixture
def mock_mongo():
    with patch("app.retrieval.search_service.get_database") as mock_get_db:
        db = MagicMock()
        db.documents.find_one = AsyncMock(
            return_value={"id": "doc1", "filename": "test.txt"}
        )
        db.document_chunks.find_one = AsyncMock(
            return_value={"word_count": 100, "character_count": 500}
        )
        mock_get_db.return_value = db
        yield mock_get_db


@pytest.fixture
def mock_model():
    with patch(
        "app.retrieval.search_service.generate_query_embedding",
        return_value=[0.1] * 384,
    ) as mock_embed:
        yield mock_embed


@pytest.fixture
def mock_repo():
    with patch("app.retrieval.search_service.vector_repo") as mock_vector_repo:
        yield mock_vector_repo


@pytest.mark.asyncio
async def test_empty_query():
    req = SearchRequest(query="   ")
    res = await search_chunks(req)
    assert not res.success
    assert res.error_code == "EMPTY_QUERY"


@pytest.mark.asyncio
async def test_invalid_top_k():
    req = SearchRequest(query="test", top_k=50)
    res = await search_chunks(req)
    assert not res.success
    assert res.error_code == "INVALID_TOP_K"


@pytest.mark.asyncio
async def test_empty_chroma_index(mock_repo, mock_model):
    mock_repo.count.return_value = 0
    req = SearchRequest(query="test")
    res = await search_chunks(req)
    assert res.success
    assert res.data.total_results == 0
    assert "empty" in res.message


@pytest.mark.asyncio
async def test_no_matching_results_above_threshold(mock_repo, mock_model):
    mock_repo.count.return_value = 10
    # Simulate a raw result below threshold (0.50)
    mock_repo.search.return_value = [{"similarity": 0.49}]

    req = SearchRequest(query="test")
    res = await search_chunks(req)

    assert res.success
    assert res.data.total_results == 0
    assert res.data.results == []
    assert "above the similarity threshold" in res.message


@pytest.mark.asyncio
async def test_successful_retrieval(mock_repo, mock_model, mock_mongo):
    mock_repo.count.return_value = 100
    mock_repo.search.return_value = [
        {
            "chunk_id": "doc1_0",
            "similarity": 0.85,
            "text": "Hello world",
            "metadata": {"document_id": "doc1", "chunk_index": 0},
        }
    ]

    req = SearchRequest(query="test query")
    res = await search_chunks(req)

    assert res.success
    assert res.data.total_results == 1

    chunk = res.data.results[0]
    assert chunk.document_id == "doc1"
    assert chunk.similarity_score == 0.85
    assert chunk.metadata.word_count == 100
    assert res.metadata.vector_search_time_ms is not None


@pytest.mark.asyncio
async def test_search_by_document(mock_repo, mock_model, mock_mongo):
    mock_repo.count.return_value = 50
    mock_repo.search.return_value = [
        {
            "chunk_id": "doc2_1",
            "similarity": 0.90,
            "text": "Specific doc text",
            "metadata": {"document_id": "doc2", "chunk_index": 1},
        }
    ]

    req = DocumentSearchRequest(query="find this", document_id="doc2")
    res = await search_chunks(req)

    mock_repo.search.assert_called_once()
    kwargs = mock_repo.search.call_args[1]
    assert kwargs["filters"]["document_id"] == "doc2"
    assert res.success
    assert res.data.results[0].document_id == "doc2"


def test_query_normalization():
    from app.retrieval.query_embedder import normalize_query

    q = "   hello   world  \t  spaces  "
    nq = normalize_query(q)
    assert nq == "hello world spaces"
