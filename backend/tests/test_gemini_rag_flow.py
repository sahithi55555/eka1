import asyncio
from app.db.mongodb import connect_to_mongo, get_database, close_mongo_connection
from app.embeddings.model_loader import ModelLoader
from app.ai.service import process_ask, create_chat_session, get_chat_session_details
from app.ai.schemas import AskRequest
from app.auth.service import init_admin_user
from app.models.user import UserInDB
from datetime import datetime, timezone


async def run_end_to_end_test():
    print("Connecting to MongoDB...")
    await connect_to_mongo()
    db = get_database()

    print("Initializing ModelLoader for embeddings...")
    ModelLoader.initialize()

    await init_admin_user(db)
    admin_user_doc = await db.users.find_one({"email": "admin@eka.com"})
    admin_user = UserInDB(**admin_user_doc)

    print("\n==================================================")
    print("1. Testing Question 1: 'What is the company\'s leave policy?'")
    print("==================================================")

    req1 = AskRequest(question="What is the company's leave policy?", top_k=5)
    res1 = await process_ask(req1, db=db, current_user=admin_user)

    print(f"Status: Success")
    print(f"Session ID created: {res1.session_id}")
    print(f"Answer: {res1.answer}")
    print(f"Citations count: {len(res1.citations)}")
    for i, c in enumerate(res1.citations, 1):
        print(f"  Citation {i}: {c.document_name} (pages {c.page_start}-{c.page_end}, chunk {c.chunk_index})")
    print(f"Retrieved chunks count: {len(res1.retrieved_chunks)}")
    print(f"Retrieval time: {res1.retrieval_time_ms:.1f}ms | LLM time: {res1.llm_response_time_ms:.1f}ms")

    assert res1.session_id is not None
    assert len(res1.answer) > 0

    session_id = res1.session_id

    print("\n==================================================")
    print("2. Testing Follow-up Question: 'How many days are allowed?'")
    print("==================================================")

    req2 = AskRequest(question="How many days are allowed?", session_id=session_id, top_k=5)
    res2 = await process_ask(req2, db=db, current_user=admin_user)

    print(f"Status: Success")
    print(f"Session ID: {res2.session_id}")
    print(f"Answer: {res2.answer}")
    print(f"Citations count: {len(res2.citations)}")
    for i, c in enumerate(res2.citations, 1):
        print(f"  Citation {i}: {c.document_name} (pages {c.page_start}-{c.page_end}, chunk {c.chunk_index})")
    print(f"Retrieved chunks count: {len(res2.retrieved_chunks)}")
    print(f"Retrieval time: {res2.retrieval_time_ms:.1f}ms | LLM time: {res2.llm_response_time_ms:.1f}ms")

    assert res2.session_id == session_id
    assert len(res2.answer) > 0

    print("\n==================================================")
    print("3. Verifying Session History in Database")
    print("==================================================")
    details = await get_chat_session_details(session_id, admin_user, db)
    print(f"Total messages recorded in session: {len(details['messages'])}")
    for idx, msg in enumerate(details['messages'], 1):
        print(f"  [{idx}] {msg['role'].upper()}: {msg['content'][:80]}...")

    await close_mongo_connection()
    print("\n==================================================")
    print("ALL GEMINI END-TO-END RAG TESTS COMPLETED SUCCESSFULLY!")
    print("==================================================\n")


if __name__ == "__main__":
    asyncio.run(run_end_to_end_test())
