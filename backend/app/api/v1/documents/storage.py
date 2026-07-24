import os
import shutil
import uuid

from fastapi import UploadFile

UPLOAD_DIR = os.path.join(os.getcwd(), "uploaded_documents")


def _ensure_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


async def save_upload_file(upload_file: UploadFile) -> tuple[str, str, int]:
    _ensure_dir()

    file_extension = (
        os.path.splitext(upload_file.filename)[1] if upload_file.filename else ""
    )
    unique_id = str(uuid.uuid4())
    new_filename = f"{unique_id}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    file_size = os.path.getsize(file_path)
    return unique_id, file_path, file_size


def delete_file(file_path: str):
    if os.path.exists(file_path):
        os.remove(file_path)
