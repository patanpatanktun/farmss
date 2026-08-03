from pydantic import BaseModel
from typing import Optional


class ImageRequest(BaseModel):
    subject: str                        # 이미지 주제 (예: "신선한 딸기")
    season: Optional[str] = None        # 계절 (spring / summer / autumn / winter)
    style: Optional[str] = None         # 스타일 (realistic / illustration / watercolor)
    size: Optional[str] = "1024x1024"   # 이미지 크기
    quality: Optional[str] = "standard" # 품질 (standard / hd)
    additionalPrompt: Optional[str] = None  # 추가 프롬프트


class Img2ImgRequest(BaseModel):
    imageUrl: str               # 기준 이미지 URL
    prompt: str                 # 변환 방향 프롬프트
    strength: Optional[float] = 0.7  # 변환 강도 (0.0 ~ 1.0)
