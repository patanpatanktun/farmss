from pydantic import BaseModel
from typing import Optional


class VisionRequest(BaseModel):
    image_url: str                          # 분석할 이미지 URL
    question: Optional[str] = None         # 분석 질문 (없으면 기본 분석)
