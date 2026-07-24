import os

from app.embeddings.constants import EMBEDDING_MODEL_NAME
from sentence_transformers import SentenceTransformer


class ModelLoader:
    _instance: SentenceTransformer = None

    @classmethod
    def get_model(cls) -> SentenceTransformer:
        if cls._instance is None:
            raise RuntimeError(
                "Model has not been initialized. Call initialize() during startup."
            )
        return cls._instance

    @classmethod
    def initialize(cls):
        if cls._instance is None:
            # We enforce downloading and loading the model on startup
            os.environ["TOKENIZERS_PARALLELISM"] = "false"
            cls._instance = SentenceTransformer(EMBEDDING_MODEL_NAME)
