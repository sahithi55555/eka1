from typing import Any, Dict, List, Tuple

from app.ai.constants import (
    PROMPT_CONTEXT_TEMPLATE,
    PROMPT_QUESTION_TEMPLATE,
    SYSTEM_PROMPT,
)


class PromptBuilder:
    def build_prompt(
        self, question: str, retrieved_chunks: List[Any]
    ) -> Tuple[List[Dict[str, str]], Dict[str, Dict[str, Any]]]:
        """Build a grounded LLM prompt and map source labels back to retrieved chunk metadata."""
        context_parts: List[str] = []
        source_map: Dict[str, Dict[str, Any]] = {}

        for index, chunk in enumerate(retrieved_chunks, start=1):
            source_id = f"Source {index}"

            if hasattr(chunk, "chunk_text"):
                chunk_text = getattr(chunk, "chunk_text", "")
                metadata = getattr(chunk, "metadata", None)
                document_name = getattr(metadata, "document_name", "Unknown Document")
                page_start = getattr(chunk, "page_start", 1)
                page_end = getattr(chunk, "page_end", 1)
                chunk_index = getattr(chunk, "chunk_index", -1)
            elif isinstance(chunk, dict):
                chunk_text = chunk.get("chunk_text", "")
                metadata = chunk.get("metadata", {})
                document_name = metadata.get("document_name", "Unknown Document")
                page_start = chunk.get("page_start", 1)
                page_end = chunk.get("page_end", 1)
                chunk_index = chunk.get("chunk_index", -1)
            else:
                chunk_text = getattr(chunk, "text", "")
                metadata = getattr(chunk, "metadata", {})
                document_name = getattr(metadata, "document_name", "Unknown Document")
                page_start = getattr(chunk, "page_start", 1)
                page_end = getattr(chunk, "page_end", 1)
                chunk_index = getattr(chunk, "chunk_index", -1)

            source_map[source_id] = {
                "document_name": document_name,
                "page_start": page_start,
                "page_end": page_end,
                "chunk_index": chunk_index,
                "text_preview": chunk_text[:200] + "..." if len(chunk_text) > 200 else chunk_text,
            }

            context_parts.append(
                PROMPT_CONTEXT_TEMPLATE.format(
                    source_index=index,
                    chunk_text=chunk_text,
                )
            )

        context_str = "\n".join(context_parts)
        user_message_content = PROMPT_QUESTION_TEMPLATE.format(
            context_str=context_str,
            question=question,
        )

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message_content},
        ]

        return messages, source_map
