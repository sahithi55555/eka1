import asyncio
from app.db.mongodb import connect_to_mongo, get_database, close_mongo_connection
from app.embeddings.model_loader import ModelLoader
from app.api.v1.documents.processor import process_document_pipeline

async def reindex_all():
    print("Connecting to MongoDB...")
    await connect_to_mongo()
    db = get_database()

    print("Initializing embedding model...")
    ModelLoader.initialize()

    docs = await db.documents.find({}).to_list(100)
    print(f"Found {len(docs)} documents to re-index with structure-aware chunking:")

    for d in docs:
        doc_id = d["id"]
        filename = d.get("original_filename", d.get("filename", "unknown"))
        print(f"\n--- Re-indexing document: {filename} (ID: {doc_id}) ---")
        await process_document_pipeline(doc_id, force=True)
        updated = await db.documents.find_one({"id": doc_id})
        print(f"Result: status={updated.get('status')}, chunks={updated.get('chunk_count')}, strategy={updated.get('chunking_strategy')}")

    await close_mongo_connection()
    print("\nAll documents re-indexed successfully!")

if __name__ == "__main__":
    asyncio.run(reindex_all())
