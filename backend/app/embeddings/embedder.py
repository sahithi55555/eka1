import chromadb
from app.embeddings.constants import CHROMA_COLLECTION_NAME
from app.embeddings.model_loader import ModelLoader
from chromadb.config import Settings

chroma_client = chromadb.PersistentClient(path="./chroma_db")


def get_collection():
    return chroma_client.get_or_create_collection(
        name=CHROMA_COLLECTION_NAME, metadata={"hnsw:space": "cosine"}
    )


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    model = ModelLoader.get_model()
    embeddings = model.encode(texts, convert_to_numpy=True)
    return embeddings.tolist()


def index_vectors_chroma(
    chunks: list[dict], embeddings: list[list[float]], document_id: str
):
    if not chunks:
        return 0

    collection = get_collection()
    texts = [chunk["text"] for chunk in chunks]
    ids = [f"{document_id}_{chunk['chunk_index']}" for chunk in chunks]
    metadatas = []

    for chunk in chunks:
        doc_metadata = chunk.get("metadata", {})
        meta = {
            "document_id": document_id,
            "chunk_index": chunk.get("chunk_index", 0),
            "page_start": doc_metadata.get("page_start", 1),
            "page_end": doc_metadata.get("page_end", 1),
            "document_name": doc_metadata.get("document_name", ""),
        }
        metadatas.append(meta)

    collection.add(documents=texts, embeddings=embeddings, metadatas=metadatas, ids=ids)
    return len(embeddings)
