import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException

from app.ai.schemas import AskRequest
from app.ai.service import (
    create_chat_session,
    delete_chat_session,
    get_chat_session_details,
    get_user_chat_sessions,
    process_ask,
)


class FakeMongoCollection:
    def __init__(self):
        self.docs = {}

    async def find_one(self, query):
        for doc in self.docs.values():
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    async def insert_one(self, doc):
        self.docs[doc["_id"]] = doc
        return doc

    async def insert_many(self, docs):
        for doc in docs:
            self.docs[doc["_id"]] = doc
        return docs

    async def update_one(self, query, update):
        target_id = query.get("_id")
        if target_id and target_id in self.docs:
            if "$set" in update:
                self.docs[target_id].update(update["$set"])
        return True

    async def delete_one(self, query):
        target_id = query.get("_id")
        if target_id and target_id in self.docs:
            del self.docs[target_id]
        return True

    async def delete_many(self, query):
        session_id = query.get("session_id")
        to_delete = [
            k for k, v in self.docs.items() if v.get("session_id") == session_id
        ]
        for k in to_delete:
            del self.docs[k]
        return True

    def find(self, query=None):
        query = query or {}
        matched = []
        for doc in self.docs.values():
            match = True
            if "$or" in query:
                or_match = False
                for branch in query["$or"]:
                    branch_match = True
                    for k, v in branch.items():
                        if doc.get(k) != v:
                            branch_match = False
                            break
                    if branch_match:
                        or_match = True
                        break
                if not or_match:
                    match = False
            else:
                for k, v in query.items():
                    if doc.get(k) != v:
                        match = False
                        break
            if match:
                matched.append(doc)

        class AsyncIter:
            def __init__(self, items):
                self.items = items
                self.idx = 0

            def sort(self, key, direction=1):
                reverse = direction == -1
                self.items = sorted(
                    self.items, key=lambda x: x.get(key, datetime.min), reverse=reverse
                )
                return self

            def limit(self, n):
                self.items = self.items[:n]
                return self

            def __aiter__(self):
                return self

            async def __anext__(self):
                if self.idx >= len(self.items):
                    raise StopAsyncIteration
                item = self.items[self.idx]
                self.idx += 1
                return item

        return AsyncIter(matched)


class FakeDB:
    def __init__(self):
        self.chat_sessions = FakeMongoCollection()
        self.chat_messages = FakeMongoCollection()


@pytest.fixture
def mock_user():
    return SimpleNamespace(id="user_123", email="user@eka.com", role="employee")


@pytest.fixture
def mock_user_2():
    return SimpleNamespace(id="user_456", email="other@eka.com", role="employee")


@pytest.mark.asyncio
async def test_session_creation_and_follow_up_history(mock_user):
    db = FakeDB()
    chunk1 = SimpleNamespace(
        chunk_text="Leave policy: employees get 20 days paid time off.",
        page_start=1,
        page_end=1,
        chunk_index=0,
        metadata=SimpleNamespace(document_name="hr-policy.pdf"),
    )

    with patch(
        "app.ai.service.search_chunks",
        AsyncMock(
            return_value=SimpleNamespace(
                success=True,
                message="ok",
                data=SimpleNamespace(results=[chunk1]),
            )
        ),
    ), patch(
        "app.ai.service.llm_provider.generate_response",
        AsyncMock(return_value="Employees receive 20 days paid leave [Source 1]."),
    ):
        # 1. Ask initial question
        req1 = AskRequest(question="What is the leave policy?")
        res1 = await process_ask(req1, db=db, current_user=mock_user)

        assert res1.session_id is not None
        assert "20 days" in res1.answer
        assert len(res1.citations) == 1
        assert res1.citations[0].document_name == "hr-policy.pdf"

        session_id = res1.session_id

        # 2. Ask follow-up question in the same session
        req2 = AskRequest(question="How many days?", session_id=session_id)
        res2 = await process_ask(req2, db=db, current_user=mock_user)

        assert res2.session_id == session_id

        # 3. Verify messages in history
        session_details = await get_chat_session_details(
            session_id, mock_user, db
        )
        assert len(session_details["messages"]) == 4  # (User1, Assistant1, User2, Assistant2)
        assert session_details["messages"][0]["role"] == "user"
        assert session_details["messages"][0]["content"] == "What is the leave policy?"
        assert session_details["messages"][1]["role"] == "assistant"
        assert session_details["messages"][2]["role"] == "user"
        assert session_details["messages"][2]["content"] == "How many days?"


@pytest.mark.asyncio
async def test_user_session_isolation_and_authorization(mock_user, mock_user_2):
    db = FakeDB()
    session = await create_chat_session("Confidential Chat", mock_user, db)
    session_id = session["session_id"]

    # User 1 can access own session
    user1_session = await get_chat_session_details(session_id, mock_user, db)
    assert user1_session["title"] == "Confidential Chat"

    # User 2 CANNOT access User 1's session
    with pytest.raises(HTTPException) as exc_info:
        await get_chat_session_details(session_id, mock_user_2, db)
    assert exc_info.value.status_code == 403

    # User 2 CANNOT ask a question inside User 1's session
    with pytest.raises(HTTPException) as exc_info:
        await process_ask(
            AskRequest(question="Peek into secret session", session_id=session_id),
            db=db,
            current_user=mock_user_2,
        )
    assert exc_info.value.status_code == 403

    # User 2 CANNOT delete User 1's session
    with pytest.raises(HTTPException) as exc_info:
        await delete_chat_session(session_id, mock_user_2, db)
    assert exc_info.value.status_code == 403

    # User 1 can list their own sessions
    user1_sessions = await get_user_chat_sessions(mock_user, db)
    assert len(user1_sessions) == 1
    assert user1_sessions[0]["session_id"] == session_id

    # User 2 listing sessions sees empty list
    user2_sessions = await get_user_chat_sessions(mock_user_2, db)
    assert len(user2_sessions) == 0

    # User 1 deletes own session
    del_res = await delete_chat_session(session_id, mock_user, db)
    assert del_res is True

    # After deletion, accessing raises 404
    with pytest.raises(HTTPException) as exc_info:
        await get_chat_session_details(session_id, mock_user, db)
    assert exc_info.value.status_code == 404
