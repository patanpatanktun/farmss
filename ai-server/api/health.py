from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def health_check():
    """
    AI 서버 헬스 체크
    """
    return {
        "status": "ok",
        "service": "FARMSS AI Server",
        "version": "1.0.0"
    }
