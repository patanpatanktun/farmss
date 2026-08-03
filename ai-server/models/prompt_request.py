from pydantic import BaseModel
from typing import Optional, List


class PromptRequest(BaseModel):
    product_name: str                       # 상품명
    target_audience: str                    # 대상 고객 (예: "50대 주부")
    tone: Optional[str] = "친근한"          # 톤앤매너
    keywords: Optional[List[str]] = []     # 강조 키워드
    additional_info: Optional[str] = None  # 추가 요청사항
    max_bytes: Optional[int] = 2000        # 최대 바이트 수 (MMS: 2000byte)
