import asyncio
from app.db.mongodb import connect_to_mongo, get_database, close_mongo_connection

async def inspect_acme_chunks():
    await connect_to_mongo()
    db = get_database()
    doc_id = "82ec1429-b2e2-4249-912a-8d17e3593293"
    doc = await db.documents.find_one({"id": doc_id})
    print(f"Document: {doc['original_filename']}")
    print(f"Status: {doc['status']}, Strategy: {doc.get('chunking_strategy')}")
    print(f"Total Chunks: {doc['chunk_count']}, Total Words: {doc['word_count']}, Total Chars: {doc['character_count']}\n")

    chunks = await db.document_chunks.find({"document_id": doc_id}).sort("chunk_index", 1).to_list(100)
    for c in chunks:
        sec_num = c.get("section_number")
        sec_title = c.get("section_title")
        strat = c.get("chunking_strategy")
        page_s = c["metadata"].get("page_start")
        page_e = c["metadata"].get("page_end")
        words = c.get("word_count")
        chars = c.get("character_count")
        snippet = c["text"][:120].replace('\n', ' ')
        print(f"[{c['chunk_index']:02d}] Sec #{sec_num or 'N/A'}: '{sec_title or 'N/A'}' | Pages: {page_s}-{page_e} | Words: {words} | Chars: {chars} | Strat: {strat}")
        print(f"     Snippet: {snippet}...\n")

    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(inspect_acme_chunks())
