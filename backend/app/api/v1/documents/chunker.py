def chunk_text(pages_data, chunk_size, chunk_overlap):
    words_info = []
    for p in pages_data:
        for w in p["text"].split():
            words_info.append((w, p.get("page_number", 1)))

    if not words_info:
        return []

    chunks = []
    idx = 0
    chunk_idx = 0

    while idx < len(words_info):
        current_words = []
        current_len = 0
        start_idx = idx

        while idx < len(words_info):
            w = words_info[idx][0]
            w_len = len(w) + (1 if current_words else 0)
            if current_len + w_len > chunk_size and current_words:
                break
            current_words.append(w)
            current_len += w_len
            idx += 1

        if not current_words:
            # force include if single word is longer than chunk_size
            current_words.append(words_info[idx][0])
            idx += 1

        text = " ".join(current_words)
        page_start = words_info[start_idx][1]
        page_end = words_info[idx - 1][1]

        chunks.append(
            {
                "chunk_index": chunk_idx,
                "text": text,
                "word_count": len(current_words),
                "character_count": len(text),
                "page_start": page_start,
                "page_end": page_end,
            }
        )
        chunk_idx += 1

        if idx >= len(words_info):
            break

        # Calculate overlap
        overlap_chars = 0
        backtrack_idx = idx - 1
        while backtrack_idx > start_idx:
            w_len = len(words_info[backtrack_idx][0]) + 1
            if overlap_chars + w_len > chunk_overlap:
                break
            overlap_chars += w_len
            backtrack_idx -= 1

        idx = backtrack_idx + 1

    return chunks
