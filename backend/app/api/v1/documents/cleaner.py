import re


def clean_text(text: str) -> str:
    # Remove zero-width chars and unprintable chars
    text = re.sub(r"[\u200b\u200c\u200d\u200e\u200f\ufeff]", "", text)
    # Collapse multiple newlines into two
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Collapse multiple spaces into one
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()
