from fastapi import APIRouter, HTTPException, status
from app.schemas import AIGenerateCaptionRequest, AIGenerateHashtagsRequest, AIGenerateImageRequest, AIResponse
from app.services import AIService

router = APIRouter(prefix="/api/ai", tags=["ai"])

ai_service = AIService()

@router.post("/generate-caption")
async def generate_caption(request: AIGenerateCaptionRequest):
    """Generate AI caption for a post"""
    try:
        caption = await ai_service.generate_caption(
            sport=request.sport,
            context=request.context
        )
        
        return AIResponse(success=True, data=caption)
    except Exception as e:
        return AIResponse(success=False, data="", error=str(e))

@router.post("/generate-hashtags")
async def generate_hashtags(request: AIGenerateHashtagsRequest):
    """Generate hashtags for a post"""
    try:
        hashtags = await ai_service.generate_hashtags(
            caption=request.caption,
            sport=request.sport
        )
        
        return AIResponse(success=True, data=",".join(hashtags))
    except Exception as e:
        return AIResponse(success=False, data="", error=str(e))

@router.post("/generate-image")
async def generate_image(request: AIGenerateImageRequest):
    """Generate image from prompt"""
    try:
        image_url = await ai_service.generate_image(
            prompt=request.prompt,
            sport=request.sport
        )
        
        return AIResponse(success=True, data=image_url)
    except Exception as e:
        return AIResponse(success=False, data="", error=str(e))

@router.post("/analyze-sentiment")
async def analyze_sentiment(text: str):
    """Analyze sentiment of text"""
    try:
        result = await ai_service.analyze_sentiment(text)
        
        return {
            "success": True,
            "sentiment": result["sentiment"],
            "score": result["score"]
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
