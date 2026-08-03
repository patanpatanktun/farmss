from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.image import router as image_router
from api.prompt import router as prompt_router
from api.vision import router as vision_router
from api.health import router as health_router

app = FastAPI(
    title="FARMSS AI Server",
    description="AI 이미지 생성 및 프롬프트 생성 서버",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(health_router, prefix="/api/health", tags=["health"])
app.include_router(image_router, prefix="/api/image", tags=["image"])
app.include_router(prompt_router, prefix="/api/prompt", tags=["prompt"])
app.include_router(vision_router, prefix="/api/vision", tags=["vision"])


@app.on_event("startup")
async def startup_event():
    print("🌾 FARMSS AI Server started!")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
