import os

import docx
import pypdf


def parse_pdf(file_path: str):
    pages = []
    with open(file_path, "rb") as f:
        reader = pypdf.PdfReader(f)
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                pages.append({"text": text, "page_number": i + 1})
    return pages


def parse_docx(file_path: str):
    doc = docx.Document(file_path)
    text = "\n".join([para.text for para in doc.paragraphs if para.text])
    return [{"text": text, "page_number": 1}]


def parse_txt(file_path: str):
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
    return [{"text": text, "page_number": 1}]


def parse_document(file_path: str):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return parse_pdf(file_path)
    elif ext == ".docx":
        return parse_docx(file_path)
    elif ext in [".txt", ".md"]:
        return parse_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")
