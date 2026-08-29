from app.core.config import settings
from openai import AsyncOpenAI, OpenAIError


class LLMProvider:
    def __init__(self):
        self.model = settings.LLM_MODEL
        self._cached_key = None
        self._cached_base_url = None
        self._client = None

    def get_client(self):
        raw_key = (settings.GEMINI_API_KEY or settings.OPENAI_API_KEY or "").strip()
        raw_base_url = (settings.LLM_BASE_URL or "").strip()
        if not raw_key:
            return None

        if (
            self._client is None
            or self._cached_key != raw_key
            or self._cached_base_url != raw_base_url
        ):
            kwargs = {"api_key": raw_key}
            if raw_base_url:
                kwargs["base_url"] = raw_base_url
            self._client = AsyncOpenAI(**kwargs)
            self._cached_key = raw_key
            self._cached_base_url = raw_base_url

        return self._client


    @property
    def client(self):
        return self.get_client()

    @client.setter
    def client(self, value):
        self._client = value

    async def generate_response(self, messages: list) -> str:
        active_client = self.get_client()
        if not active_client:
            raise ValueError(
                "LLM provider is not configured. Set OPENAI_API_KEY in environment/config."
            )

        try:
            response = await active_client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.0,
            )
            return response.choices[0].message.content or ""
        except OpenAIError as e:
            raise ValueError(f"LLM provider failure: {str(e)}")
        except TimeoutError as e:
            raise ValueError(f"LLM provider request timed out: {str(e)}")

