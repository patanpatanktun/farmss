from clients.openai_client import OpenAIClient
from models.image_request import ImageRequest


class ImageService:
    def __init__(self):
        self.client = OpenAIClient()

    async def generate(self, request: ImageRequest) -> dict:
        """
        DALL-E 3를 활용한 이미지 생성
        """
        # 이미지 생성 프롬프트 구성
        prompt = self._build_prompt(request)

        response = await self.client.generate_image(
            prompt=prompt,
            size=request.size or "1024x1024",
            quality=request.quality or "standard",
            style=request.style or "natural",
        )

        return {
            "imageUrl": response.data[0].url,
            "revisedPrompt": response.data[0].revised_prompt,
        }

    def _build_prompt(self, request: ImageRequest) -> str:
        """
        농업 MMS용 이미지 프롬프트 생성
        """
        base = f"{request.subject}, "
        if request.season:
            base += f"{request.season} season, "
        if request.style:
            base += f"{request.style} style, "
        base += "high quality, professional photography, agricultural marketing"
        return base
