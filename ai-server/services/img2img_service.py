from clients.openai_client import OpenAIClient
from models.image_request import Img2ImgRequest


class Img2ImgService:
    def __init__(self):
        self.client = OpenAIClient()

    async def generate(self, request: Img2ImgRequest) -> dict:
        """
        기존 이미지를 참고하여 새 이미지 생성
        (DALL-E Edit 또는 Variation API 활용)
        """
        # TODO: 이미지 다운로드 후 DALL-E edit/variation API 호출
        return {
            "imageUrl": "",
            "message": "img2img 기능은 구현 예정입니다."
        }
