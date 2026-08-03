from fastapi import APIRouter, HTTPException
from models.image_request import ImageRequest, Img2ImgRequest
from services.image_service import ImageService
from services.img2img_service import Img2ImgService

router = APIRouter()
image_service = ImageService()
img2img_service = Img2ImgService()


@router.post("/generate")
async def generate_image(request: ImageRequest):
    """
    텍스트 프롬프트로 AI 이미지 생성 (DALL-E 3)
    """
    try:
        result = await image_service.generate(request)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/img2img")
async def img2img(request: Img2ImgRequest):
    """
    기존 이미지를 기반으로 이미지 변환 생성
    """
    try:
        result = await img2img_service.generate(request)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
