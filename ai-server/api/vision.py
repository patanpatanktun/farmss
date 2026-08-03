from fastapi import APIRouter, HTTPException
from models.vision_request import VisionRequest
from services.vision_service import VisionService

router = APIRouter()
vision_service = VisionService()


@router.post("/analyze")
async def analyze_image(request: VisionRequest):
    """
    GPT-4 Vision을 활용한 이미지 분석
    """
    try:
        result = await vision_service.analyze(request)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
