from clients.openai_client import OpenAIClient
from models.vision_request import VisionRequest


class VisionService:
    def __init__(self):
        self.client = OpenAIClient()

    async def analyze(self, request: VisionRequest) -> dict:
        """
        GPT-4 Vision을 활용한 이미지 분석
        """
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": request.image_url},
                    },
                    {
                        "type": "text",
                        "text": request.question or "이 농산물 이미지를 분석하고 마케팅 포인트를 알려주세요.",
                    },
                ],
            }
        ]

        response = await self.client.vision_completion(messages=messages)
        analysis = response.choices[0].message.content

        return {
            "analysis": analysis,
            "imageUrl": request.image_url,
        }
