import re
from typing import Any, Dict, List, Optional, Tuple


def _is_heading(line: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Check if a line is a structural heading or section boundary.
    Returns (is_heading, section_number, section_title).
    """
    stripped = line.strip()
    if not stripped:
        return False, None, None

    # Pattern 1: Markdown headers (# Header, ## 1. Header, ### Section 2)
    md_match = re.match(r"^(#{1,6})\s+(.+)$", stripped)
    if md_match:
        content = md_match.group(2).strip()
        num_match = re.match(r"^(\d+(?:\.\d+)*)\.?\s+(.+)$", content)
        if num_match:
            return True, num_match.group(1), num_match.group(2).strip()
        sec_match = re.match(
            r"^(?:Section|Article|Chapter)\s+(\d+|[IVXLCDM]+)[\s:.\-]+(.+)$",
            content,
            re.IGNORECASE,
        )
        if sec_match:
            return True, sec_match.group(1), sec_match.group(2).strip()
        return True, None, content

    # Pattern 2: Explicit Section/Article/Chapter (e.g., Section 2: Annual Leave, Article 1 - Overview)
    sec_match = re.match(
        r"^(?:Section|Article|Chapter)\s+(\d+|[IVXLCDM]+)[\s:.\-]+(.+)$",
        stripped,
        re.IGNORECASE,
    )
    if sec_match:
        return True, sec_match.group(1), sec_match.group(2).strip()

    # Pattern 3: Numbered section header (e.g., "1. Working Hours and Attendance", "14. Policy Questions")
    num_match = re.match(r"^(\d+(?:\.\d+)*)\.?\s+([A-Z0-9][^\n]+)$", stripped)
    if num_match and len(stripped) <= 120:
        return True, num_match.group(1), num_match.group(2).strip()

    # Pattern 4: Standalone short title header (e.g., "Document purpose", "ACME CORPORATION")
    if len(stripped) <= 60 and not stripped.endswith((".", "?", "!", ";", ",")):
        words = stripped.split()
        if len(words) <= 7:
            if stripped.isupper() and any(c.isalpha() for c in stripped) and len(stripped) >= 3:
                return True, None, stripped
            if words and words[0][0].isupper():
                if stripped.lower() in [
                    "document purpose",
                    "table of contents",
                    "introduction",
                    "summary",
                    "conclusion",
                    "appendix",
                    "overview",
                    "employee handbook & workplace policies",
                ]:
                    return True, None, stripped

    return False, None, None


def _split_into_sentences(text: str) -> List[str]:
    """Split text cleanly into sentences using punctuation boundaries."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return [s.strip() for s in sentences if s.strip()]


def chunk_text(
    pages_data: List[Dict[str, Any]],
    chunk_size: int = 1000,
    chunk_overlap: int = 0,
) -> List[Dict[str, Any]]:
    """
    Deterministic structure-aware chunking:
    - Identifies headings, sections, paragraphs, and lists.
    - Keeps related section and paragraph content together.
    - Prevents non-substantive standalone headers/titles from forming isolated vector chunks.
    - Merges leading/isolated title headers with subsequent content blocks.
    - Only splits when a section exceeds chunk_size, splitting at paragraph and sentence boundaries.
    - Preserves accurate page_start and page_end derived from parser page data.
    - Sets metadata: chunk_index, text, word_count, character_count, page_start, page_end,
      section_number, section_title, and chunking_strategy='structure_aware'.
    """
    if not pages_data:
        return []

    # Step 1: Extract stream of structural units (headings and paragraphs) with page info
    raw_units = []
    for page in pages_data:
        page_num = page.get("page_number", 1)
        raw_text = page.get("text", "")
        lines = raw_text.split("\n")

        current_para_lines = []
        for line in lines:
            stripped = line.strip()
            if not stripped:
                if current_para_lines:
                    para_text = " ".join(current_para_lines)
                    raw_units.append(
                        {
                            "type": "text",
                            "text": para_text,
                            "page_number": page_num,
                        }
                    )
                    current_para_lines = []
                continue

            is_head, sec_num, sec_title = _is_heading(stripped)
            if is_head:
                if current_para_lines:
                    para_text = " ".join(current_para_lines)
                    raw_units.append(
                        {
                            "type": "text",
                            "text": para_text,
                            "page_number": page_num,
                        }
                    )
                    current_para_lines = []
                raw_units.append(
                    {
                        "type": "heading",
                        "text": stripped,
                        "page_number": page_num,
                        "section_num": sec_num,
                        "section_title": sec_title,
                    }
                )
            else:
                current_para_lines.append(stripped)

        if current_para_lines:
            para_text = " ".join(current_para_lines)
            raw_units.append(
                {"type": "text", "text": para_text, "page_number": page_num}
            )

    if not raw_units:
        return []

    # Step 2: Group units into Sections
    sections = []
    current_sec = {
        "section_num": None,
        "section_title": None,
        "heading_text": None,
        "items": [],  # list of (text, page_number)
    }

    for unit in raw_units:
        if unit["type"] == "heading":
            if current_sec["items"] or current_sec["heading_text"]:
                sections.append(current_sec)
            current_sec = {
                "section_num": unit["section_num"],
                "section_title": unit["section_title"],
                "heading_text": unit["text"],
                "items": [(unit["text"], unit["page_number"])],
            }
        else:
            current_sec["items"].append((unit["text"], unit["page_number"]))

    if current_sec["items"] or current_sec["heading_text"]:
        sections.append(current_sec)

    # Step 2b: Merge or attach non-substantive header/title blocks to avoid standalone isolated title chunks
    merged_sections = []
    pending_headers = []

    for sec in sections:
        items = sec["items"]
        if not items:
            continue

        sec_text = "\n\n".join([item[0] for item in items])
        word_count = len(sec_text.split())
        has_body = len(items) > 1 or (len(items) == 1 and sec["heading_text"] is None)
        is_substantive = (
            sec["section_num"] is not None
            or (has_body and word_count >= 15)
            or word_count >= 25
        )

        if not is_substantive:
            # Accumulate non-substantive title/header items to attach to following content
            pending_headers.extend(items)
        else:
            if pending_headers:
                combined_items = pending_headers + items
                combined_text = "\n\n".join([it[0] for it in combined_items])
                if len(combined_text) <= chunk_size:
                    sec["items"] = combined_items
                pending_headers = []
            merged_sections.append(sec)

    # If any pending headers remain and no substantive sections were created, retain them as fallback
    if not merged_sections and pending_headers:
        merged_sections.append(
            {
                "section_num": None,
                "section_title": None,
                "heading_text": None,
                "items": pending_headers,
            }
        )

    # Step 3: Emit Chunks from Sections respecting chunk_size
    chunks = []
    chunk_idx = 0

    for sec in merged_sections:
        sec_num = sec["section_num"]
        sec_title = sec["section_title"]
        items = sec["items"]
        if not items:
            continue

        sec_full_text = "\n\n".join([item[0] for item in items])
        sec_page_start = items[0][1]
        sec_page_end = items[-1][1]

        if len(sec_full_text) <= chunk_size:
            words = sec_full_text.split()
            chunks.append(
                {
                    "chunk_index": chunk_idx,
                    "text": sec_full_text,
                    "word_count": len(words),
                    "character_count": len(sec_full_text),
                    "page_start": sec_page_start,
                    "page_end": sec_page_end,
                    "section_number": sec_num,
                    "section_title": sec_title,
                    "chunking_strategy": "structure_aware",
                }
            )
            chunk_idx += 1
        else:
            curr_chunk_items = []
            curr_chunk_len = 0

            for item_text, item_page in items:
                item_len = len(item_text) + (2 if curr_chunk_items else 0)

                if curr_chunk_len + item_len <= chunk_size:
                    curr_chunk_items.append((item_text, item_page))
                    curr_chunk_len += item_len
                else:
                    if curr_chunk_items:
                        c_text = "\n\n".join([it[0] for it in curr_chunk_items])
                        words = c_text.split()
                        chunks.append(
                            {
                                "chunk_index": chunk_idx,
                                "text": c_text,
                                "word_count": len(words),
                                "character_count": len(c_text),
                                "page_start": curr_chunk_items[0][1],
                                "page_end": curr_chunk_items[-1][1],
                                "section_number": sec_num,
                                "section_title": sec_title,
                                "chunking_strategy": "structure_aware",
                            }
                        )
                        chunk_idx += 1
                        curr_chunk_items = []
                        curr_chunk_len = 0

                    if len(item_text) <= chunk_size:
                        curr_chunk_items.append((item_text, item_page))
                        curr_chunk_len = len(item_text)
                    else:
                        sentences = _split_into_sentences(item_text)
                        sent_items = []
                        sent_len = 0
                        for s in sentences:
                            s_len = len(s) + (1 if sent_items else 0)
                            if sent_len + s_len <= chunk_size:
                                sent_items.append(s)
                                sent_len += s_len
                            else:
                                if sent_items:
                                    s_text = " ".join(sent_items)
                                    words = s_text.split()
                                    chunks.append(
                                        {
                                            "chunk_index": chunk_idx,
                                            "text": s_text,
                                            "word_count": len(words),
                                            "character_count": len(s_text),
                                            "page_start": item_page,
                                            "page_end": item_page,
                                            "section_number": sec_num,
                                            "section_title": sec_title,
                                            "chunking_strategy": "structure_aware",
                                        }
                                    )
                                    chunk_idx += 1
                                    sent_items = []
                                    sent_len = 0

                                if len(s) <= chunk_size:
                                    sent_items.append(s)
                                    sent_len = len(s)
                                else:
                                    words = s.split()
                                    w_chunk = []
                                    w_len = 0
                                    for w in words:
                                        if w_len + len(w) + 1 > chunk_size and w_chunk:
                                            w_text = " ".join(w_chunk)
                                            chunks.append(
                                                {
                                                    "chunk_index": chunk_idx,
                                                    "text": w_text,
                                                    "word_count": len(w_chunk),
                                                    "character_count": len(w_text),
                                                    "page_start": item_page,
                                                    "page_end": item_page,
                                                    "section_number": sec_num,
                                                    "section_title": sec_title,
                                                    "chunking_strategy": "structure_aware",
                                                }
                                            )
                                            chunk_idx += 1
                                            w_chunk = []
                                            w_len = 0
                                        w_chunk.append(w)
                                        w_len += len(w) + 1
                                    if w_chunk:
                                        w_text = " ".join(w_chunk)
                                        chunks.append(
                                            {
                                                "chunk_index": chunk_idx,
                                                "text": w_text,
                                                "word_count": len(w_chunk),
                                                "character_count": len(w_text),
                                                "page_start": item_page,
                                                "page_end": item_page,
                                                "section_number": sec_num,
                                                "section_title": sec_title,
                                                "chunking_strategy": "structure_aware",
                                            }
                                        )
                                        chunk_idx += 1

            if curr_chunk_items:
                c_text = "\n\n".join([it[0] for it in curr_chunk_items])
                words = c_text.split()
                chunks.append(
                    {
                        "chunk_index": chunk_idx,
                        "text": c_text,
                        "word_count": len(words),
                        "character_count": len(c_text),
                        "page_start": curr_chunk_items[0][1],
                        "page_end": curr_chunk_items[-1][1],
                        "section_number": sec_num,
                        "section_title": sec_title,
                        "chunking_strategy": "structure_aware",
                    }
                )
                chunk_idx += 1

    return chunks
