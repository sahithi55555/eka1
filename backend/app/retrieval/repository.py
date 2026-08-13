from abc import ABC, abstractmethod
from typing import Any, Dict, List

import chromadb
from app.embeddings.constants import CHROMA_COLLECTION_NAME


class VectorRepository(ABC):
    @abstractmethod
    def search(
        self, query_embedding: List[float], top_k: int, filters: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def count(self) -> int:
        pass


class ChromaDBRepository(VectorRepository):
    def __init__(self):
        self.chroma_client = chromadb.PersistentClient(path="./chroma_db")

    def _get_collection(self):
        return self.chroma_client.get_or_create_collection(
            name=CHROMA_COLLECTION_NAME, metadata={"hnsw:space": "cosine"}
        )

    def count(self) -> int:
        collection = self._get_collection()
        return collection.count()

    def search(
        self, query_embedding: List[float], top_k: int, filters: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        collection = self._get_collection()
        if collection.count() == 0:
            return []

        where_clause = {}
        if filters:
            if "document_id" in filters and filters["document_id"]:
                where_clause["document_id"] = filters["document_id"]

        # Only attach where clause if not empty
        kwargs = {
            "query_embeddings": [query_embedding],
            "n_results": top_k,
            "include": ["metadatas", "documents", "distances"],
        }

        if where_clause:
            kwargs["where"] = where_clause

        try:
            results = collection.query(**kwargs)
        except Exception:
            return []

        if not results or not results["documents"] or not results["documents"][0]:
            return []

        retrieved = []
        # Return structured records
        docs = results["documents"][0]
        metas = results["metadatas"][0]
        distances = results["distances"][0]

        for i in range(len(docs)):
            # convert string to float for certainty, and parse metadata
            # chroma cosine distance: similarity = 1 - distance (roughly)
            # Some versions of chroma return distance, others similarity. We'll map distance to similarity
            # Distance 0 is identical, so similarity = 1.0 - distance
            similarity = 1.0 - float(distances[i])

            meta = metas[i]

            # Extract basic identifiers
            doc_id = meta.get("document_id", "")
            chunk_idx = meta.get("chunk_index", 0)
            chunk_id = f"{doc_id}_{chunk_idx}"

            retrieved.append(
                {
                    "chunk_id": chunk_id,
                    "similarity": similarity,
                    "text": docs[i],
                    "metadata": meta,
                }
            )

        return retrieved
