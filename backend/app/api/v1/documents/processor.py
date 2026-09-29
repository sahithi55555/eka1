from datetime import datetime

from app.api.v1.documents import chunker, cleaner, parser
from app.api.v1.documents.constants import (
    DEFAULT_CHUNK_OVERLAP,
    DEFAULT_CHUNK_SIZE,
    ProcessingStatus,
)
from app.db.mongodb import get_database


async def process_document_pipeline(document_id: str, force: bool = False):
    db = get_database()
    try:
        doc = await db.documents.find_one({"id": document_id})
        if not doc:
            return

        if force:
            # Clean up old chunks and vectors before re-processing
            await db.document_chunks.delete_many({"document_id": document_id})
            try:
                from app.retrieval.repository import ChromaDBRepository

                repo = ChromaDBRepository()
                repo.delete_by_document(document_id)
            except Exception as e:
                print(f"ChromaDB cleanup error on reindex: {e}")

        has_chunks = (
            await db.document_chunks.count_documents({"document_id": document_id}) > 0
        )

        # Run parsing, cleaning, chunking only if chunks are not present
        if not has_chunks:
            await db.documents.update_one(
                {"id": document_id},
                {
                    "$set": {
                        "status": ProcessingStatus.PARSING,
                        "current_stage": "Parsing Document",
                    }
                },
            )
            pages_data = parser.parse_document(doc["storage_path"])

            await db.documents.update_one(
                {"id": document_id},
                {
                    "$set": {
                        "status": ProcessingStatus.CLEANING,
                        "current_stage": "Cleaning Text",
                    }
                },
            )
            for p in pages_data:
                p["text"] = cleaner.clean_text(p["text"])

            await db.documents.update_one(
                {"id": document_id},
                {
                    "$set": {
                        "status": ProcessingStatus.CHUNKING,
                        "current_stage": "Chunking Text",
                    }
                },
            )
            chunks = chunker.chunk_text(
                pages_data, DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_OVERLAP
            )

            if chunks:
                chunk_records = []
                for chunk in chunks:
                    chunk_records.append(
                        {
                            "document_id": document_id,
                            "chunk_index": chunk["chunk_index"],
                            "text": chunk["text"],
                            "word_count": chunk["word_count"],
                            "character_count": chunk["character_count"],
                            "section_number": chunk.get("section_number"),
                            "section_title": chunk.get("section_title"),
                            "chunking_strategy": chunk.get(
                                "chunking_strategy", "structure_aware"
                            ),
                            "metadata": {
                                "document_name": doc.get(
                                    "original_filename", ""
                                ),
                                "file_type": doc.get("file_type", ""),
                                "page_start": chunk["page_start"],
                                "page_end": chunk["page_end"],
                                "section_number": chunk.get("section_number"),
                                "section_title": chunk.get("section_title"),
                                "chunking_strategy": chunk.get(
                                    "chunking_strategy", "structure_aware"
                                ),
                            },
                            "created_at": datetime.utcnow(),
                        }
                    )
                await db.document_chunks.insert_many(chunk_records)

            # Immediately update metadata BEFORE embedding
            total_words = sum(c["word_count"] for c in chunks) if chunks else 0
            total_chars = (
                sum(c["character_count"] for c in chunks) if chunks else 0
            )

            await db.documents.update_one(
                {"id": document_id},
                {
                    "$set": {
                        "status": ProcessingStatus.CHUNKED,
                        "current_stage": "Chunking Completed",
                        "chunk_count": len(chunks),
                        "word_count": total_words,
                        "character_count": total_chars,
                        "chunking_strategy": "structure_aware",
                        "processed_at": datetime.utcnow(),
                    }
                },
            )

        # Check if already embedded/completed
        doc = await db.documents.find_one({"id": document_id})
        status = doc.get("status")

        if force or status not in [ProcessingStatus.COMPLETED]:
            from app.embeddings import constants as emb_const
            from app.embeddings import embedder

            cursor = db.document_chunks.find({"document_id": document_id}).sort(
                "chunk_index", 1
            )
            chunks = await cursor.to_list(length=10000)

            if chunks:
                await db.documents.update_one(
                    {"id": document_id},
                    {
                        "$set": {
                            "status": ProcessingStatus.EMBEDDING,
                            "current_stage": "Generating Embeddings",
                        }
                    },
                )
                texts = [c["text"] for c in chunks]
                embeddings = embedder.generate_embeddings(texts)

                await db.documents.update_one(
                    {"id": document_id},
                    {
                        "$set": {
                            "status": ProcessingStatus.INDEXING,
                            "current_stage": "Indexing Vector Space",
                        }
                    },
                )

                embedder.index_vectors_chroma(chunks, embeddings, document_id)

                await db.documents.update_one(
                    {"id": document_id},
                    {
                        "$set": {
                            "status": ProcessingStatus.COMPLETED,
                            "current_stage": "Processing Completed",
                            "embedding_model": emb_const.EMBEDDING_MODEL_NAME,
                            "embedding_dimension": emb_const.EMBEDDING_DIMENSION,
                            "embedding_count": len(embeddings),
                            "chunking_strategy": "structure_aware",
                            "indexed_at": datetime.utcnow(),
                        }
                    },
                )
            else:
                await db.documents.update_one(
                    {"id": document_id},
                    {
                        "$set": {
                            "status": ProcessingStatus.COMPLETED,
                            "current_stage": "Processing Completed",
                            "chunking_strategy": "structure_aware",
                        }
                    },
                )

    except Exception as e:
        print(f"Error processing document: {e}")
        await db.documents.update_one(
            {"id": document_id},
            {
                "$set": {
                    "status": ProcessingStatus.FAILED,
                    "error_message": str(e),
                }
            },
        )
