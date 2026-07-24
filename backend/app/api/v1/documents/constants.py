SUPPORTED_FILE_TYPES = [".pdf", ".docx", ".txt", ".md"]
DEFAULT_CHUNK_SIZE = 1000
DEFAULT_CHUNK_OVERLAP = 200


class ProcessingStatus:
    UPLOADED = "Uploaded"
    PARSING = "Parsing"
    CLEANING = "Cleaning"
    CHUNKING = "Chunking"
    CHUNKED = "Chunked"
    EMBEDDING = "Embedding"
    INDEXING = "Indexing"
    COMPLETED = "Completed"
    FAILED = "Failed"
