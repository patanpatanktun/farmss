import os
import openai
from dotenv import load_dotenv

load_dotenv()


class OpenAIClient:
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )

    async def generate_image(
        self,
        prompt: str,
        size: str = "1024x1024",
        quality: str = "standard",
        style: str = "natural",
        n: int = 1,
    ):
        """DALL-E 3 이미지 생성"""
        response = await self.client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size=size,
            quality=quality,
            style=style,
            n=n,
        )
        return response

    async def chat_completion(
        self,
        system_prompt: str,
        user_message: str,
        model: str = "gpt-4o",
        temperature: float = 0.7,
        max_tokens: int = 500,
    ):
        """GPT 채팅 완성"""
        response = await self.client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response

    async def vision_completion(
        self,
        messages: list,
        model: str = "gpt-4o",
        max_tokens: int = 1000,
    ):
        """GPT-4 Vision 이미지 분석"""
        response = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=max_tokens,
        )
        return response
