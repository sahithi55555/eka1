from app.core.config import settings
from openai import AsyncOpenAI, OpenAIError


class LLMProvider:
    def __init__(self):
        self.model = settings.LLM_MODEL
        self.client = None

        if settings.OPENAI_API_KEY:
            kwargs = {"api_key": settings.OPENAI_API_KEY}
            if settings.LLM_BASE_URL:
                kwargs["base_url"] = settings.LLM_BASE_URL
            self.client = AsyncOpenAI(**kwargs)

    async def generate_response(self, messages: list) -> str:
        if not self.client:
            raise ValueError(
                "LLM provider is not configured. Set OPENAI_API_KEY in environment/config."
            )

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.0,
            )
            return response.choices[0].message.content or ""
        except OpenAIError as e:
            raise ValueError(f"LLM provider failure: {str(e)}")
        except TimeoutError as e:
            raise ValueError(f"LLM provider request timed out: {str(e)}")
