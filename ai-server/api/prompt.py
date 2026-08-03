from fastapi import APIRouter, HTTPException
from models.prompt_request import PromptRequest
from services.prompt_service import PromptService

router = APIRouter()
prompt_service = PromptService()


@router.post("/generate")
async def generate_prompt(request: PromptRequest):
    """
    GPT 기반 MMS 마케팅 문구 생성
    """
    try:
        result = await prompt_service.generate(request)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
