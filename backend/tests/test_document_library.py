import pytest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch

from app.api.v1.documents import service
from app.api.v1.documents.constants import ProcessingStatus
from app.models.user import UserInDB


@pytest.fixture
def mock_db():
    db = MagicMock()
    # In-memory document and chunk storage
    documents = {}
    chunks = {}
    users = {
        "admin@eka.com": {"email": "admin@eka.com", "role": "admin"},
        "emp@eka.com": {"email": "emp@eka.com", "role": "employee"},
        "other@eka.com": {"email": "other@eka.com", "role": "employee"},
    }

    async def mock_insert_one_doc(doc):
        documents[doc["id"]] = doc
        return MagicMock(inserted_id=doc["id"])

    async def mock_find_one_doc(query):
        for doc in documents.values():
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    async def mock_find_one_user(query):
        return users.get(query.get("email"))

    async def mock_delete_one_doc(query):
        to_del = None
        for doc_id, doc in list(documents.items()):
            if doc.get("id") == query.get("id"):
                to_del = doc_id
                break
        if to_del:
            del documents[to_del]

    async def mock_delete_many_chunks(query):
        to_del = []
        for c_id, c in list(chunks.items()):
            if c.get("document_id") == query.get("document_id"):
                to_del.append(c_id)
        for c_id in to_del:
            del chunks[c_id]

    async def mock_to_list(length=100):
        return list(documents.values())

    mock_cursor = MagicMock()
    mock_cursor.sort.return_value = mock_cursor
    mock_cursor.to_list = mock_to_list

    db.documents.insert_one = mock_insert_one_doc
    db.documents.find_one = mock_find_one_doc
    db.documents.find.return_value = mock_cursor
    db.documents.delete_one = mock_delete_one_doc
    db.users.find_one = mock_find_one_user
    db.document_chunks.delete_many = mock_delete_many_chunks
    db.document_chunks.find.return_value = mock_cursor

    return db


@pytest.mark.asyncio
async def test_document_upload_and_separate_processing(mock_db):
    bg_tasks = MagicMock()
    mock_file = MagicMock()
    mock_file.filename = "Policy_Guide.pdf"
    mock_file.content_type = "application/pdf"

    with patch("app.api.v1.documents.storage.save_upload_file", AsyncMock(return_value=("doc-123", "/path/doc-123.pdf", 10240))):
        # 1. Upload with auto_process=False
        doc_res = await service.process_and_store_document(
            mock_file, "emp@eka.com", mock_db, bg_tasks, auto_process=False
        )

        assert doc_res.id == "doc-123"
        assert doc_res.status == ProcessingStatus.UPLOADED
        assert doc_res.original_filename == "Policy_Guide.pdf"
        assert bg_tasks.add_task.call_count == 0  # Not processed automatically

        # 2. Get document details
        detail = await service.get_document_by_id("doc-123", "emp@eka.com", mock_db)
        assert detail is not None
        assert detail.id == "doc-123"
        assert detail.status == ProcessingStatus.UPLOADED

        # 3. Trigger processing explicitly
        success = await service.trigger_embedding("doc-123", "emp@eka.com", mock_db, bg_tasks)
        assert success is True
        assert bg_tasks.add_task.call_count == 1

        # 4. Non-owner employee cannot access or delete
        other_detail = await service.get_document_by_id("doc-123", "other@eka.com", mock_db)
        assert other_detail is None

        # 5. Admin can access any document
        admin_detail = await service.get_document_by_id("doc-123", "admin@eka.com", mock_db)
        assert admin_detail is not None

        # 6. Delete document
        with patch("app.api.v1.documents.storage.delete_file"):
            with patch("app.retrieval.repository.ChromaDBRepository.delete_by_document"):
                del_res = await service.delete_document_by_id("doc-123", "emp@eka.com", mock_db)
                assert del_res is True

                # Verify gone
                post_del = await service.get_document_by_id("doc-123", "emp@eka.com", mock_db)
                assert post_del is None
