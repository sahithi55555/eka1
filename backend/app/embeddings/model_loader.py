import os

from app.embeddings.constants import EMBEDDING_MODEL_NAME
from sentence_transformers import SentenceTransformer


class ModelLoader:
    _instance: SentenceTransformer = None

    @classmethod
    def get_model(cls) -> SentenceTransformer:
        if cls._instance is None:
            cls.initialize()
        return cls._instance

    @classmethod
    def initialize(cls):
        if cls._instance is None:
            os.environ["TOKENIZERS_PARALLELISM"] = "false"
            cls._instance = SentenceTransformer(EMBEDDING_MODEL_NAME)
