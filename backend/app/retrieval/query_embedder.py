import re

from app.embeddings.model_loader import ModelLoader


def normalize_query(query: str) -> str:
    # Trim leading and trailing
    # Collapse multiple consecutive spaces
    query = query.strip()
    return re.sub(r"\s+", " ", query)


def generate_query_embedding(query: str) -> list[float]:
    model = ModelLoader.get_model()
    embeddings = model.encode([query], convert_to_numpy=True)
    return embeddings[0].tolist()
